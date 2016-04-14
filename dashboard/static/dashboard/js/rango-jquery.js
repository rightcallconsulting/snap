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
          var form = document.getElementById('add-player-to-group-form');
          var playerInput = document.getElementById('player-id-input');
          var groupInput = document.getElementById('group-id-input');
          if(form && currentPlayerID && currentGroupID){
            playerInput.value = currentPlayerID;
            groupInput.value = currentGroupID;
            form.submit();
          }else{
            debugger;
          }


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

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
//USE THE ABOVE METHOD AS SUCH TO ACQUIRE CSRF TOKEN FOR JQUERY POSTS:
//var csrftoken = getCookie('csrftoken');


function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

//USE THE ABOVE METHOD AS SUCH, AFTER ACQUIRING CSRF TOKEN, BEFORE JQUERY POST:
/*$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
    }
});*/
