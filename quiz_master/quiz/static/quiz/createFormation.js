function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {

  //Field Position Variables

  //Field Position Variables
  var scoreboard = new Scoreboard({

  });

  // Create Position groups
  var formationExample = new Formation({
  })
  formationExample.createOLineAndQB();
  formationExample.changeablePlayers.push(formationExample.qb[0]);

  // Global Variables
  var capitalLetter = false;

  Player.prototype.draw = function() {
      if(this.unit === "offense"){
          noStroke();
          if(this.rank > 0){
              fill(255, 255, 0);
          }else{
              fill(this.red, this.green, this.blue);
          }
          if (this.change){
            this.x = mouseX;
            this.y = mouseY;
            }
          ellipse(this.x, this.y, this.siz, this.siz);
          fill(0,0,0);
          textSize(14);
          textAlign(CENTER, CENTER);
          if(this.rank > 0){
              text(this.rank, this.x, this.y);
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
          fill(this.red, this.green, this.blue);
          textSize(17);
          textAlign(CENTER, CENTER);
          text(this.pos, this.x, this.y);
      }
      this.drawRoute();
      noStroke();
  };

  Player.prototype.select = function() {
      //this.red, this.green, this.blue = color(255, 234, 0);
      this.rank = 1;
      this.clicked = true;
      // Unselect all other players to isolate one route
      for(var i = 0; i < formationExample.eligibleReceivers.length; i++){
        var p = formationExample.eligibleReceivers[i];
        if(p !== this){
          p.clicked = false;
          p.rank = 0;
        }
      }
  };

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

  var trash = new Button({
      x: 330,
      y: 360,
      width: 40,
      label: "Trash",
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

  // Create Position groups

  var rb = new Player ({
      x: 130,
      y: 375,
      num: 'RB',
      // fill: color(255, 0, 0)
      red: 255,
      green: 0,
      blue: 0,
      pos: 'RB'
  });

  var te = new Player ({
      x: 170,
      y: 375,
      num: 'TE',
      // fill: color(255, 0, 0)
      red: 255,
      green: 0,
      blue: 0,
      pos: 'TE'
  });

  var wr = new Player({
     x: 210,
     y: 375,
     num: 'WR',
    //  fill: color(255, 0, 0)
    red: 255,
    green: 0,
    blue: 0,
    pos: 'WR'
  });

  formationExample.optionsToCreate.push(rb);
  formationExample.optionsToCreate.push(wr);
  formationExample.optionsToCreate.push(te);

  var defensePlay = new DefensivePlay({
    defensivePlayers: [],
    dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
    lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
    dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
    dlPositions: ["DE", "NT", "DT", "RE"],
    lbPositions: ["W", "M", "S"],
    dbPositions: ["CB", "SS", "F/S", "CB"],
    dlNames: ["Gronk", "Davis", "Smith", "Evans"]
  });

  defensePlay.draw(formationExample.oline[2].x, formationExample.oline[2].y);

  // intro scene
  var drawOpening = function() {
      field.drawBackground(formationExample, height, width);
      save.draw();
      clear.draw();
      trash.draw();
      formationExample.drawOptionsToCreate();
      formationExample.drawOLQB();
      formationExample.drawAllPlayers();
      defensePlay.drawAllPlayers();
      fill(0, 0, 0);
      textSize(20);
      text(formationExample.feedbackMessage, 330, 20);
      fill(176,176,176)
  };

  var isInsideTrash = function(player){
    return player.x > trash.x &&
           player.x < trash.x + trash.width &&
           player.y > trash.y &&
           player.y < trash.y + trash.height
  };

  keyReleased = function(){
    if (keyCode === SHIFT){
      capitalLetter = false;
    }
  };

  keyPressed = function() {
    selectedWR = formationExample.findSelectedWR();
    if (keyCode === SHIFT){
      capitalLetter = true;
    }
    if (keyCode === BACKSPACE){
      if (selectedWR){
        selectedWR.stepRouteBackward();
      } else{
        formationExample.playName = formationExample.playName.substring(0, formationExample.playName.length - 1);
      }
    }
    else{
      formationExample.playName += capitalLetter ? key : key.toLowerCase();
    }
  };

  mouseDragged = function(){
    var receiverClicked = formationExample.mouseInReceiverOrNode()[0];
    var selectedNode = formationExample.mouseInReceiverOrNode()[1];
    var positionOptionSelected = formationExample.mouseInOptionsToCreate();
    if (formationExample.establishingNewPlayer){
      formationExample.establishingNewPlayer.movePlayer();
    }
    else if (receiverClicked){
      receiverClicked.change = receiverClicked.change ?  false : true;
      formationExample.establishingNewPlayer = receiverClicked;
    }
    else if (positionOptionSelected){
      var newPlayer = new Player({
        x: positionOptionSelected.x,
        y: positionOptionSelected.y,
        num: positionOptionSelected.num,
        // fill: color(255, 0, 0),
        red: 255,
        green: 0,
        blue: 0,
        change: true,
        pos: positionOptionSelected.pos
      })
      formationExample.createPlayer(newPlayer);
    }
    else if (clear.isMouseInside()){
      formationExample.removeAllPlayers();
    }
    var receiverClicked = formationExample.mouseInReceiverOrNode()[0];
    var selectedNode = formationExample.mouseInReceiverOrNode()[1];
    selectedWR = formationExample.findSelectedWR();
    if(selectedNode){
      selectedNode.change = true;
    }
  };

  mouseClicked = function() {
    var receiverClicked = formationExample.mouseInReceiverOrNode()[0];
    var selectedNode = formationExample.mouseInReceiverOrNode()[1];
    selectedWR = formationExample.findSelectedWR();
    if (formationExample.establishingNewPlayer){
      if(isInsideTrash(formationExample.establishingNewPlayer)){
        formationExample.deletePlayer(formationExample.establishingNewPlayer);
      }
      formationExample.establishingNewPlayer.change = false;
      formationExample.establishingNewPlayer = null;
    }
    else if (clear.isMouseInside()){
      formationExample.removeAllPlayers();
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
        for(var i = 0; i < formationExample.eligibleReceivers.length; i++){
            var p = formationExample.eligibleReceivers[i];
            if (p.isMouseInside()){
                if(p.clicked){
                    p.unselect();
                    p.showRoute = false;
                }else{
                    p.select();
                }
                break;
            }
        }
    }
    else if(selectedWR){
      selectedWR.routeCoordinates.push([mouseX, mouseY]);
      var nodeObject = new Node({
          x: mouseX,
          y: mouseY,
          siz: 10
      });
      selectedWR.routeNodes.push(nodeObject);
    }
    else if (save.isMouseInside()) {
      if(formationExample.validPlay()){
        formationExample.eligibleReceivers.forEach(function(player){
          player.convertRouteDrawingToBreakPoints();
        })
        var newFormation = new Formation({
            eligibleReceivers: formationExample.eligibleReceivers,
            playName: formationExample.playName,
            qb: formationExample.qb,
            oline: formationExample.oline,
            offensivePlayers: formationExample.offensivePlayers,
            unit: formationExample.unit
        });
        newFormation.saveToDB();
        formationExample.removeAllPlayers();
        formationExample.playName = "";
        formationExample.feedbackMessage = "Saved!"
        // Logic to save the play to the database

      } else{
        formationExample.feedbackMessage = "Invalid Play"
      }
    }
  };

  draw = function() {
    drawOpening();
  }
};
