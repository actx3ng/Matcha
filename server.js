// Packages Requirement
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const MySQLStore = require("express-mysql-session")(session);
const multer = require("multer");
const socket = require("socket.io");
const User = require("./models/User");
const isNotAuth = require("./middleware/is_not_auth");


var connectedUserId;
// Controllers Requirement
const errorController = require("./controllers/error");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

// initialize
const app = express();
const csrfProtection = csrf();
const sessionStore = new MySQLStore({
  host: "172.17.0.2",
  user: "root",
  password: "1234",
  database: "matcha"
});

// Server Settings
var server = app.listen(3000);

// Socket io
var io = socket(server, {
  pingInterval:  1000 * 60,
  pingTimeout: 1000 * 60,
});
var sockets = {};

app.use((req,res, next) => {
	req.sockets = sockets;
	next();
});

//Configuration for multer
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  }
});
// to filter type of files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  )
    cb(null, true);
  else cb(null, false);
};

// set
app.set("view engine", "ejs");
app.set("views", "views");

// Middlewares
app.use(
  session({
    secret: "atcIdeology",
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
);
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter
  }).single("image")
); // we did here this Middleware to use it in any incoming req to see if the is a file with image name
app.use(csrfProtection);
// we used this two variables in the page every time so it's better to add them in any response
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  connectedUserId = req.session.userId;
  next();
});
// error handler for csurf
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)
  res.json({error:"Hello, we don't do that here!"});
})
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(expressLayouts);
app.use(flash());
app.get("/", isNotAuth,(req, res) => {
  res.render("user/root",{isAuthenticated:0});
});
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin/backdoor/",isNotAuth,adminRouter);
app.use(errorController.error404);

// sockets
io.on('connection', async socket => {
  var keepUser = connectedUserId;
  sockets[connectedUserId] = socket;
  if(typeof connectedUserId !== 'undefined')
  {
    await User.updateUserStatus(1,connectedUserId);
  }
  socket.on('message', async(msg) => {
    if(/^[A-Za-z,-;.'"\s]+$/.test(msg.msg) && typeof msg.msg != "undefined")
    {
      // check if we are matched and not Blocked
      var matched = (await User.checkifMatched(msg.ownerId,msg.receiverId))[0];
      var blocked = (await User.checkifBlocked(msg.ownerId,msg.receiverId))[0];

      if(matched.length == 1 && blocked.length == 0)
      {
        await User.addMessage(msg.ownerId,msg.receiverId,msg.msg);
        if (sockets[msg.receiverId])
        {
          sockets[msg.receiverId].emit('notification',{not: `${msg.ownerUserName} sent you a message.`});
          sockets[msg.receiverId].send(msg);
        }
      }

    }  
  });
  socket.on('disconnect',async() => {
    await User.updateUserStatus(0,keepUser);
    await User.addLastLogin(keepUser);
  });
})

