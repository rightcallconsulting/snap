function setup() {
  createCanvas(400, 400);
  background(58, 135, 70);
}

function draw() {

  //Field Position Variables



  // Global Variables
var correctAnswerMessage = "You got it, dude";
var SPEED = 1;
var changeablePlayers = [];
var RANK = 1;
var QUESTION_NUM = 0;
var QUESTIONS_ANSWERED = 0;
var SCORE = 0;
var capitalLetter = false;
var establishingNewPlayer = null;
var INCORRECT_GUESSES = 0;
var SKIPS = 0;
var SKIP_PENALTY = 1;
var BAD_GUESS_PENALTY = 0.1;
var cutOff = 50;
var playName = "";
var plays = [];
var answerSheet = [[1,2,3,4],[0,1,2,3,4],[0,1,2,3]];
//0 - slant, 1 - arrow, 2 - post, 3 - deep post,  4- fade, 5 - corner
var routeCombos = [[0,2,3,4,1],[2,0,3,4,1],[0,2,5,4,1]];
//index of eligibleReceivers array
var lbAssignments = [[,-3,-4],[-3,1,4],[-3,0,8]]; //positive = gaps, negative = coverage
var dlAssignments = [[5,1,2,6],[5,1,2,6],[5,1,2,6]];
var dbAssignments = [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]];
var eligibleReceivers = [];
var currentPlayer = null;
var heightInYards = 30;
var LEFT_FLAT = [0, height/2,width/2,height/4];
var RIGHT_FLAT = [width/2,height/2,width,height/4];

var defensivePlayers = [];
var offensivePlayers = [];
var startTime = 0; var endTime = 0;
var feedbackMessage = "";
var inProgress = false;

var getDestination = function(distance, theta, x, y){
    var xDist = distance*Math.cos(theta);
    var yDist = -1*distance*Math.sin(theta);
    return [x + xDist, y + yDist];
};

var getFlat = function(sideOfField){
    var y1 = height/2;
    var y2 = height/3;

    var x1 = 0;
    if(sideOfField > 0){
        x1 = width/2;
    }
    var x2 = x1 + width / 2;

    return [x1,y1,x2,y2];

};

var getDeepThird = function(sideOfField){
        var y1 = 0;
        var y2 = height/6;
        var x1 = 0;
            if(sideOfField > 0){
                x1 = width / 2;
            }
        var x2 = (x1 + width / 2);

            return [x1, y1, x2, y2];
};
var getDropZone = function(areaOfField){
        var y1 = height/6;
        var y2 = height/3;
        var x1 = 0;
            for(var i = 0; i < 3; i++){
                x1 = (i + width/3);
            }
            x2 = (x1 + width/3);

            return [x1, x2, y1, y2];
}

// var getScoreString = function(score) {
//     var questionsRemaining = answerSheet.length - QUESTIONS_ANSWERED - 1;
//     var scorePercentage = (100*SCORE/(QUESTIONS_ANSWERED)) ? (100*SCORE/(QUESTIONS_ANSWERED)).toFixed(0) + "%" : "N/A";
//     if (QUESTIONS_ANSWERED >= answerSheet.length){
//       return "Q" + (QUESTIONS_ANSWERED) + "/" + "Q" + answerSheet.length + ", " + scorePercentage;
//     } else {
//       return "Q" + (QUESTIONS_ANSWERED + 1) + "/" + "Q" + answerSheet.length + ", " + scorePercentage;
//     }
// };

//Scoreboard object
var Scoreboard = function(config){
    this.x = 330;
    this.y = 30;
    this.width = 500;
    this.height = 50;
    this.fill = config.fill || color(255, 255, 255);
};

Scoreboard.prototype.draw = function() {
    fill(0, 0, 0);
    textSize(18);
    textAlign(CENTER, CENTER);
    // text(getScoreString(), this.x, this.y);
};

// Button object
var Button = function(config) {
    this.x = config.x || 0;
    this.y = config.y || 360;
    this.width = config.width || 60;
    this.height = config.height || 30;
    this.label = config.label || "Click";
    this.clicked = config.clicked || false;
    this.fill = config.fill || color(255, 255, 255);
    this.displayButton = config.displayButton || false;
};

Button.prototype.draw = function() {
    fill(this.fill);
    rect(this.x, this.y, this.width, this.height);
    fill(0, 0, 0);
    textSize(12);
    textAlign(LEFT, TOP);
    text(this.label, this.x+5, this.y+this.height/4);
};

Button.prototype.isMouseInside = function() {
    return this.displayButton &&
           mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};

