var formations = [];
var defensive_formations = [];
var makeJSONCall = true;
var currentFormation;
var playBeingCreated;
var teamIDFromHTML = $('#team-id').data('team-id')
var letters = ["A", "B", "C", "D", "E"];

function setup() {
  var box = document.getElementById('display-box');
  var sidebar = document.getElementById('create-play-col');
  var height = sidebar.offsetHeight - 90;
  var width = box.offsetWidth;
  var myCanvas = createCanvas(width, height);
  createPlayField.height = height;
  createPlayField.width = width;
  createPlayField.heightInYards = 30;
  createPlayField.ballYardLine = 75;
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  window.onresize=function(){
    var box = document.getElementById('display-box');
    var sidebar = document.getElementById('create-play-col');
    var height = sidebar.offsetHeight - 90;
    var width = box.offsetWidth;
    resizeCanvas(width, height);
    createPlayField.height = height;
    createPlayField.width = width;
  }

  if(json_seed){
    for(var i = 0; i < json_seed.offensive_formations.length; i++){
      var formation = createFormationFromJSONSeed(json_seed.offensive_formations[i]);
      formation.positionsToPlayers();
      formation.populatePositions();
      formations.push(formation);
    }
    for(var i = 0; i < json_seed.defensive_formations.length; i++){
      var formation = createFormationFromJSONSeed(json_seed.defensive_formations[i]);
      formation.positionsToPlayers();
      formation.populatePositions();
      defensive_formations.push(formation);
    }

    currentFormation = formations[0];
    if(!currentFormation.defensiveFormationID && defensive_formations.length > 0){
      currentFormation.defensiveFormationID = defensive_formations[0].id;
      currentFormation.defensivePlayObject = defensive_formations[0].createDefensivePlay();
    }
    $('#play-name').text(getCurrentFormation().playName);
    playBeingCreated = new Play({
      playName: "",
      newPlay: true
    });
  }

}

// intro scene
var drawOpening = function() {
    createPlayField.drawBackground(playBeingCreated, height, width)
    // save.draw();
    // clear.draw();
    // formationButtons.forEach(function(button){
      // button.draw();
    // })
    currentFormation.drawBlockingAssignmentObjects(createPlayField);
    currentFormation.drawRunAssignments(createPlayField);
    currentFormation.drawAllPlayers(createPlayField);
    if(currentFormation.defensivePlayObject){
        currentFormation.defensivePlayObject.drawAllPlayers(createPlayField);
    }

};

// game scene
var drawScene = function() {
    createPlayField.drawBackground(playBeingCreated, height, width)
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
  selectedWR = getCurrentFormation().findSelectedWR();
  var selectedOL = getCurrentFormation().findSelectedOL();
  if(selectedWR && key === 'r'){
    if(selectedWR.runner){
      selectedWR.runner = false;
      selectedWR.runAssignment = null;
      //playBeingCreated.runPlay = null;
    } else{
      selectedWR.blocker = false;
      selectedWR.blockingAssignment = null;
      selectedWR.blockingAssignmentObject = null;
      selectedWR.runner = true;
      selectedWR.clearRoute();
    }
    return false;
  }else if(selectedWR && key === 'b'){
    if(selectedWR.blocker){
      selectedWR.blocker = false;
      selectedWR.blockingAssignment = null;
      selectedWR.blockingAssignmentObject = null;
    } else if(selectedWR.runner){
      selectedWR.blocker = true;
      selectedWR.runner = false;
      selectedWR.runAssignment = null;
    } else{
      selectedWR.blocker = true;
      selectedWR.clearRoute();
    }
    return false;
  }else if(selectedWR && key === ' '){
    if(selectedWR.blocker){
      /*selectedWR.blocker = false;
      selectedWR.blockingAssignment = null;
      selectedWR.blockingAssignmentObject = null;*/
    } else if(selectedWR.runner){
      /*selectedWR.blocker = true;
      selectedWR.runner = false;
      selectedWR.runNodes = [];
      playBeingCreated.runPlay = null;*/
    } else{
      //Replace arrow with a stop?
    }
    return false;
  }else if(selectedWR && selectedWR.runAssignment && key === 'e'){
    selectedWR.runAssignment.hasExchanged = !selectedWR.runAssignment.hasExchanged;
    return false;
  }else if(selectedOL && key === ' '){
    if(selectedOL.blockingAssignmentObject){
      if(selectedOL.blockingAssignmentObject.type === ""){
          selectedOL.blockingAssignmentObject.type = "PULL";
      }else{
        selectedOL.blockingAssignmentObject.type = "";
      }

    }
    return false;
  }
  var lcDiff = key.charCodeAt(0)-"a".charCodeAt(0);
  var ucDiff = key.charCodeAt(0)-"A".charCodeAt(0);
  var numDiff = key.charCodeAt(0) - "0".charCodeAt(0);
  if(key.length === 1 && ((lcDiff >= 0 && lcDiff < 26)) || (ucDiff >= 0 && ucDiff < 26) || (numDiff >= 0 && numDiff < 10) ||  key === ' ' || key === '\''){
      playBeingCreated.playName += key;
      var compoundName = getCurrentFormation().playName + ": " + playBeingCreated.playName;
      $('#play-name').text(compoundName);
      return false;
  }
  //return false;
}

