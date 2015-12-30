var formations = [];
if(formations.length == 0){
  $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
    debugger;
    data.forEach(function(formationObject){
      formationObject.fields.id = formationObject.pk
      formationObject.fields.positions = [];
      formations.push(formationObject.fields);
    })
      $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
        data.forEach(function(position){
          position.fields.id = position.pk;
          formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
          formation.positions.push(position.fields);
        })
        debugger;
        runTest();

      })

  });
}

function setup() {
  var myCanvas = createCanvas(400, 600);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {


  var runTest = function(){
    // Trips right formation players
    var tripsRight = new Formation({
      playName: "Trips Right"
    });

    tripsRight.createOLineAndQB();

    var Iformation = new Formation({
        playName: "I-Formation"
    });

    Iformation.createOLineAndQB();

    var goalLine = new Formation({
        playName: "Goal Line"
    });

    goalLine.createOLineAndQB();

    var rb1TripsRight = new Player ({
        x: tripsRight.qb[0].x,
        y: tripsRight.qb[0].y + 60,
        num: 22,
        fill: color(255, 0, 0)
    });

    var te1TripsRight = new Player ({
        x: tripsRight.oline[4].x + 50,
        y: tripsRight.oline[0].y,
        num: 80,
        fill: color(255, 0, 0)
    });
    var te2TripsRight = new Player({
       x: tripsRight.oline[4].x + 120,
       y: tripsRight.oline[4].y,
       num: 17,
       fill: color(255, 0, 0)
    });
    var wr1TripsRight = new Player({
       x: tripsRight.oline[0].x - 80,
       y: tripsRight.oline[4].y + 30,
       num: 88,
       fill: color(255, 0, 0)
    });
    var wr2TripsRight = new Player({
       x: tripsRight.oline[4].x + 80,
       y: tripsRight.oline[4].y + 20,
       num: 84,
       fill: color(255, 0, 0)
    });

    tripsRight.eligibleReceivers.push(rb1TripsRight);
    tripsRight.eligibleReceivers.push(te1TripsRight);
    tripsRight.eligibleReceivers.push(te2TripsRight);
    tripsRight.eligibleReceivers.push(wr1TripsRight);
    tripsRight.eligibleReceivers.push(wr2TripsRight);
    tripsRight.offensivePlayers.push(rb1TripsRight);
    tripsRight.offensivePlayers.push(te1TripsRight);
    tripsRight.offensivePlayers.push(te2TripsRight);
    tripsRight.offensivePlayers.push(wr1TripsRight);
    tripsRight.offensivePlayers.push(wr2TripsRight);

    // I-formation players
    var rb1Iformation = new Player ({
        x: Iformation.qb[0].x,
        y: Iformation.qb[0].y + 60,
        num: 26,
        fill: color(255, 0, 0)
    });

    var te1Iformation = new Player ({
        x: Iformation.oline[4].x + 30,
        y: Iformation.oline[0].y,
        num: 85,
        fill: color(255, 0, 0)
    });
    var te2Iformation = new Player({
       x: Iformation.oline[0].x - 30,
       y: Iformation.oline[0].y,
       num: 13,
       fill: color(255, 0, 0)
    });
    var wr1Iformation = new Player({
       x: Iformation.oline[0].x - 80,
       y: Iformation.oline[4].y + 30,
       num: 83,
       fill: color(255, 0, 0)
    });
    var wr2Iformation = new Player({
       x: Iformation.oline[4].x + 80,
       y: Iformation.oline[4].y + 20,
       num: 82,
       fill: color(255, 0, 0)
    });

    Iformation.eligibleReceivers.push(rb1Iformation);
    Iformation.eligibleReceivers.push(te1Iformation);
    Iformation.eligibleReceivers.push(te2Iformation);
    Iformation.eligibleReceivers.push(wr1Iformation);
    Iformation.eligibleReceivers.push(wr2Iformation);
    Iformation.offensivePlayers.push(rb1Iformation);
    Iformation.offensivePlayers.push(te1Iformation);
    Iformation.offensivePlayers.push(te2Iformation);
    Iformation.offensivePlayers.push(wr1Iformation);
    Iformation.offensivePlayers.push(wr2Iformation);

    // Goal Line players
    var rb1goalLine = new Player ({
        x: goalLine.qb[0].x,
        y: goalLine.qb[0].y + 60,
        num: 26,
        fill: color(255, 0, 0)
    });

    var te1goalLine = new Player ({
        x: goalLine.oline[4].x + 30,
        y: goalLine.oline[0].y,
        num: 85,
        fill: color(255, 0, 0)
    });
    var te2goalLine = new Player({
       x: goalLine.oline[0].x - 30,
       y: goalLine.oline[0].y,
       num: 13,
       fill: color(255, 0, 0)
    });
    var wr1goalLine = new Player({
       x: goalLine.oline[0].x - 60,
       y: goalLine.oline[4].y + 10,
       num: 83,
       fill: color(255, 0, 0)
    });
    var wr2goalLine = new Player({
       x: goalLine.oline[4].x + 60,
       y: goalLine.oline[4].y + 10,
       num: 82,
       fill: color(255, 0, 0)
    });

    goalLine.eligibleReceivers.push(rb1goalLine);
    goalLine.eligibleReceivers.push(te1goalLine);
    goalLine.eligibleReceivers.push(te2goalLine);
    goalLine.eligibleReceivers.push(wr1goalLine);
    goalLine.eligibleReceivers.push(wr2goalLine);
    goalLine.offensivePlayers.push(rb1goalLine);
    goalLine.offensivePlayers.push(te1goalLine);
    goalLine.offensivePlayers.push(te2goalLine);
    goalLine.offensivePlayers.push(wr1goalLine);
    goalLine.offensivePlayers.push(wr2goalLine);

    // Establish formations array
    formations.push(tripsRight);
    formations.push(Iformation);
    formations.push(goalLine);

    // Global Variables

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

    // Will need to interact with database to fetch a formation
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

    defensePlay.draw(getCurrentFormation().oline[2].x, getCurrentFormation().oline[2].y);

    // intro scene
    var drawOpening = function() {
        createPlayField.drawBackground(playBeingCreated, height, width)
        save.draw();
        clear.draw();
        formationButtons.forEach(function(button){
          button.draw();
        })
        currentFormation.drawAllPlayers();
        defensePlay.drawAllPlayers();
        fill(0, 0, 0);
        textSize(20);
        text("Formation: "+getCurrentFormation().playName, 100, 20);
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

    keyReleased = function(){
      if (keyCode === SHIFT){
        capitalLetter = false;
      }
    };

    keyPressed = function() {
      selectedWR = getCurrentFormation().findSelectedWR();
      if (keyCode === SHIFT){
        capitalLetter = true;
      }
      if(keyCode == 38 && selectedWR){
        selectedWR.progressionRank++;
      }
      else if(keyCode == 40 && selectedWR){
        if(selectedWR.progressionRank > 0) selectedWR.progressionRank--;
      }
      else if(keyCode == 66 && selectedWR){
        if(selectedWR.blocker){
          selectedWR.blocker = false;
          selectedWR.blockingAssignment = null;
        } else{
          selectedWR.blocker = true;
          selectedWR.clearRoute();
        }
      }
      else if (keyCode === BACKSPACE){
        if (selectedWR){
          selectedWR.stepRouteBackward();
        } else{
          playBeingCreated.playName = playBeingCreated.playName.substring(0, playBeingCreated.playName.length - 1);
        }
      }
      else{
        playBeingCreated.playName += capitalLetter ? key : key.toLowerCase();
      }
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
          getCurrentFormation().clearRouteDrawings();
          getCurrentFormation().clearProgression();
          getCurrentFormation().clearBlockingAssignments();
          defensePlay.clearSelections();
          playBeingCreated.playName = "";
          getCurrentFormation().feedbackMessage = "Saved!";
          // Logic to save the play to the database
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
        }
      }
      else if(dlClicked && selectedOL){
        selectedOL.blockingAssignment = selectedDL;
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
        drawOpening();
      }
    }
};