Button.prototype.changeClickStatus = function() {
    if (this.clicked) {
        this.fill = color(255, 255, 255);
        this.clicked = false;
        this.draw();
    } else {
        this.fill = color(176, 176, 176);
        this.clicked = true;
        this.draw();
    }
};

var Node = function(config){
  this.x = config.x;
  this.y = config.y;
  this.siz = config.siz;
  this.change = false;
};

Node.prototype.isMouseInside = function() {
    return mouseX > this.x-this.siz/1 &&
           mouseX < (this.x + this.siz/1) &&
           mouseY > this.y - this.siz/1 &&
           mouseY < (this.y + this.siz/1);
};

Node.prototype.draw = function() {
        noStroke();
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.siz, this.siz);
};


// Offensive Player object
var Player = function(config) {
    this.x = config.x || width/2;
    this.y = config.y || height/2;
    this.startX = this.x;
    this.startY = this.y;
    this.siz = config.siz || 25;
    this.fill = config.fill || color(0, 0, 0);
    this.clicked = config.clicked || false;
    this.pos = config.pos || "X";
    this.num = config.num || 0;
    this.rank = config.rank || 0;
    this.unit = config.unit || "offense";
    this.name = config.name || "";
    this.playerIndex = config.index || 0;
    this.gap = config.gap || 0;
    this.breakPoints = config.breakPoints || [];
    this.currentBreak = config.currentBreak || 0;
    this.showRoute = false;
    this.routeCoordinates = [[this.startX, this.startY]];
    this.routeNodes = [];
    this.change = config.change || false;
};

