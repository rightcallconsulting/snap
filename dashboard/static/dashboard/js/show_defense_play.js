var formations = [];
var offensiveFormations = [];
var defensivePlays =[];
var plays = [];
var positions = [];
var makeJSONCall = true;
var playScene = false;

function setup() {
  var myCanvas = createCanvas(500, 500);
  field.height = 500;
  field.heightInYards = 53;
  background(58, 135, 70);
  myCanvas.parent('display-play-box-2');
}

function draw() {

  if(makeJSONCall){

    makeJSONCall = false
    $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        var newFormation = createFormationFromJSON(formationObject);
        offensiveFormations.push(newFormation);
      })
      $.getJSON('/quiz/teams/1/defensive_formations', function(data, jqXHR){
        data.forEach(function(formationObject){
          var newFormation = createFormationFromJSON(formationObject);
          formations.push(newFormation);
        })
          $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
            data.forEach(function(position){
              var newPlayer = createPlayerFromJSON(position);
              formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
              offensiveFormation = offensiveFormations.filter(function(formation){return formation.id == position.fields.formation})[0]

              if(formation){
                formation.positions.push(newPlayer);

              }
              if(offensiveFormation){
                offensiveFormation.positions.push(newPlayer);

              }
            })
            offensiveFormations.forEach(function(formation){
              formation.populatePositions();
            })
            defensive_formations.forEach(function(formation){
              formation.populatePositions();
              var defensivePlay = formation.createDefensivePlay();
              defensivePlay.establishOffensiveFormationFromArray(offensiveFormations);
              defensivePlays.push(defensivePlay);
            })

            $.getJSON('/quiz/teams/1/plays', function(data3, jqXHR){
              data3.forEach(function(play){
                var testIDArray = play.fields.tests;
                var play = createPlayFromJSON(play);
                plays.push(play);
              })
              $.getJSON('/quiz/teams/1/plays/players', function(data4, jqXHR){
                data4.forEach(function(position){
                  var player = createPlayerFromJSON(position);
                  positions.push(player);
                })
                plays.forEach(function(play){
                  play.addPositionsFromID(positions);
                  play.populatePositions();
                })
              })
            })
          })

          runTest();
        })

    });
  }

  var runTest = function(){

    // Global Variables
    var letters = ["A", "B", "C", "D", "E"];
    var capitalLetter = false;
    var currentFormation = formations[0];

    var playBeingCreated = new Play({
      playName: "",
      newPlay: true
    });

    Player.prototype.draw = function(field){
      var x = field.getTranslatedX(this.x);
      var y = field.getTranslatedY(this.y);
      var siz = field.yardsToPixels(this.siz);
      if(this.unit === "offense"){
        noStroke();
        fill(this.fill);
        ellipse(x, y, siz, siz);
        fill(0,0,0);
        textSize(14);
        textAlign(CENTER, CENTER);
        text(this.num, x, y);
      }
      else {
        noStroke();
        fill(0,0,0);
        textSize(17);
        textAlign(CENTER, CENTER);
        text(this.pos, x, y);
        if(this.CBAssignment){
          stroke(255, 0, 0);
          line(x, y, field.getTranslatedX(this.CBAssignment.x), field.getTranslatedY(this.CBAssignment.y));
        }
        else if (this.zoneXPoint && this.zoneYPoint){
          this.drawZoneAssignments();
        }
        else if (this.gapXPoint){
          this.drawGapAssignments();
        }
      }
    };

    // NEEDS TO STAY HERE
    Player.prototype.select = function() {
        //this.fill = color(255, 234, 0);
        this.rank = 1;
        this.clicked = true;
        // Unselect all other players to isolate one route
        if (this.unit == "offense"){
          for(var i = 0; i < getCurrentFormation().offensivePlayers.length; i++){
            var p = getCurrentFormation().offensivePlayers[i];
            if(p !== this){
              p.clicked = false;
              p.rank = 0;
            }
          }
        } else{
          // for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
          //   var p = defensePlay.defensivePlayers[i];
          //   if(p !== this){
          //     p.clicked = false;
          //     p.rank = 0;
          //   }
          // }
        }
    };

    // NEEDS TO STAY HERE
    Player.prototype.unselect = function() {
        this.clicked = false;
        this.rank = 0;
    };

    var getCurrentFormation = function(){
      return currentFormation;
    };

    // intro scene
    var drawOpening = function() {
        field.drawBackground(playBeingCreated, height, width)
        if(playToDraw){
          playToDraw.drawAllPlayersWithOffense(field);
        }
        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 330, 20);
        fill(176,176,176)
    };

    // game scene
    var drawScene = function(play) {
        field.drawBackground(play, height, width)
        play.drawAllRoutes(field);
        play.drawAllPlayers(field);
        for(var i = 0; i < play.eligibleReceivers.length; i++){
            play.eligibleReceivers[i].runRoute();
        }

        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 120, 60);
    };

    // Draws the animation
    draw = function() {
      if(playScene === true){
        drawScene(playToDraw);
      }
      else{
        drawOpening();

      }
    }
  }
};
