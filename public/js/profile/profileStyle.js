function readURL(input, id) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      if( e.target.result != 'data:')
      {
        $('#' + id).css('background-image', 'url(' + e.target.result + ')');
        $('#' + id).hide();
        $('#' + id).fadeIn(100);
  
      }
    }
    
    reader.readAsDataURL(input.files[0]);
  }
}
$("#imageUpload").change(function() {
  readURL(this, "avatarPreview");
});
$("#inputImg1").change(function() {
  readURL(this, "img1");
});
$("#inputImg2").change(function() {
  readURL(this, "img2");
});
$("#inputImg3").change(function() {
  readURL(this, "img3");
});
$("#inputImg4").change(function() {
  readURL(this, "img4");
});

// locationInfo
$("#location").click(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      $("#latitude").html(position.coords.latitude);
      $("#longitude").html(position.coords.longitude);
    });
  } else {
    $(".locationInfo").html("Geolocation is not supported by this browser.");
  }
})