Player.prototype.draw = function() {
    if(this.unit === "offense"){
        noStroke();
        if(this.rank > 0){
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
        fill(this.fill);
        textSize(17);
        textAlign(CENTER, CENTER);
        text(this.pos, this.x, this.y);
    }
    this.drawRoute();
    noStroke();
};

Player.prototype.setColor = function(newFillColor) {
      this.fill = newFillColor;
};

Player.prototype.isMouseInside = function() {
    return mouseX > this.x-this.siz/1 &&
           mouseX < (this.x + this.siz/1) &&
           mouseY > this.y - this.siz/1 &&
           mouseY < (this.y + this.siz/1);
};

Player.prototype.select = function() {
    //this.fill = color(255, 234, 0);
    this.rank = 1;
    this.clicked = true;
    // Unselect all other players to isolate one route
    for(var i = 0; i < eligibleReceivers.length; i++){
      var p = eligibleReceivers[i];
      if(p !== this){
        p.clicked = false;
        p.rank = 0;
      }
    }
};

Player.prototype.drawRoute = function(){
  if (this.routeCoordinates.length > 1){
    for(var i = 0; i < this.routeCoordinates.length - 1; i++){
      stroke(255, 0, 0);
      line(this.routeCoordinates[i][0], this.routeCoordinates[i][1], this.routeCoordinates[i + 1][0], this.routeCoordinates[i + 1][1]);
      noStroke();
      fill(255, 0, 0)
      node = this.routeNodes[i]
      if (node.change){
        node.x = mouseX;
        node.y = mouseY;
        this.routeCoordinates[i + 1][0] = mouseX;
        this.routeCoordinates[i + 1][1] = mouseY;
      }
      node.draw();
    }
  }
};



Player.prototype.unselect = function() {
    this.clicked = false;
    // Don't need these functions in the formation creation to undo the route drawn
    // this.routeCoordinates = [[this.startX, this.startY]];
    // this.routeNodes = [];
    this.rank = 0;
    // RANK--;
};

Player.prototype.resetToStart = function(){
    this.x = this.startX;
    this.y = this.startY;
};

//Moves one step toward point x,y
Player.prototype.moveTo = function(x, y){
    var xDist = (x-this.x);
    if(x < 0){
      xDist = 0-this.x;
    }
    var yDist = (y-this.y);
    if(y < 0){
      yDist = 0-this.y;
    }
    var hDist = Math.sqrt(xDist*xDist+yDist*yDist);
    var numMoves = hDist / SPEED;
    if(numMoves < 1){
      return true;
    }
    var xRate = xDist / numMoves;
    var yRate = yDist / numMoves;

    this.x += xRate;
    this.y += yRate;
    return false;
};

Player.prototype.moveAtAngle = function(distance, theta){
    var xDist = distance*Math.cos(theta);
    var yDist = -1*distance*Math.sin(theta);
    this.moveTo(this.startX + xDist, this.startY + yDist);
};

Player.prototype.blitzGap = function(center) {
    //this.y -= 1 * SPEED; //TBI

    if(this.gap < 0){
        if(this.gap >= -5){
            var opponent = eligibleReceivers[(this.gap*-1)-1];
            this.coverMan(opponent);
        }else if(this.gap === -6){
            this.coverZone(getFlat(0));
        }else if(this.gap === -7){
            this.coverZone(getFlat(1));
        }else if(this.gap === -8){
            this.coverZone(getDeepThird(0));
        }else if(this.gap === -9){
            this.coverZone(getDeepThird(1));
        }else if(this.gap === -10){
            this.coverZone(getDropZone(0));
        }else if(this.gap === -11){
            this.coverZone(getDropZone(1));
        }else if(this.gap === -12){
            this.coverZone(getDropZone(2));
        }
        return;
    }

    if(this.y < center.y + 80){
        var gapX = this.getGapX(this.gap, center);
        var gapY = center.y;
        this.moveTo(gapX, gapY);
    }

};

Player.prototype.getGapX = function(gap, center){
    var bucketSize = center.siz * 1.2;
    var offset = Math.floor(gap/2);
    if(gap % 2 === 1){
        offset *= -1;
    }
    if(offset === 0){
        return center.x - 15 + 30 * gap;
    }
    return center.x + offset*bucketSize;
};
var getPlayersFromZone = function(zone){
    var players = [];
    for(var i = 0; i < offensivePlayers.length; i++){
          if(offensivePlayers[i].isInsideZone(zone)){
                players.push(offensivePlayers[i]);
          }
    }
    /*for(var i = 0; i < defensivePlayers.length; i++){
          if(defensivePlayers[i].isInsideZone(zone)){
                players.push(defensivePlayers[i]);
          }
    }*/
    return players;
};

//zone is an array [x1,y1,x2,y2]
Player.prototype.coverZone = function(zone){

    var newX = (zone[2] + zone[0])/2;
    var newY = (zone[3] + zone[1])/2;

    var playersInZone = getPlayersFromZone(zone);
    var closestPlayer = null;

    for(var i = 0; i < playersInZone.length; i++){
        var p = playersInZone[i];
        if(p !== this){
            if(closestPlayer === null){
             closestPlayer = p;
            }else{
                var xDist = this.x - closestPlayer.x;
                var yDist = this.y - closestPlayer.y;
                var d1 = Math.sqrt(xDist*xDist + yDist*yDist);
                xDist = this.x - p.x;
                yDist = this.y - p.y;
                var d2 = Math.sqrt(xDist*xDist + yDist*yDist);
                if(d2 < d1){
                    closestPlayer = p;
                }
            }

        }
    }

    if(closestPlayer !== null){
        newX = closestPlayer.x;
        newY = closestPlayer.y;
    }

    this.moveTo(newX, newY);
};

Player.prototype.coverMan = function(opponent) {
    //this.y -= 1 * SPEED; //TBI

    var oppX = opponent.x;
    var oppY = opponent.y;
    var xDist = (oppX-this.x);
    var yDist = (oppY-this.y);
    var hDist = Math.sqrt(xDist*xDist+yDist*yDist);
    var numMoves = hDist / SPEED;
    var xRate = xDist / numMoves;
    var yRate = yDist / numMoves;

    if(abs(xDist) > 10){
        this.x += xRate;
    }else{
        this.x += xRate/2.0;
    }
    if(yDist > 0){
        this.y += yRate/2.0;
        this.x += xRate/2.0;
    }
    else if(yDist < -10){
        this.y += yRate;
    }else{
        this.y += yRate/2.0;
    }

};

Player.prototype.isInsideZone = function(zone){
    if(zone[0] > zone[2]){
        var tmp = zone[0];
        zone[0] = zone[2];
        zone[2] = tmp;
    }
    if(zone[1] > zone[3]){
        var tmp = zone[1];
        zone[1] = zone[3];
        zone[3] = tmp;
    }
    return this.x > zone[0] && this.y > zone[1] && this.x < zone[2] && this.y < zone[3];
};

Player.prototype.runFade = function() {
    this.breakPoints = [];
    var dest1 = getDestination(175, PI/2, this.x, this.y);
    this.breakPoints.push(dest1);
};

Player.prototype.runPost = function(direction) {
    this.breakPoints = [];
    var dest1 = getDestination(80, PI/2, this.x, this.y);
    this.breakPoints.push(dest1);
    this.breakPoints.push(getDestination(200, direction*PI/4, dest1[0], dest1[1]));
};

Player.prototype.runDeepPost = function(direction) {
    this.breakPoints = [];
    var dest1 = getDestination(120, PI/2, this.x, this.y);
    this.breakPoints.push(dest1);
    this.breakPoints.push(getDestination(150, PI/2 - direction*PI/4, dest1[0], dest1[1]));
};

Player.prototype.runDeepCorner = function(direction) {
    this.breakPoints = [];
    var dest1 = getDestination(100, PI/2, this.x, this.y);
    this.breakPoints.push(dest1);
    var dest2 = getDestination(40, PI/2 + direction*PI/4, dest1[0], dest1[2]);
    this.breakPoints.push(dest2);
    this.breakPoints.push(getDestination(100, PI/2 - direction*PI/4, dest2[0], dest2[1]));
};

Player.prototype.runSlant = function(direction) {
    this.breakPoints = [];
    var dest1 = getDestination(30, PI/2, this.x, this.y);
    this.breakPoints.push(dest1);
    this.breakPoints.push(getDestination(200, PI/2 - direction*PI/4, dest1[0], dest1[1]));
};

Player.prototype.runArrow = function(direction) {
    this.breakPoints = [];
    var dest1 = getDestination(300, PI/2 - direction * PI/3, this.x, this.y);
    this.breakPoints.push(dest1);
};

//0 - slant, 1 - arrow, 2 - post, 3 - deep post, 4 - corner
Player.prototype.setRoute = function(val, center){
  this.currentBreak = 0;
  var direction = 1;
  if(this.startX > center.startX){
    direction = -1;
  }
    switch(val){
        case 0: this.runSlant(direction); break;
        case 1: this.runArrow(direction); break;
        case 2: this.runPost(direction); break;
        case 3: this.runDeepPost(direction); break;
        case 4: this.runFade(); break;//this.runDeepCorner(center, direction); break;
        case 5: this.runDeepCorner(direction); break;//this.runFade(); break;
    }
};

Player.prototype.runRoute = function(){
  if(this.currentBreak < 0 || this.currentBreak >= this.breakPoints.length){
    return; //TODO - dono
  }
  if(this.moveTo(this.breakPoints[this.currentBreak][0], this.breakPoints[this.currentBreak][1])){
    this.currentBreak++;
  }
}

Player.prototype.runBootleg = function(Player, direction) {
    if (this.y - Player.y  < 50) {
        this.y += 0.5 * SPEED;
        this.x += 0.5 * SPEED * direction;
    } else if (this.y - Player.y  < 80) {
        this.y += 0.5 * SPEED;
        this.x -= 0.5 * SPEED * direction;
    } else if (this.x >= 100 && this.x <= 300){
        this.x -= 0.8 * SPEED * direction;
    }
};

// Display a lines that shows the player's route
Player.prototype.displayRoute = function(coords){
  fill(255, 255, 255);
  // stroke(255, 255, 0);
  strokeWeight(2);
  line(this.startX, this.startY, coords[0][0], coords[0][1]);
  for (var i = 0; i < coords.length - 1; i++) {
    line(coords[i][0], coords[i][1], coords[i+1][0], coords[i+1][1]);
  }
};

// Give each player breakpoints
var setAllRoutes = function(){
  if(QUESTION_NUM < answerSheet.length){
    for(var i = 0; i < eligibleReceivers.length; i++){
      eligibleReceivers[i].setRoute(routeCombos[QUESTION_NUM][i], oline[2]);
    }
  }
}




//Create Scoreboard
var scoreboard = new Scoreboard({

});

// Create Buttons
var save = new Button({
    x: 10,
    y: 360,
    width: 35,
    label: "Save",
    clicked: false,
    displayButton: true
});

// Create Buttons

var trash = new Button({
    x: 330,
    y: 360,
    width: 40,
    label: "Trash",
    clicked: false,
    displayButton: true
});

var pause = new Button({
    x: 300,
    y: 360,
    width: 43,
    label: "Pause",
    clicked: false,
    displayButton: false
});

var stop = new Button({
    x: 355,
    y: 360,
    width: 34,
    label: "Stop",
    clicked: false,
    displayButton: false
});

var clear = new Button({
    x: 53,
    y: 360,
    width: 40,
    label: "Clear",
    clicked: false,
    displayButton: true
});

var bigReset = new Button({
    x: width / 2 - 40,
    y: height * 4 / 5,
    width: 80,
    label: "Restart Quiz",
    clicked: false
});

// Create Position groups

var oline = [];
var qb = [];
var te = [];
var rb = [];

//Create correct answer
var correctProgression = answerSheet[QUESTION_NUM];
var currentProgression = [];


//Create OLine and QB
var createOLineAndQB = function() {
    for (var i = -2; i < 3; i++) {
        var xPos = 200 + i*28;
        var yPos;
        if (i === 0) {
            yPos = 220;
        } else {
            yPos = 225;
        }
        var tmp = new Player({
            x: xPos,
            y: yPos,
            num: 70+i,
            fill: color(143, 29, 29)
        });
        oline.push(tmp);
        offensivePlayers.push(tmp);
    }
    currentPlayer = oline[3];
    var tmp = new Player ({
        x: oline[2].x,
        y: oline[2].y + 28,
        num: 'QB',
        fill: color(212, 130, 130)
    });
    qb.push(tmp);
    changeablePlayers.push(tmp);
    offensivePlayers.push(tmp);

};

createOLineAndQB();

var rb = new Player ({
    x: 130,
    y: 375,
    num: 'RB',
    fill: color(255, 0, 0)
});

var te = new Player ({
    x: 170,
    y: 375,
    num: 'TE',
    fill: color(255, 0, 0)
});

var wr = new Player({
   x: 210,
   y: 375,
   num: 'WR',
   fill: color(255, 0, 0)
});

var optionsToCreate = [];
optionsToCreate.push(rb);
optionsToCreate.push(wr);
optionsToCreate.push(te);

var drawOptionsToCreate = function() {
  optionsToCreate.forEach(function(player){
    player.draw();
  })
};

// offensivePlayers.push(rb1);
// offensivePlayers.push(te1);
// offensivePlayers.push(te2);
// offensivePlayers.push(wr1);
// offensivePlayers.push(wr2);
//
// eligibleReceivers.push(wr1);
// eligibleReceivers.push(te1);
// eligibleReceivers.push(rb1);
// eligibleReceivers.push(te2);
// eligibleReceivers.push(wr2);

setAllRoutes();

var dlPositions = ["DE", "NT", "DT", "RE"];
var lbPositions = ["W", "M", "S"];
var dbPositions = ["CB", "SS", "F/S", "CB"];
var dlNames = ["Gronk", "Davis", "Smith", "Evans"];
//var dlValues = ["94", "92", "90", "97"];

//Create defense
var drawDefense = function(ballX, ballY){
    for(var i = 0; i < 4; i++){
        var dl = new Player ({
            x: ballX - 60 + 40 * i,
            y: ballY - 30,
            fill: color(0, 0, 0),
            pos: dlPositions[i],
            name: dlNames[i],
            unit: "defense",
            index: i,
            gap: dlAssignments[QUESTION_NUM][i]
        });
        defensivePlayers.push(dl);
    }

    for(var i = 0; i < 3; i++){
        var lb = new Player ({
            x: ballX - 80 + 75 * i,
            y: ballY - 75,
            fill: color(0, 0, 0),
            pos: lbPositions[i],
            unit: "defense",
            index: 4+i,
            gap: lbAssignments[QUESTION_NUM][i]
        });
        defensivePlayers.push(lb);
    }

    for(var i = 0; i < 2; i++){
        var safety = new Player ({
            x: ballX - 100 + 200 * i,
            y: ballY - 125,
            fill: color(0, 0, 0),
            pos: dbPositions[i+1],
            unit: "defense",
            index: 4+i,
            gap: dbAssignments[QUESTION_NUM][i+1]
        });
        defensivePlayers.push(safety);
    }

    for(var i = 0; i < 2; i++){
        var corner = new Player ({
            x: ballX - 135 + 270 * i,
            y: ballY - 35,
            fill: color(0, 0, 0),
            pos: dbPositions[i*3],
            unit: "defense",
            index: 4+i,
            gap: dbAssignments[QUESTION_NUM][i*3]
        });
        defensivePlayers.push(corner);
    }

};

drawDefense(oline[2].x, oline[2].y);

var drawAllPlayers = function(){
    for(var i = 0; i < offensivePlayers.length; i++){
        offensivePlayers[i].draw();
    }
    for(var i = 0; i < defensivePlayers.length; i++){
        defensivePlayers[i].draw();
    }

};

var resetPlayers = function() {
    for(var i = 0; i < offensivePlayers.length; i++){
        offensivePlayers[i].resetToStart();
        offensivePlayers[i].showRoute = false;
        offensivePlayers[i].showPreviousRoute = false;
        offensivePlayers[i].showPreviousRouteGuess = false;
    }
    for(var i = 0; i < defensivePlayers.length; i++){
        defensivePlayers[i].resetToStart();
    }

};

var restartQuiz = function(){
  clearProgression();
  feedbackMessage = "";
  QUESTION_NUM = 0;
  QUESTIONS_ANSWERED = 0;
  SCORE = 0;
  INCORRECT_GUESSES = 0;
  SKIPS = 0;
  startTime = 0;
  endTime = 0;
  resetPlayers();
  save.displayButton = true;
  clear.displayButton = true;
};

var drawBackground = function(playName) {
    background(93, 148, 81);
    for(var i = 0; i < heightInYards; i++){
        var yc = height * (i/heightInYards);
        stroke(255, 255, 255);
        if(i % 10 === 0){
            line(0, yc, width, yc);
        }else if(i % 5 === 0){
            line(0, yc, width, yc);
        }else{
            line(width*0.24, yc, width*0.25, yc);
            line(width*0.74, yc, width*0.75, yc);
        }
    }
    textSize(18);
    textAlign(LEFT);
    text(playName,10,23);
};

//Quiz summary
var drawQuizSummary = function() {
  bigReset.displayButton = true;
  drawBackground("");
  bigReset.draw();

  var timeDeduction = ((endTime - startTime) - 10 * answerSheet.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }


  var resultString = "You scored " + (SCORE - INCORRECT_GUESSES*BAD_GUESS_PENALTY - SKIPS*SKIP_PENALTY - timeDeduction).toFixed(2) + " out of " + answerSheet.length;
  var guessesString = "You had " + INCORRECT_GUESSES + " incorrect guess";
  var skipsString = "You had " + SKIPS + " skip";
  if(INCORRECT_GUESSES !== 1){
    guessesString += "es";
  }
  if(SKIPS !== 1){
    skipsString += "s";
  }
  var timeString = "You took " + (endTime - startTime) + " seconds";
  textAlign(CENTER);
  textSize(24);
  text(resultString, width/2, height/2-50);
  textSize(20);
  text(guessesString, width/2, height/2+10);
  text(skipsString, width/2, height/2+40);
  text(timeString, width/2, height/2+70);

};

// intro scene
var drawOpening = function() {
    if(startTime === 0){
        startTime = second() + minute() * 60;
    }
    drawBackground(playName);
    save.draw();
    clear.draw();
    trash.draw();
    drawAllPlayers();
    drawOptionsToCreate();
    fill(0, 0, 0);
    textSize(20);
    text(feedbackMessage, 330, 20);
    scoreboard.draw();
    fill(176,176,176)



};

// game scene
var drawScene = function() {
    drawBackground(playName);
    pause.draw();
    stop.draw();
    pause.displayButton = true;
    stop.displayButton = true;
    save.displayButton = false;
    clear.displayButton = false;
    drawAllPlayers();
    for(var i = 0; i < eligibleReceivers.length; i++){
        eligibleReceivers[i].runRoute();
    }
    for(var i = 0; i < defensivePlayers.length; i++){
        defensivePlayers[i].blitzGap(oline[2]);
    }
    qb[0].runBootleg(oline[2], 1.0);


    fill(0, 0, 0);
    textSize(20);
    text(feedbackMessage, 120, 60);
    scoreboard.draw();
};

var advanceToNextPlay = function(message){
  feedbackMessage = message;
  QUESTION_NUM++;
  clearProgression();
  setAllRoutes();
  if(QUESTION_NUM >= answerSheet.length){
    endTime = minute() * 60 + second();
    save.displayButton = false;
    clear.displayButton = false;
    //Quiz is finished - TBI
    //QUESTION_NUM = 0;
    //SCORE = 0;
  }else{
    correctProgression = answerSheet[QUESTION_NUM];
  }
}

var checkCorrectAnswer = function(wrCoords, correctCoords){
  var xError = 0;
  var yError = 0;
  for(var i = 0; i < wrCoords.length; i++){
    if (correctCoords[i]){
      xError += Math.abs(wrCoords[i][0] - correctCoords[i][0]);
      yError += Math.abs(wrCoords[i][1] - correctCoords[i][1]);
    }
    else {
      xError = 1000000;
      yError = 1000000;
    }
  }
  return (xError + yError);
}

var setCorrectCoordinates = function(selectedWR){
  var correctCoordinates = [];
  correctCoordinates.push([selectedWR.startX, selectedWR.startY]);
  selectedWR.breakPoints.forEach(function(coord){
    correctCoordinates.push(coord);
  })
  return correctCoordinates;
}

var isInsideTrash = function(player){
  return player.x > trash.x &&
         player.x < trash.x + trash.width &&
         player.y > trash.y &&
         player.y < trash.y + trash.height
};

var checkRoutes = function() {
    var isCorrect = null;
    var selectedWR = findSelectedWR();
    if (selectedWR){
      var correctCoordinates = setCorrectCoordinates(selectedWR);
      var distanceFromActualRoute = checkCorrectAnswer(selectedWR.routeCoordinates, correctCoordinates);
    } else {
      correctCoordinates = null;
    }
    //TBI - logic
    if(correctCoordinates && correctCoordinates.length !== selectedWR.routeCoordinates.length){
        isCorrect = false;
    }
    else if (distanceFromActualRoute < cutOff){
      var scoreReductionFactor = 0.5 * (distanceFromActualRoute / cutOff);
      var scoreAddition = 1 - scoreReductionFactor;
      var scoreDisplay = 100*(1 - scoreReductionFactor).toFixed(2);
      isCorrect = true;
      selectedWR.showRoute = true;
    }
    if (isCorrect){
      selectedWR.previousRouteBreakpoints = selectedWR.breakPoints;
      selectedWR.previousRouteGuess = selectedWR.routeCoordinates;
      selectedWR.showPreviousRoute = true;
      selectedWR.showPreviousRouteGuess = true;
      setTimeout(function(){
        selectedWR.showPreviousRoute = false;
        selectedWR.showPreviousRouteGuess = false;
      }, 5000)
      SCORE += scoreAddition;
      QUESTIONS_ANSWERED++;
      var displayMessage = "Nice! " + scoreDisplay.toFixed(0)  + "% perfect";
      if (answerSheet.length - 1 === QUESTION_NUM){
        feedbackMessage = displayMessage;
        setTimeout(function(){
          advanceToNextPlay(displayMessage);
        }, 1000)
      }else {
        advanceToNextPlay(displayMessage);
      }


    }else{
      feedbackMessage = "Wrong Answer";
      INCORRECT_GUESSES++;
      //TODO: Explain what was wrong (or print right answer?)
    }
};

var clearPreviousRouteDisplays = function(){
  for(var i = 0; i < eligibleReceivers.length; i++){
    var p = eligibleReceivers[i];
    p.showPreviousRoute = false;
    p.showPreviousRouteGuess = false;
  }
}

var clearProgression = function(){
    for(var i = 0; i < eligibleReceivers.length; i++){
        var p = eligibleReceivers[i];
        if(p.rank > 0){
            eligibleReceivers[i].unselect();
        }
        p.showRoute = false;

    }
};

var clearRouteDrawings = function(){
  for(var i = 0; i < eligibleReceivers.length; i++){
    var p = eligibleReceivers[i];
    p.routeCoordinates = [[p.startX, p.startY]];
    p.routeNodes = [];
    p.showPreviousRoute = false;
    p.showPreviousRouteGuess = false;

  }
}

keyReleased = function(){
  if (keyCode === SHIFT){
    capitalLetter = false;
  }
}

keyPressed = function() {
  selectedWR = findSelectedWR();
  if (keyCode === SHIFT){
    capitalLetter = true;
  }
  if (keyCode === BACKSPACE){
    if (selectedWR){
      stepRouteBackward(selectedWR);
    } else{
      playName = playName.substring(0, playName.length - 1);
    }
  }
  else{
    playName += capitalLetter ? key : key.toLowerCase();
  }
};

var stepRouteBackward = function(wr) {
  if (wr.routeCoordinates.length > 1) {
    wr.routeCoordinates.pop();
    wr.routeNodes.pop();
  }
}

pressStopButton = function(){
  save.changeClickStatus();
  if (pause.clicked) {
      pause.changeClickStatus();
  }
  resetPlayers();
  inProgress = false;
  save.displayButton = true;
  clear.displayButton = true;
  pause.displayButton = false;
  stop.displayButton = false;
}

pressPlayButton = function() {
  play.changeClickStatus();
  setAllRoutes();
  feedbackMessage = "";
  inProgress = true;
}

// var anyPlayerSelected = function(){
//   eligibleReceivers.forEach(function(wr){
//     if(wr.clicked === true){
//       return true
//     }
//   })
// }

var findSelectedWR = function(){
  var selectedWR = eligibleReceivers.filter(function(wr) {
    return wr.clicked === true;
  })[0];
  return selectedWR;
}

var isLastQuestion = function(){
  return QUESTION_NUM === answerSheet.length;
}





var mouseInReceiverOrNode = function() {
  for(var i = 0; i < changeablePlayers.length; i++){
    var p = changeablePlayers[i];
    if (p.isMouseInside()){
      var receiverClicked = p;
    }
    for(var j = 0; j < p.routeNodes.length; j++){
      var n = p.routeNodes[j];
      if (n.isMouseInside()){
        var selectedNode = n;
      }
    }
  }
  return [receiverClicked, selectedNode];
}

var mouseInOptionsToCreate = function() {
  for(var i = 0; i < optionsToCreate.length; i++){
    var p = optionsToCreate[i];
    if (p.isMouseInside()){
      var optionClicked = p;
    }
  }
  return optionClicked;
}

var movePlayer = function(player){
  player.x = mouseX;
  player.y = mouseY;
  player.startX = mouseX;
  player.startY = mouseY;
  player.routeCoordinates[0][0] = mouseX;
  player.routeCoordinates[0][1] = mouseY;

};

var deletePlayer = function(player){
  index = eligibleReceivers.indexOf(player);
  eligibleReceivers.splice(index, 1);
  index = changeablePlayers.indexOf(player);
  changeablePlayers.splice(index, 1);
  index = offensivePlayers.indexOf(player);
  offensivePlayers.splice(index, 1);
};

var removeAllPlayers = function(){
  eligibleReceivers.forEach(function(player){
      index = offensivePlayers.indexOf(player);
      offensivePlayers.splice(index, 1);
  })
  eligibleReceivers = [];
  changeablePlayers = [qb[0]];
};

var createPlayer = function(player){
  if (offensivePlayers.length < 11){
    offensivePlayers.push(player);
    eligibleReceivers.push(player);
    changeablePlayers.push(player);
    establishingNewPlayer = player;
  }
};

mouseDragged = function(){
  var receiverClicked = mouseInReceiverOrNode()[0];
  var selectedNode = mouseInReceiverOrNode()[1];
  var positionOptionSelected = mouseInOptionsToCreate();
  if (establishingNewPlayer){
    movePlayer(establishingNewPlayer);
  }
  else if (receiverClicked){
    receiverClicked.change = receiverClicked.change ?  false : true;
    establishingNewPlayer = receiverClicked;
  }
  else if (positionOptionSelected){
    var newPlayer = new Player({
      x: positionOptionSelected.x,
      y: positionOptionSelected.y,
      num: positionOptionSelected.num,
      fill: color(255, 0, 0),
      change: true
    })
    createPlayer(newPlayer);
  }
  else if (clear.isMouseInside()){
    removeAllPlayers();
  }
  var receiverClicked = mouseInReceiverOrNode()[0];
  var selectedNode = mouseInReceiverOrNode()[1];
  selectedWR = findSelectedWR();
  if(selectedNode){
    selectedNode.change = true;
  }
};

mouseClicked = function() {
  var receiverClicked = mouseInReceiverOrNode()[0];
  var selectedNode = mouseInReceiverOrNode()[1];
  selectedWR = findSelectedWR();
  if (establishingNewPlayer){
    if(isInsideTrash(establishingNewPlayer)){
      deletePlayer(establishingNewPlayer);
    }
    establishingNewPlayer.change = false;
    establishingNewPlayer = null;
  }
  else if (clear.isMouseInside()){
    removeAllPlayers();
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
      clearPreviousRouteDisplays();
      for(var i = 0; i < eligibleReceivers.length; i++){
          var p = eligibleReceivers[i];
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
    if(validPlay()){
      eligibleReceivers.forEach(function(player){
        convertRouteDrawingToBreakPoints(player);
      })
      var newPlay = new Play({
          eligibleReceivers: eligibleReceivers,
          name: playName,
          qb: qb[0],
          oline: oline
      });
      plays.push(newPlay);
      removeAllPlayers();
      playName = "";
      feedbackMessage = "Saved!"
      // Logic to save the play to the database
    } else {
      feedbackMessage = "Invalid Play"
    }
  }

};

var validPlay = function(){
  return offensivePlayers.length === 11;
}

var convertRouteDrawingToBreakPoints = function(player){
  player.breakPoints = player.routeCoordinates.slice(1, player.routeCoordinates.length);
}

var Play = function(config) {
    this.eligibleReceivers = config.eligibleReceivers || [];
    this.name = config.name || "";
    this.qb = config.qb || null;
    this.oline = config.oline || null;
    this.formation = config.formation || null;
    // this.
};

draw = function() {
  if(endTime > 0){
    drawQuizSummary();
  }else{
    if (save.clicked) {
        if(!pause.clicked) {
            drawScene();
        }
    } else {
        drawOpening();
    }
  }
};
}
