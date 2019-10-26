const db = require('../util/database');


module.exports = class User {
  constructor(userName, firstName, lastName, email, password,token) {
    this.userName = userName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.token = token;
  }
  add() {
    return db.execute("insert into users(userName,firstName,lastName,email,password,accStat,emailToken,sexPref) values(?,?,?,?,?,?,?,?)", [
      this.userName, this.firstName, this.lastName, this.email, this.password, "not active",this.token,"both"
    ]);
  };
  static findUser(userName) {
    return db.execute('SELECT * FROM users WHERE userName = ?', [userName]);
  }
  static findAccountWithEmail(userName,email)
  {
    return db.execute('SELECT * FROM users WHERE userName = ? AND email = ?', [userName,email]);
  }
  static fetchInterest(userId) {
    return db.execute('SELECT topic FROM interest WHERE user_id = ?', [userId]);
  }
  static fetchImages(userId) {
    return db.execute('SELECT imgPath,imgIndex FROM profilePictures WHERE user_id = ?', [userId]);
  }
  static addToken(userName, token) {
    return db.execute('INSERT INTO users(emailToken) VALUES(?) WHERE userName = ?', [token, userName]);
  }
  static addPassToken(userName, token) {
    return db.execute('UPDATE users SET resetPassToken = ? WHERE userName = ?', [token, userName]);
  }
  static addnewPass(hash, token,userName) {
    return db.execute('UPDATE users SET password = ? WHERE userName = ? AND resetPassToken = ?', [hash, userName,token]);
  }
  static checkTokenEmail(token) {
    console.log(token);
    return db.execute('SELECT * FROM users WHERE emailToken = ?', [token]);
  }
  static checkToken(userName,token) {
    return db.execute('SELECT * FROM users WHERE resetPassToken = ? AND userName = ?', [token,userName]);
  }
  static checkResetToken(token) {
    return db.execute('SELECT * FROM users WHERE emailToken = ?', [token]);
  }
  static activateAccount(token) {
    return db.execute('UPDATE users SET accStat = "active" WHERE emailToken = ?', [token]);
  }
  static accountStatus(userName) {
    return db.execute('SELECT accStat FROM users WHERE userName = ?', [userName]);
  }
  static deleteAllInterest(userId) {
    return db.execute('DELETE FROM interest WHERE user_id = ?', [userId]);
  }
  static fetchUserData(userName) {
    return db.execute('SELECT userName,firstName,lastName,email,gender,sexPref,birthDate,age,bio FROM users WHERE userName = ?', [userName]);
  }
  static addInterest(userId, topic) {
    return db.execute('INSERT INTO interest(user_id,topic) VALUES(?,?)', [userId, topic]);
  }
  static addImage(userId, path, imgIndex) {
    return db.execute('INSERT INTO profilePictures(user_id,imgPath,imgIndex) VALUES(?,?,?)', [userId, path, imgIndex]);
  }
  // GeoLocation
  static firstTimeSaveIpLocation(userName,long,lat)
  {
    return db.execute('INSERT INTO userLocation(userName,ipLong,ipLat) VALUES(?,?,)',[userName,long,lat]);
  }
  static saveIpLocation(userName,long,lat)
  {
    return db.execute('UPDATE userLocation SET ipLong = ?, ipLat = ? WHERE userName = ?',[long,lat,userName]);
  }
  static saveGeoLocation(userName,long,lat)
  {
    return db.execute('UPDATE userLocation SET geoLong = ?, geoLat = ? WHERE userName = ?',[long,lat,userName]);
  }
  static fetchGeoLoc(userName)
  {
    return db.execute('SELECT geoLong,geoLat FROM userLocation WHERE userName = ?',[userName]);
  }
  static deleteImgIndex(userId, imgIndex) {
    return db.execute('DELETE FROM profilePictures WHERE imgIndex = ? AND user_id = ? ', [imgIndex, userId]);
  }
  static checkImgIndex(userId, imgIndex) {
    return db.execute('SELECT * FROM profilePictures WHERE imgIndex = ?', [imgIndex]);
  }
  static updateProfileData(userName, firstName, lastName, email, password, gender, secPredTotal, dateOfBirth, age, bio, sessionUser) {
    console.log(dateOfBirth);
    return db.execute('UPDATE users SET userName = ?, firstName = ?, lastName = ?, email = ?, password = ?, gender = ?, sexPref = ?,birthDate = STR_TO_DATE(REPLACE(?,"/","-"), "%m-%d-%Y"),age = ?,bio = ? WHERE userName = ?;',
      [userName, firstName, lastName, email, password, gender, secPredTotal, dateOfBirth, age, bio, sessionUser]);
  }
}
