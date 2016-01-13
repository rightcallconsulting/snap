var selectActive = function(){
  var keyword = "active";
  var nav = document.getElementById('nav');
  var li = nav.getElementsByTagName('li')
  var anchor = nav.getElementsByTagName('a');
  var current = window.location.pathname.split('/')[1];
  for (var i = 0; i < anchor.length; i++) {
    var parts = anchor[i].href.split('/');
    var coreHREF = parts[parts.length-1];
    if(coreHREF === ""){
      var index = li[i].className.indexOf(keyword);
      if(index >= 0){
        li[i].className = li[i].className.substring(0, index) + li[i].className.substring(index+keyword.length);
      }
    }
    else if(coreHREF === current) {
      li[i].className = li[i].className + " " + "active";
    }
  }
}
selectActive();
