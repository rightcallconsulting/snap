var selectActive = function(){
  var keyword = "active";
  var nav = document.getElementById('nav');
  var li = nav.getElementsByTagName('li')
  var anchor = nav.getElementsByTagName('a');
  var current = window.location.pathname.split('/')[1];
  if(current === ""){
    li[0].className += " active";
    return;
  }
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
      li[i].className = li[i].className + " active";
    }
  }
}

var setSidebarSize = function(){
  var current = window.location.pathname.split('/')[1];
  var nav = document.getElementById('nav');
  var sidebar = document.getElementById('main-sidebar');
  var container = document.getElementById('main-container');
  if(current === ""){
    sidebar.classList.add('full-sidebar')
    sidebar.classList.remove('small-sidebar')
    if(container){
        container.classList.add('full-sidebar-container');
        container.classList.remove('small-sidebar-container');
    }
  }else{
    sidebar.classList.remove('full-sidebar')
    sidebar.classList.add('small-sidebar')
    if(container){
        container.classList.add('small-sidebar-container');
        container.classList.remove('full-sidebar-container');
    }
  }
}

selectActive();
setSidebarSize();
