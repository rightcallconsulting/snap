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
  formationExample.createOLineAndQB(field.ballYardLine);
  formationExample.changeablePlayers.push(formationExample.qb[0]);


  // Global Variables
  var capitalLetter = false;

  Player.prototype.draw = function() {
    var x = field.getTranslatedX(this.x);
    if(!x){
      //debugger;
    }
    var y = field.getTranslatedY(this.y);
    var siz = field.yardsToPixels(this.siz);
    if(this.unit === "offense"){
      noStroke();
      fill(this.red, this.green, this.blue);
      if(this.num === "WR"){
        //debugger;
      }
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(this.red, this.green, this.blue);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  };

  // Create Buttons
  var trash = new Button({
      x: field.getYardX(width * 0.8),
      y: field.getYardY(height * 0.88),
      width: field.pixelsToYards(width * 0.12),
      height: field.pixelsToYards(width * 0.08),
      label: "Trash",
      clicked: false,
      displayButton: true
  });

  // Create Position groups

  var rb = new Player ({
      x: field.getXOffset() + 15,
      y: field.getYardY(height)+3,
      siz:3,
      num: 'RB',
      // fill: color(255, 0, 0)
      red: 255,
      green: 0,
      blue: 0,
      pos: 'RB'
  });

  var te = new Player ({
    x: field.getXOffset() + 20,
    y: field.getYardY(height)+3,
    siz:3,
      num: 'TE',
      // fill: color(255, 0, 0)
      red: 255,
      green: 0,
      blue: 0,
      pos: 'TE'
  });

  var wr = new Player({
    x: field.getXOffset() + 25,
    y: field.getYardY(height)+3,
    siz:3,
     num: 'WR',
    //  fill: color(255, 0, 0)
    red: 255,
    green: 0,
    blue: 0,
    pos: 'WR'
  });

  //debugger;

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
      trash.draw(field);
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
           player.y < trash.y &&
           player.y > trash.y - trash.height
  };

  keyTyped = function(){
    var lcDiff = key.charCodeAt(0)-"a".charCodeAt(0);
    var ucDiff = key.charCodeAt(0)-"A".charCodeAt(0);
    var numDiff = key.charCodeAt(0)-"0".charCodeAt(0);
    if(key.length === 1 && ((lcDiff >= 0 && lcDiff < 26)) || (ucDiff >= 0 && ucDiff < 26) || (numDiff >= 0 && numDiff < 10) || key === ' '){
        formationExample.playName += key;
    }
    //return false;
  }

  keyPressed = function() {
    selectedWR = formationExample.findSelectedWR();
    if (keyCode === BACKSPACE){
      if (selectedWR){
        selectedWR.stepRouteBackward();
      } else{
        formationExample.playName = formationExample.playName.substring(0, formationExample.playName.length - 1);
      }
      return false;
    }

  };

  mouseDragged = function(){
    var receiverClicked = formationExample.mouseInReceiverOrNode(field)[0];
    var positionOptionSelected = formationExample.mouseInOptionsToCreate(field);
    if (formationExample.establishingNewPlayer){
      formationExample.establishingNewPlayer.movePlayer(field);
    }
    else if (receiverClicked){
      receiverClicked.change = receiverClicked.change ?  false : true;
      formationExample.establishingNewPlayer = receiverClicked;
    }
    else if (formationExample.qb[0].isMouseInside(field)){
      formationExample.qb[0].change = formationExample.qb[0].change ?  false : true;
      formationExample.establishingNewPlayer = formationExample.qb[0];
    }
    else if (positionOptionSelected){
      var newPlayer = new Player({
        x: positionOptionSelected.x,
        y: positionOptionSelected.y,
        num: positionOptionSelected.num,
        siz:2.99,
        // fill: color(255, 0, 0),
        red: 255,
        green: 0,
        blue: 0,
        change: true,
        pos: positionOptionSelected.pos
      })
      formationExample.createPlayer(newPlayer);
    }
    var receiverClicked = formationExample.mouseInReceiverOrNode(field)[0];
    selectedWR = formationExample.findSelectedWR();
  };

  pressSaveButton = function() {
    if(formationExample.validFormation()){
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

    } else{
      formationExample.feedbackMessage = "Invalid Formation"
    }
  }

  pressClearButton = function() {
    formationExample.removeAllPlayers();
  }

  mouseClicked = function() {
    var receiverClicked = formationExample.mouseInReceiverOrNode(field)[0];
    selectedWR = formationExample.findSelectedWR();
    if (formationExample.establishingNewPlayer){
      if(isInsideTrash(formationExample.establishingNewPlayer)){
        formationExample.deletePlayer(formationExample.establishingNewPlayer);
      }
      formationExample.establishingNewPlayer.change = false;
      formationExample.establishingNewPlayer = null;
    }
  };

  draw = function() {
    drawOpening();
  }
};
