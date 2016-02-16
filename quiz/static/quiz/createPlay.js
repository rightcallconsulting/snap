var formations = [];
var makeJSONCall = true;
var currentFormation
var teamIDFromHTML = $('#team-id').data('team-id')

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {

  if(makeJSONCall){
    makeJSONCall = false
    $.getJSON('/quiz/teams/'+teamIDFromHTML+'/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        formationObject.fields.id = formationObject.pk;
        formationObject.fields.positions = [];
        var newFormation = new Formation(formationObject.fields);
        newFormation.playName = formationObject.fields.name;
        formations.push(newFormation);
      })
        $.getJSON('/quiz/teams/'+teamIDFromHTML+'/formations/positions', function(data, jqXHR){
          data.forEach(function(position){
            position.fields.id = position.pk;
            position.fields.x = position.fields.startX;
            position.fields.y = position.fields.startY;
            position.fields.pos = position.fields.name;
            position.fields.num = position.fields.pos;
            var newPlayer = new Player(position.fields)
            if(newPlayer.pos==="QB"){
              newPlayer.setFill(212, 130, 130);
            }
            else if(newPlayer.pos==="OL" || newPlayer.pos ==="LT" || newPlayer.pos ==="LG" || newPlayer.pos ==="C" || newPlayer.pos ==="RG" || newPlayer.pos ==="RT"){
              newPlayer.setFill(143, 29, 29);
            }
            else{
              newPlayer.setFill(255, 0, 0);
            }
            formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
            if(formation){
              formation.positions.push(newPlayer);
            }
          })
          formations.forEach(function(formation){
            formation.populatePositions();
          })
          runTest();

        })

    });
  }

  var runTest = function(){

    // Global Variables
    var letters = ["A", "B", "C", "D", "E"];

    var capitalLetter = false;
    currentFormation = formations[0];

    var playBeingCreated = new Play({
      playName: "",
      newPlay: true
    });

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
          this.clicked = true;
          for(var i = 0; i < getCurrentFormation().offensivePlayers.length; i++){
            var p = getCurrentFormation().offensivePlayers[i];
            if(p !== this){
              p.clicked = false;
              p.rank = 0;
            }
          }
        } else{
          /*for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
            var p = defensePlay.defensivePlayers[i];
            if(p !== this){
              p.clicked = false;
              p.rank = 0;
            }
          }*/
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
    defensePlay.draw(field);

    // intro scene
    var drawOpening = function() {
        createPlayField.drawBackground(playBeingCreated, height, width)
        // save.draw();
        // clear.draw();
        // formationButtons.forEach(function(button){
          // button.draw();
        // })
        currentFormation.drawAllPlayers(field);
        defensePlay.drawAllPlayers(field);
        fill(0, 0, 0);
        textSize(20);
        // text("Formation: "+getCurrentFormation().playName, 100, 20);
        text(getCurrentFormation().feedbackMessage, 330, 20);
        fill(176,176,176)
        currentFormation.drawBlockingAssignments(field);
        if(playBeingCreated && playBeingCreated.runPlay){
          playBeingCreated.runPlay.draw(field);
        }
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
        defensePlay.drawAllPlayers(field);
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
      if(selectedWR && key === 'r'){
        if(selectedWR.runner){
          selectedWR.runner = false;
          selectedWR.runNodes = [];
          playBeingCreated.runPlay = null;
        } else{
          selectedWR.blocker = false;
          selectedWR.blockingAssignment = null;
          selectedWR.runner = true;
          selectedWR.clearRoute();
        }
        return false;
      }else if(selectedWR && key === 'b'){
        if(selectedWR.blocker){
          selectedWR.blocker = false;
          selectedWR.blockingAssignment = null;
        } else if(selectedWR.runner){
          selectedWR.blocker = true;
          selectedWR.runner = false;
          selectedWR.runNodes = [];
          playBeingCreated.runPlay = null;
        } else{
          selectedWR.blocker = true;
          selectedWR.clearRoute();
        }
        return false;
      }
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
      else if (keyCode === BACKSPACE){
        if (selectedWR){
          if(selectedWR.runner){
            playBeingCreated.runPlay.stepRunBackward();
          }else{
            selectedWR.stepRouteBackward();
          }
        } else{
          playBeingCreated.playName = playBeingCreated.playName.substring(0, playBeingCreated.playName.length - 1);
        }
        return false;
      }
      //return false;
    };

    mouseClicked = function() {
      eligibleReceivers = getCurrentFormation().eligibleReceivers;
      var olClicked = getCurrentFormation().mouseInOL(field);
      var dlClicked = defensePlay.mouseInDL(getCurrentFormation(), field);
      var receiverClicked = getCurrentFormation().mouseInReceiverOrNode(field)[0];
      var selectedNode = getCurrentFormation().mouseInReceiverOrNode(field)[1];
      var formationClicked = isFormationClicked(formationButtons, field);
      var selectedOL = getCurrentFormation().findSelectedOL();
      var selectedDL = defensePlay.findSelectedDL();
      selectedWR = getCurrentFormation().findSelectedWR();
      if (clear.isMouseInside(field)){
        pressClearButton();
      }
      else if (save.isMouseInside(field)) {
        pressSaveButton();
          // DELETE THE BELOW COMMENTS IF NO BUGS
          // eligibleReceivers.forEach(function(player){
          //   player.convertRouteDrawingToBreakPoints();
          // })
          // var newPlay = new Play({
          //     eligibleReceivers: eligibleReceivers,
          //     offensivePlayers: getCurrentFormation().offensivePlayers,
          //     name: playBeingCreated.playName,
          //     qb: getCurrentFormation().qb,
          //     oline: getCurrentFormation().oline,
          //     formation: getCurrentFormation()
          // });
          // // Logic to save the play to the database
          // newPlay.saveToDB();
          // getCurrentFormation().clearRouteDrawings();
          // getCurrentFormation().clearProgression();
          // getCurrentFormation().clearBlockingAssignments();
          // defensePlay.clearSelections();
          // playBeingCreated.playName = "";
          // getCurrentFormation().feedbackMessage = "Saved!";
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
        if(selectedWR.runner){
          if(!playBeingCreated.runPlay || playBeingCreated.runPlay.ballRecipient !== selectedWR){
            playBeingCreated.runPlay = new RunPlay({
              ballCarrier: getCurrentFormation().qb[0],
              ballRecipient: selectedWR
            });
            playBeingCreated.runPlay.carrierBreakPoints.push([playBeingCreated.runPlay.ballCarrier.x, playBeingCreated.runPlay.ballCarrier.y]);
            playBeingCreated.runPlay.recipientBreakPoints.push([playBeingCreated.runPlay.ballRecipient.x, playBeingCreated.runPlay.ballRecipient.y]);
          }
          playBeingCreated.runPlay.recipientBreakPoints.push([field.getYardX(mouseX), field.getYardY(mouseY)]);
          selectedWR.runNodes.push(new Node({
            fill: color(0,0,255),
            x: field.getYardX(mouseX),
            y: field.getYardY(mouseY),
            siz: 1
          }));
          /*if(playBeingCreated.runPlay.exchangePoints.length < 1){
            playBeingCreated.runPlay.exchangePoints.push([field.getYardX(mouseX), field.getYardY(mouseY)]);
          }else{
            playBeingCreated.runPlay.recipientDestination.push([field.getYardX(mouseX), field.getYardY(mouseY)]);
          }*/
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
          selectedWR.blockingAssignment = dlClicked;
          selectedWR.blockingAssignmentPlayerIndex = dlClicked.playerIndex;
          selectedWR.blockingAssignmentUnitIndex = dlClicked.unitIndex;
        }
      }
      else if(dlClicked && selectedOL){
        selectedOL.blockingAssignment = dlClicked;
        selectedOL.blockingAssignmentPlayerIndex = dlClicked.playerIndex;
        selectedOL.blockingAssignmentUnitIndex = dlClicked.unitIndex;
      }
    };

    mouseDragged = function(){
      var selectedNode = getCurrentFormation().mouseInReceiverOrNode(field)[1];
      if(selectedNode){
        selectedNode.change = true;
      }
    };

    pressSaveButton = function() {
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
        getCurrentFormation().clearRouteDrawings();
        getCurrentFormation().clearProgression();
        getCurrentFormation().clearBlockingAssignments();
        defensePlay.clearSelections();
        playBeingCreated.playName = "";
        getCurrentFormation().feedbackMessage = "Saved!";

    };


    pressClearButton = function() {
      getCurrentFormation().clearProgression();
      defensePlay.clearSelections();
      getCurrentFormation().clearRouteDrawings();
      getCurrentFormation().clearBlockingAssignments();
      getCurrentFormation().feedbackMessage = "";
    }

    createFormationButtons(formations);
    // Draws the animation
    draw = function() {
        drawOpening();
      }
    $('#play-image-header').text(getCurrentFormation().playName);

    }
};
