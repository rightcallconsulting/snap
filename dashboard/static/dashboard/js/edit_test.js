var formations = [];
var plays =[];
var positions = [];
var makeJSONCall = true;


function setup() {
  var myCanvas = createCanvas(500, 500);
  background(58, 135, 70);
  myCanvas.parent('display-play-box');
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

    var defensePlay = new DefensivePlay({
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
        createPlayField.drawBackground(playBeingCreated, height, width)
        save.draw();
        clear.draw();
        formationButtons.forEach(function(button){
          button.draw();
        })
        if(formationToDraw){
          formationToDraw.drawAllPlayers();
          text("Formation: "+formationToDraw.playName, 100, 20);

        }
        defensePlay.drawAllPlayers();
        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 330, 20);
        fill(176,176,176)
        currentFormation.drawBlockingAssignments();
    };

    // game scene
    var drawScene = function() {
        createPlayField.drawBackground(playBeingCreated, height, width)
        pause.draw();
        stop.draw();
        pause.displayButton = true;
        stop.displayButton = true;
        save.displayButton = false;
        clear.displayButton = false;
        defensePlay.drawAllPlayers();
        for(var i = 0; i < getCurrentFormation().eligibleReceivers.length; i++){
            getCurrentFormation().eligibleReceivers[i].runRoute();
        }
        for(var i = 0; i < defensivePlayers.length; i++){
            defensivePlayers[i].blitzGap(oline[2]);
        }
        qb[0].runBootleg(oline[2], 1.0);
        fill(0, 0, 0);
        textSize(20);
        text(getCurrentFormation().feedbackMessage, 120, 60);
    };

    keyTyped = function(){
      var lcDiff = key.charCodeAt(0)-"a".charCodeAt(0);
      var ucDiff = key.charCodeAt(0)-"A".charCodeAt(0);
      var numDiff = key.charCodeAt(0) - "0".charCodeAt(0);
      if(key.length === 1 && ((lcDiff >= 0 && lcDiff < 26)) || (ucDiff >= 0 && ucDiff < 26) || (numDiff >= 0 && numDiff < 9) ||  key === ' ' || key === '\''){
          playBeingCreated.playName += key;
      }
      //return false;
    }

    keyPressed = function() {
      selectedWR = getCurrentFormation().findSelectedWR();
      if (keyCode === SHIFT){
        capitalLetter = true;
      }
      if(keyCode == 38 && selectedWR){
        if(selectedWR.progressionRank >= 5){
          selectedWR.progressionRank = 0;
        }else{
          selectedWR.progressionRank++;
        }
      }
      else if(keyCode == 40 && selectedWR){
        if(selectedWR.progressionRank <= -5){
          selectedWR.progressionRank = 0;
        }else{
          selectedWR.progressionRank--;
        }
      }
      else if(keyCode == 66 && selectedWR){
        if(selectedWR.blocker){
          selectedWR.blocker = false;
          selectedWR.blockingAssignment = null;
        } else{
          selectedWR.blocker = true;
          selectedWR.clearRoute();
        }
        return false;
      }
      else if (keyCode === BACKSPACE){
        if (selectedWR){
          selectedWR.stepRouteBackward();
        } else{
          playBeingCreated.playName = playBeingCreated.playName.substring(0, playBeingCreated.playName.length - 1);
        }
        return false;
      }
      //return false;
    };

    mouseClicked = function() {
      eligibleReceivers = getCurrentFormation().eligibleReceivers;
      var olClicked = getCurrentFormation().mouseInOL();
      var dlClicked = defensePlay.mouseInDL(getCurrentFormation());
      var receiverClicked = getCurrentFormation().mouseInReceiverOrNode()[0];
      var selectedNode = getCurrentFormation().mouseInReceiverOrNode()[1];
      var formationClicked = isFormationClicked(formationButtons);
      var selectedOL = getCurrentFormation().findSelectedOL();
      var selectedDL = defensePlay.findSelectedDL();
      selectedWR = getCurrentFormation().findSelectedWR();
      if (clear.isMouseInside()){
        getCurrentFormation().clearProgression();
        defensePlay.clearSelections();
        getCurrentFormation().clearRouteDrawings();
        getCurrentFormation().clearBlockingAssignments();
        getCurrentFormation().feedbackMessage = "";
      }
      else if (save.isMouseInside()) {

        //TO-DO: PLENTY OF VALIDATION/ERROR CHECKING THAT WE CAN DO HERE AND ALERT USER/ABORT SAVE

          eligibleReceivers.forEach(function(player){
            player.convertRouteDrawingToBreakPoints();
          })
          var newPlay = new Play({
              eligibleReceivers: eligibleReceivers,
              offensivePlayers: getCurrentFormation().offensivePlayers,
              name: playBeingCreated.playName,
              qb: getCurrentFormation().qb,
              oline: getCurrentFormation().oline,
              formation: getCurrentFormation()
          });
          // Logic to save the play to the database
          newPlay.saveToDB();
          getCurrentFormation().clearRouteDrawings();
          getCurrentFormation().clearProgression();
          getCurrentFormation().clearBlockingAssignments();
          defensePlay.clearSelections();
          playBeingCreated.playName = "";
          getCurrentFormation().feedbackMessage = "Saved!";
      }
      else if (formationClicked){
        currentFormation = formations.filter(function(formation) {
          return formation.playName == formationClicked.label;
        })[0];
      }
      else if(selectedNode){
        if (selectedNode.change){
          selectedNode.change = false;
        }
        else{
          selectedNode.change = true;
        }
      }
      else if (receiverClicked){

          var playerSelected = false;
          getCurrentFormation().clearPreviousRouteDisplays();
          for(var i = 0; i < eligibleReceivers.length; i++){
              if(receiverClicked.clicked){
                  receiverClicked.unselect();
                  receiverClicked.showRoute = false;
              }else{
                  receiverClicked.select();
              }
              break;
          }
      }
      else if(selectedWR){
        if(!selectedWR.blocker){
          selectedWR.routeCoordinates.push([mouseX, mouseY]);
          var nodeObject = new Node({
              x: mouseX,
              y: mouseY,
              siz: 10
          });
          selectedWR.routeNodes.push(nodeObject);
        }
        else if(selectedWR.blocker && dlClicked){
          selectedWR.blockingAssignment = selectedDL;
          selectedWR.blockingAssignmentPlayerIndex = selectedDL.playerIndex;
          selectedWR.blockingAssignmentUnitIndex = selectedDL.unitIndex;
        }
      }
      else if(dlClicked && selectedOL){
        selectedOL.blockingAssignment = selectedDL;
        selectedOL.blockingAssignmentPlayerIndex = selectedDL.playerIndex;
        selectedOL.blockingAssignmentUnitIndex = selectedDL.unitIndex;
      }
    };

    mouseDragged = function(){
      var selectedNode = getCurrentFormation().mouseInReceiverOrNode()[1];
      if(selectedNode){
        selectedNode.change = true;
      }
    };

    createFormationButtons(formations);
    // Draws the animation
    draw = function() {
      if(formationToDraw){
        formationToDraw.drawAllPlayers();
      }
        drawOpening();
      }
    }
};
