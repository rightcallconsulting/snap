$(document).ready(function(){
    //this will hold reference to the tr we have dragged and its helper
    var c = {};
    var groups = [];

    $("#players-table-wrapper tr").draggable({
            helper: "clone",
            start: function(event, ui) {
                c.tr = this;
                c.helper = ui.helper;
                //debugger;
            }
    });

    var resetPlayersTable = function(){
      $("#players-table-wrapper tr").draggable({
              helper: "clone",
              start: function(event, ui) {
                  c.tr = this;
                  c.helper = ui.helper;
                  //debugger;
              }
      });
    };


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

    $('#select-offense-box').on('mouseover', '.offensive-formation-button', function(){
      $('#choose-play').data('button', this.name);
        playClicked = $(this);
        playToDraw = null;
        var offensiveFormationID = Number(this.id);
        var options = defensive_plays.filter(function(play){ return play.playName === defensePlayName; });
        if(options) defensePlayToDraw = options.find(function(play){ return play.offensiveFormationID === offensiveFormationID; });
        document.getElementById('play-image-header').innerHTML = defensePlayToDraw.playName + " vs. " + this.value;
    });

    $('#select-offense-box').on('click', '.offensive-formation-button', function(){
      $('#choose-play').data('button', this.name);
        playClicked = $(this);
        playToDraw = null;
        var offensiveFormationID = Number(this.id);
        var options = defensive_plays.filter(function(play){ return play.playName === defensePlayName; });
        if(options) defensePlayToDraw = options.find(function(play){ return play.offensiveFormationID === offensiveFormationID; });
        document.getElementById('play-image-header').innerHTML = defensePlayToDraw.playName + " vs. " + this.value;
    });

    var selectGroup = function(button){
      var groupID = button.id;
      var groupName = button.value;
      var queryString = "/groups/" + groupID + "/json";
      var users = [];
      var newMiniTable = "";
      var jqxhr = $.getJSON(queryString, function(data){
        data.forEach(function(userObject){
          var u = createUserFromJSON(userObject);
          users.push(u);
        });
        newMiniTable = createMiniUserTable(users);
        /*var playersTableWrapper = document.getElementById('players-table-wrapper');
        if(playersTableWrapper){
          playersTableWrapper.innerHTML = newMiniTable;
        }*/


      });

      jqxhr.complete(function(){
        $('#players-table-wrapper').html(newMiniTable);
        $('#players-table-wrapper').hide();
        $('#players-table-wrapper').show();
        resetPlayersTable();
      })

    };

    $('#select-group-box').on('click', '.group-button', function(){
      selectGroup(this);

    });

});
