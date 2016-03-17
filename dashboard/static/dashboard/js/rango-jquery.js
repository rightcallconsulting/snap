$(document).ready(function(){
    //this will hold reference to the tr we have dragged and its helper
    var c = {};

    $("#players-table-wrapper tr").draggable({
            helper: "clone",
            start: function(event, ui) {
                c.tr = this;
                c.helper = ui.helper;
                //debugger;
            }
    });


    $("#group-table-wrapper").droppable({
        drop: function(event, ui) {
          var currentGroupID = document.getElementById('current-group-id').innerHTML;
          var currentPlayerID = c.tr.id;
          //post request to add_player_to_group with above two variables
          //on success, add row to table? Refresh table? Might be tricky here with edge cases/load time
            debugger;
            //TBI
        }
    });

    $("input.offensive-formation-button").hover(function(){
      $(this).css("background-color", "yellow"); debugger;
      }, function(){
      $(this).css("background-color", "pink");
    });

});
