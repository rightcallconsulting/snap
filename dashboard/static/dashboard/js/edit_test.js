var formations = [];
var plays =[];
var positions = [];
var makeJSONCall = true;
var playScene = false;
var defensePlay

function setup() {
  var myCanvas = createCanvas(500, 500);
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
            formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
            if(formation){
              formation.positions.push(newPlayer);

            }
          })
          formations.forEach(function(formation){
            formation.populatePositions();
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

    Player.prototype.draw = function() {
        if(this.unit === "offense"){
            noStroke();
            if(this.clicked){
                fill(255, 255, 0);
            }else{
                fill(this.fill);
            }
            if (this.change){
              this.x = mouseX;
              this.y = mouseY;
              }
            ellipse(this.x, this.y, this.siz, this.siz);
            fill(0,0,0);
            textSize(14);
            textAlign(CENTER, CENTER);
            if(this.progressionRank > 0){
                text(this.progressionRank, this.x, this.y);
            } else if(this.progressionRank < 0){
              text(letters[-1 - this.progressionRank], this.x, this.y);
            }else{
                text(this.num, this.x, this.y);
            }
            if (this.showRoute && this.breakPoints.length > 0 && !play.clicked){
              this.displayRoute(this.breakPoints);
            }
            if (this.showPreviousRoute){
              stroke(0, 255, 0);
              this.displayRoute(this.previousRouteBreakpoints);
            }
            if (this.showPreviousRouteGuess){
              stroke(255, 0, 0);
              this.displayRoute(this.previousRouteGuess);
            }
        }
        else {
            if(this.clicked){
              fill(0, 0, 255);
            }
            else{
              fill(this.fill);
            }
            textSize(17);
            textAlign(CENTER, CENTER);
            text(this.pos, this.x, this.y);
        }
        this.drawRoute();
        noStroke();
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
    defensePlay.draw(center.x, center.y);

    // intro scene
    var drawOpening = function() {
        field.drawBackground(playBeingCreated, height, width)

        if(playToDraw){
          playToDraw.drawAllPlayers();
          playToDraw.drawAllRoutes();
          text("Formation: "+playToDraw.formation.playName, 115, 20);

        }
        defensePlay.drawAllPlayers();
        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 330, 20);
        fill(176,176,176)
        currentFormation.drawBlockingAssignments();
    };

    // game scene
    var drawScene = function(play) {
        field.drawBackground(play, height, width)
        // defensePlay.drawAllPlayers();
        play.drawAllPlayers();
        for(var i = 0; i < play.eligibleReceivers.length; i++){
            play.eligibleReceivers[i].runRoute();
        }
        for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
            defensePlay.defensivePlayers[i].blitzGap(play.oline[2]);
        }
        play.qb[0].runBootleg(play.oline[2], 1.0);
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
