var formations = [];
var defensive_formations = [];
var plays = [];
var defensive_plays = [];
var positions = [];
var makeJSONCall = true;
var playScene = false;
var defensePlay;
var defensePlayToDraw = null;
var defensePlayName = "";

function setup() {
  var myCanvas = createCanvas(500, 500);
  field.height = 500;
  background(58, 135, 70);
  myCanvas.parent('display-play-box-2');
}

function draw() {

  if(makeJSONCall){
    makeJSONCall = false
    $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        formationObject.fields.id = formationObject.pk;
        formationObject.fields.positions = [];
        var newFormation = new Formation(formationObject.fields);
        newFormation.playName = formationObject.fields.name;
        formations.push(newFormation);
      })
      $.getJSON('/quiz/teams/1/defensive_formations', function(data, jqXHR){
        data.forEach(function(formationObject){
          var newFormation = createFormationFromJSON(formationObject);
          defensive_formations.push(newFormation);
        })
        $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
          data.forEach(function(position){
            position.fields.id = position.pk;
            position.fields.x = position.fields.startX;
            position.fields.y = position.fields.startY;
            position.fields.pos = position.fields.name;
            position.fields.num = position.fields.pos;
            var newPlayer = new Player(position.fields)
            if(newPlayer.pos==="QB"){
              newPlayer.fill = color(212, 130, 130);
            }
            else if(newPlayer.pos==="OL" || newPlayer.pos ==="LT" || newPlayer.pos ==="LG" || newPlayer.pos ==="C" || newPlayer.pos ==="RG" || newPlayer.pos ==="RT"){
              newPlayer.fill = color(143, 29, 29);
            }
            else{
              newPlayer.fill = color(255, 0, 0);
            }
            var formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
            var defensive_formation = defensive_formations.filter(function(formation){return formation.id == position.fields.formation})[0]
            if(formation){
              formation.positions.push(newPlayer);
            }else if(defensive_formation){
              defensive_formation.positions.push(newPlayer);
            }
          })
          formations.forEach(function(formation){
            formation.populatePositions();
          })
          defensive_formations.forEach(function(formation){
            formation.populatePositions();
            var defensivePlay = formation.createDefensivePlay();
            defensivePlay.establishOffensiveFormationFromArray(formations);
            defensive_plays.push(defensivePlay);
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
              runTest();
            })
          })

        })
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
          this.drawZoneAssignments(field);
        }
        else if (this.gapXPoint){
          this.drawGapAssignments(field);
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
          for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
            var p = defensePlay.defensivePlayers[i];
            if(p !== this){
              p.clicked = false;
              p.rank = 0;
            }
          }
        }
    };

    // NEEDS TO STAY HERE
    Player.prototype.unselect = function() {
        this.clicked = false;
        this.rank = 0;
    };

    // Create Buttons
    var save = new Button({
        x: 10,
        y: 360,
        width: 35,
        label: "Save",
        clicked: false,
        displayButton: true
    });

    var clear = new Button({
        x: 53,
        y: 360,
        width: 40,
        label: "Clear",
        clicked: false,
        displayButton: true
    });

    var getCurrentFormation = function(){
      return currentFormation;
    };

    defensePlay = new DefensivePlay({
      defensePlay: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
      dlNames: ["Gronk", "Davis", "Smith", "Evans"]
    });

    var center = getCurrentFormation().getPlayerFromPosition("C");
    if(center === null){
      center = getCurrentFormation().oline[2];
    }
    defensePlay.draw(field);

    // intro scene
    var drawOpening = function() {
        field.drawBackground(playBeingCreated, height, width)

        if(playToDraw){
          playToDraw.drawAllPlayers(field);
          playToDraw.drawAllRoutes(field);
          defensePlay.drawAllPlayers(field);
          // text("Formation: "+playToDraw.formation.playName, 115, 20);
        }else if(defensePlayToDraw){
          defensePlayToDraw.drawAllPlayersWithOffense(field);
        }

        //currentFormation.drawBlockingAssignments(field, defensePlay);
    };

    // game scene
    var drawScene = function(play) {
        field.drawBackground(play, height, width)
        //defensePlay.drawAllPlayers(field);
        play.drawAllRoutes(field);
        play.drawAllPlayers(field);
        for(var i = 0; i < play.eligibleReceivers.length; i++){
            play.eligibleReceivers[i].runRoute();
        }
        /*for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
            defensePlay.defensivePlayers[i].blitzGap(play.oline[2]);
        }*/
        //play.qb[0].runBootleg(play.oline[2], 1.0);
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