keyPressed = function() {
  selectedWR = getCurrentFormation().findSelectedWR();
  var selectedOL = getCurrentFormation().findSelectedOL();
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
  else if (keyCode === BACKSPACE){
    if (selectedWR){
      if(selectedWR.runAssignment){
        selectedWR.runAssignment.stepRunBackward();
      }else if(selectedWR.blocker){
        if(selectedWR.blockingAssignmentObject){
          selectedWR.blockingAssignmentObject.removeLastBlockedPlayer();
        }
      }else{
        selectedWR.stepRouteBackward();
      }
    }else if(selectedOL){
      if(selectedOL.blockingAssignmentObject){
        selectedOL.blockingAssignmentObject.removeLastBlockedPlayer();
      }
    } else{
      playBeingCreated.playName = playBeingCreated.playName.substring(0, playBeingCreated.playName.length - 1);
      var compoundName = getCurrentFormation().playName + ": " + playBeingCreated.playName;
      $('#play-name').text(compoundName);
    }
    return false;
  }else if(keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW || keyCode === DOWN_ARROW || keyCode === UP_ARROW){
    if(selectedOL){
      if(!selectedOL.blockingAssignmentObject){
        selectedOL.blockingAssignmentObject = new BlockingAssignment({

        });
      }
      selectedOL.blockingAssignmentObject.blockedPlayers = [];
      if(keyCode === UP_ARROW){
        selectedOL.blockingAssignmentObject.blockedZone = 0;
      }else if(keyCode === LEFT_ARROW){
        selectedOL.blockingAssignmentObject.blockedZone = 1;
      }else if(keyCode === RIGHT_ARROW){
        selectedOL.blockingAssignmentObject.blockedZone = 2;
      }else{
        selectedOL.blockingAssignmentObject.blockedZone = 3;
      }

    }
  }
  //return false;
};

