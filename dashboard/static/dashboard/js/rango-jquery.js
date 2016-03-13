$(document).ready(function() {
  var version = "";
  var isLoaded = false;
  var isLoaded2 = false;
  if($.fn.jquery){
    version = $.fn.jquery;
    isLoaded1 = true;
    if($.ui && $.ui.version){
      isLoaded2 = true;
    }
  }
  debugger;
  $( "#dialog1" ).dialog({
    autoOpen: false
  });

  $("#opener").click(function() {
    $("#dialog1").dialog('open');
  });

});