mouseClicked = function() {
  var field = createPlayField;
  eligibleReceivers = getCurrentFormation().eligibleReceivers;
  var olClicked = getCurrentFormation().mouseInOL(field);
  var dlClicked = getCurrentFormation().defensivePlayObject.mouseInDL(getCurrentFormation(), field);
  var receiverClicked = getCurrentFormation().mouseInReceiverOrNode(field)[0];
  var selectedNode = getCurrentFormation().mouseInReceiverOrNode(field)[1];
  var formationClicked = isFormationClicked(formationButtons, field);
  var selectedOL = getCurrentFormation().findSelectedOL();
  var selectedDL = getCurrentFormation().defensivePlayObject.findSelectedDL();
  selectedWR = getCurrentFormation().findSelectedWR();
  if (formationClicked){
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
    if(selectedWR.runner){
      if(!selectedWR.runAssignment){
        selectedWR.runAssignment = new RunAssignment({

        });
      }
      selectedWR.runAssignment.addCoordinates(createPlayField.getYardX(mouseX), createPlayField.getYardY(mouseY));
    }
    else if(!selectedWR.blocker){
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      selectedWR.routeCoordinates.push([x, y]);
      var nodeObject = new Node({
          x: x,
          y: y,
          siz: 1
      });
      selectedWR.routeNodes.push(nodeObject);
    }
    else if(selectedWR.blocker && dlClicked){
      //OLD
      selectedWR.blockingAssignment = dlClicked;
      selectedWR.blockingAssignmentPlayerIndex = dlClicked.playerIndex;
      selectedWR.blockingAssignmentUnitIndex = dlClicked.unitIndex;

      //NEW
      if(selectedWR.blockingAssignmentObject){
        selectedWR.blockingAssignmentObject.blockedZone = 0;
        selectedWR.blockingAssignmentObject.toggleBlockingPlayer(dlClicked);
      }else{
        selectedWR.blockingAssignmentObject = new BlockingAssignment({
          blockedPlayers: [dlClicked]
        });
      }
    }
  }
  else if(dlClicked && selectedOL){
    selectedOL.blockingAssignment = dlClicked;
    selectedOL.blockingAssignmentPlayerIndex = dlClicked.playerIndex;
    selectedOL.blockingAssignmentUnitIndex = dlClicked.unitIndex;
    if(selectedOL.blockingAssignmentObject){
      selectedOL.blockingAssignmentObject.toggleBlockingPlayer(dlClicked);
      selectedOL.blockingAssignmentObject.blockedZone = 0;
    }else{
      selectedOL.blockingAssignmentObject = new BlockingAssignment({
        blockedPlayers: [dlClicked]
      });
    }
  }
};

mouseDragged = function(){
  var selectedNode = getCurrentFormation().mouseInReceiverOrNode(createPlayField)[1];
  if(selectedNode){
    selectedNode.change = true;
  }
};

var pressSaveButton = function() {
  eligibleReceivers = getCurrentFormation().eligibleReceivers;
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
    pressClearButton();
    getCurrentFormation().feedbackMessage = "Saved!";

};


var pressClearButton = function() {
  getCurrentFormation().clearProgression();
  getCurrentFormation().defensivePlayObject.clearSelections();
  getCurrentFormation().clearRouteDrawings();
  getCurrentFormation().clearBlockingAssignments();
  getCurrentFormation().clearRunAssignments();
  playBeingCreated.runPlay = null;
  playBeingCreated.playName = "";
  getCurrentFormation().feedbackMessage = "";
}

var getCurrentFormation = function(){
  return currentFormation;
};

function draw() {

    Player.prototype.draw = function(field) {
      var x = field.getTranslatedX(this.x);
      var y = field.getTranslatedY(this.y);
      var siz = field.yardsToPixels(this.siz);
        if(this.unit === "offense"){
            noStroke();
            if(this.clicked){
                fill(255, 255, 0);
            }else{
                fill(this.red, this.blue, this.green);
            }
            if (this.change){
              this.x = field.getYardX(mouseX);
              this.y = field.getYardY(mouseY);
            }
            ellipse(x, y, siz, siz);
            fill(0,0,0);
            textSize(14);
            textAlign(CENTER, CENTER);
            if(this.progressionRank > 0){
                text(this.progressionRank, x, y);
            } else if(this.progressionRank < 0){
              text(letters[-1 - this.progressionRank], x, y);
            }else{
                text(this.num, x, y);
            }
            if (this.routeCoordinates.length > 0){
              //this.displayRoute(this.breakPoints);
              this.drawRouteCoordinates(field);
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
            fill(0);
            textSize(17);
            textAlign(CENTER, CENTER);
            text(this.pos, x, y);
        }
        this.drawRoute(field);
        noStroke();
    };

    // NEEDS TO STAY HERE
    Player.prototype.select = function() {
        //this.fill = color(255, 234, 0);

        // Unselect all other players to isolate one route
        if (this.unit == "offense"){
          this.rank = 1;
          this.clicked = !this.clicked;
          for(var i = 0; i < getCurrentFormation().offensivePlayers.length; i++){
            var p = getCurrentFormation().offensivePlayers[i];
            if(p !== this){
              p.clicked = false;
              p.rank = 0;
            }
          }
        } else{

        }
    };

    // NEEDS TO STAY HERE
    Player.prototype.unselect = function() {
        this.clicked = false;
        this.rank = 0;
    };


    // Draws the animation
    drawOpening();

};
