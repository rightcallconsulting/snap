// Offensive Player object
var Player = function(config) {
    this.x = config.x || width/2;
    this.y = config.y || height/2;
    this.startX = this.x;
    this.startY = this.y;
    this.siz = config.siz || 25;
    this.fill = config.fill || color(0, 0, 0);
    this.red = config.red || 0;
    this.blue = config.blue || 0;
    this.green = config.green || 0;
    this.clicked = config.clicked || false;
    this.pos = config.pos || "X";
    this.num = config.num || 0;
    this.rank = config.rank || 0;
    this.unit = config.unit || "offense";
    this.name = config.name || "";
    this.playerIndex = config.index || 0;
    this.unitIndex = config.unitIndex || 0;
    this.gap = config.gap || 0;
    this.breakPoints = config.breakPoints || [];
    this.currentBreak = config.currentBreak || 0;
    this.showRoute = false;
    this.routeCoordinates = config.routeCoordinates || [[this.startX, this.startY]];
    this.routeNodes = [];
    this.change = config.change || false;
    this.progressionRank = config.progressionRank || 0;
    this.routeNum = config.routeNum || null;
    this.blockingAssignment = config.blockingAssignment || null;
    this.blockingAssignmentPlayerIndex = config.blockingAssignmentPlayerIndex || null;
    this.blockingAssignmentUnitIndex = config.blockingAssignmentUnitIndex || null;
    this.blocker = config.blocker || false;
    this.runner = config.runner || false;
    this.speed = 1;
    this.initialRank = 1;
    this.CBAssignment = config.CBAssignment || null;
    this.isBeingTested = config.isBeingTested || false;
    this.id = config.id || null;
};

Player.rank = 1;

// Instance Methods

Player.prototype.setColor = function(newFillColor) {
      this.fill = newFillColor;
};

Player.prototype.clearRoute = function(){
  this.routeCoordinates = [[this.startX, this.startY]];
  this.routeNodes = [];
  this.progressionRank = 0;
  this.showPreviousRoute = false;
  this.showPreviousRouteGuess = false;
};

Player.prototype.isMouseInside = function() {
    return mouseX > this.x-this.siz/1 &&
           mouseX < (this.x + this.siz/1) &&
           mouseY > this.y - this.siz/1 &&
           mouseY < (this.y + this.siz/1);
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
    var numMoves = hDist / this.speed;
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

Player.prototype.blitzGap = function(center, play) {
    //this.y -= 1 * this.speed; //TBI

    if(this.gap < 0){
        if(this.gap >= -5){
            var opponent = play.eligibleReceivers[(this.gap*-1)-1];
            this.coverMan(opponent);
        }else if(this.gap === -6){
            this.coverZone(getFlat(0), play);
        }else if(this.gap === -7){
            this.coverZone(getFlat(1), play);
        }else if(this.gap === -8){
            this.coverZone(getDeepThird(0), play);
        }else if(this.gap === -9){
            this.coverZone(getDeepThird(1), play);
        }else if(this.gap === -10){
            this.coverZone(getDropZone(0), play);
        }else if(this.gap === -11){
            this.coverZone(getDropZone(1), play);
        }else if(this.gap === -12){
            this.coverZone(getDropZone(2), play);
        }
        return;
    }

    if(this.y < center.y + 80){
        var gapX = this.getGapX(this.gap, center);
        var gapY = center.y;
        this.moveTo(gapX, gapY);
    }

};

//zone is an array [x1,y1,x2,y2]
Player.prototype.coverZone = function(zone, play){

    var newX = (zone[2] + zone[0])/2;
    var newY = (zone[3] + zone[1])/2;

    var playersInZone = getPlayersFromZone(zone, play);
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
    //this.y -= 1 * this.speed; //TBI

    var oppX = opponent.x;
    var oppY = opponent.y;
    var xDist = (oppX-this.x);
    var yDist = (oppY-this.y);
    var hDist = Math.sqrt(xDist*xDist+yDist*yDist);
    var numMoves = hDist / this.speed;
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

Player.prototype.blockMan = function(opponent, shade, isPull) {
  var oppX = opponent.x + shade * opponent.siz / 2;
  var oppY = opponent.y + opponent.siz/2;
  this.moveTo(oppX, oppY);
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

Player.prototype.checkPosition = function(test) {
  //TBI
  test.scoreboard.feedbackMessage = "You are at: " + this.x + "," + this.y;
}

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
};

Player.prototype.runBootleg = function(Player, direction) {
    if (this.y - Player.y  < 50) {
        this.y += 0.5 * this.speed;
        this.x += 0.5 * this.speed * direction;
    } else if (this.y - Player.y  < 80) {
        this.y += 0.5 * this.speed;
        this.x -= 0.5 * this.speed * direction;
    } else if (this.x >= 100 && this.x <= 300){
        this.x -= 0.8 * this.speed * direction;
    }
};

// Display a lines that shows the player's route
Player.prototype.displayRoute = function(coords){
  fill(255, 255, 255);
  strokeWeight(2);
  stroke(100);
  line(this.startX, this.startY, coords[0][0], coords[0][1]);
  for (var i = 0; i < coords.length - 1; i++) {
    line(coords[i][0], coords[i][1], coords[i+1][0], coords[i+1][1]);
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
      if (node && node.change){
        node.x = mouseX;
        node.y = mouseY;
        this.routeCoordinates[i + 1][0] = mouseX;
        this.routeCoordinates[i + 1][1] = mouseY;
      }
      if(node){
        node.draw();
      }
    }
  }
};


// Not prototype but maybe should be turned into prototypes

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
};

Player.prototype.getGapX = function(gap, center){
    var bucketSize = center.siz * 1.2;
    var offset = Math.floor(gap/2);
    if(gap % 2 === 1){
        offset *= -1;
    }
    if(offset === 0){
        return center.startX - 15 + 30 * gap;
    }
    return center.startX + offset*bucketSize;
};

Player.prototype.setCorrectCoordinates = function(){
  var correctCoordinates = [];
  correctCoordinates.push([this.startX, this.startY]);
  this.breakPoints.forEach(function(coord){
    correctCoordinates.push(coord);
  })
  return correctCoordinates;
};

Player.prototype.checkCorrectAnswer = function(wrCoords, correctCoords){
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
};

Player.prototype.stepRouteBackward = function() {
  if (this.routeCoordinates.length > 1) {
    this.routeCoordinates.pop();
    this.routeNodes.pop();
  }
};

Player.prototype.checkRoutes = function(play){
  var isCorrect = null;
  var correctCoordinates = this.setCorrectCoordinates();
  var distanceFromActualRoute = this.checkCorrectAnswer(this.routeCoordinates, correctCoordinates);
  if(correctCoordinates && correctCoordinates.length !== this.routeCoordinates.length){
      isCorrect = false;
  }
  else if (distanceFromActualRoute < play.test.cutOff){
    var scoreReductionFactor = 0.5 * (distanceFromActualRoute / play.test.cutOff);
    var scoreAddition = 1 - scoreReductionFactor;
    var scoreDisplay = 100*(1 - scoreReductionFactor).toFixed(2);
    isCorrect = true;
    this.showRoute = true;
  }
  if (isCorrect){
    this.previousRouteBreakpoints = this.breakPoints;
    this.previousRouteGuess = this.routeCoordinates;
    this.showPreviousRoute = true;
    this.showPreviousRouteGuess = true;
    setTimeout(function(){
      this.showPreviousRoute = false;
      this.showPreviousRouteGuess = false;
    }.bind(this), 5000)
    play.test.score += scoreAddition;
    play.test.questionsAnswered++;
    var displayMessage = "Nice! " + scoreDisplay.toFixed(0)  + "% perfect";
    if (play.test.plays.length - 1 === play.test.questionNum){
      play.test.scoreboard.feedbackMessage = displayMessage;
      setTimeout(function(){
        play.test.advanceToNextPlay(displayMessage);
      }, 1000)
    }else {
      play.test.advanceToNextPlay(displayMessage);
    }

  }else{
    play.test.scoreboard.feedbackMessage = "Wrong Answer";
    play.test.incorrectGuesses++;
  }
  return isCorrect
};


Player.prototype.movePlayer = function(){
  this.x = mouseX;
  this.y = mouseY;
  this.startX = mouseX;
  this.startY = mouseY;
  this.routeCoordinates[0][0] = mouseX;
  this.routeCoordinates[0][1] = mouseY;
};

Player.prototype.convertRouteDrawingToBreakPoints = function(){
  this.breakPoints = this.routeCoordinates.slice(1, this.routeCoordinates.length);
};

Player.prototype.saveToDB = function(){
  //create a connection to playerDB
  //get the variables we need for the DB in the proper format
  //push an entry into the players DB for this player with all data we need

};

Player.prototype.establishFill = function(){
  if(this.unit ==="defense"){
    this.fill = color(0, 0, 0);
  }
  else{
    if(this.pos==="QB"){
      this.fill = color(212, 130, 130);
    }
    else if(this.pos==="OL"){
      this.fill = color(143, 29, 29);
    }
    else{
      this.fill = color(255, 0, 0);
    }
  }

};

Player.prototype.isALineman = function(){
  if(this.unit ==="defense"){
    if(this.pos === "DL" || this.pos === "DE"){
      return true
    }

  }
  else{
    if(this.pos === "LT" || this.pos === "LG" || this.pos === "C" || this.pos === "RG"
    || this.pos === "RT" || this.pos === "OT"){
      return true
    }
  }

};

Player.prototype.checkSelection = function(test) {
  if(test.getCurrentDefensivePlay().playerBeingTested() && test.getCurrentDefensivePlay().playerBeingTested().CBAssignment){
    var correctPlayer = test.getCurrentDefensivePlay().playerBeingTested().CBAssignment;
  }
  else if (test.getCurrentPlay().playerBeingTested().blockingAssignmentPlayerIndex){
    var correctPlayerIndex = test.getCurrentPlay().playerBeingTested().blockingAssignmentPlayerIndex;
    var correctUnitIndex = test.getCurrentPlay().playerBeingTested().blockingAssignmentUnitIndex;
  }
  if (this === correctPlayer || (correctPlayerIndex === this.playerIndex && correctUnitIndex === this.unitIndex)){
    var isCorrect = true
  }
  if (isCorrect && test.questionsPerPlay > 1) {
    // clearSelection();
    test.showBigPlayers = true;
  } else {
    //TODO: Explain what was wrong (or print right answer?)
  }
  test.registerAnswer(isCorrect);
  return isCorrect;
};

Player.prototype.createBigPlayer = function(height, width){
  var bigSelf = new Player({
    x: width,
    y: height,
    siz: this.siz * 2.5,
    unit: this.unit,
    pos: this.pos,
    breakPoints: this.breakPoints,
    currentBreak: this.currentBreak,
    num: this.num
  })
  return bigSelf
};

var getPlayersFromZone = function(zone, play){
    var players = [];
    for(var i = 0; i < play.offensivePlayers.length; i++){
          if(play.offensivePlayers[i].isInsideZone(zone)){
                players.push(play.offensivePlayers[i]);
          }
    }
    /*for(var i = 0; i < defensivePlayers.length; i++){
          if(defensivePlayers[i].isInsideZone(zone)){
                players.push(defensivePlayers[i]);
          }
    }*/
    return players;
};

var getDestination = function(distance, theta, x, y){
    var xDist = distance*Math.cos(theta);
    var yDist = -1*distance*Math.sin(theta);
    return [x + xDist, y + yDist];
};

var createPlayerFromJSON = function(jsonPosition){
  jsonPosition.fields.x = jsonPosition.fields.startX;
  jsonPosition.fields.y = jsonPosition.fields.startY;
  var routeCoordinates = JSON.parse(jsonPosition.fields.routeCoordinates);
  var player = new Player(jsonPosition.fields)
  player.id = jsonPosition.pk;
  player.blockingAssignmentUnitIndex = jsonPosition.fields.blockingAssignmentUnitIndex
  player.blockingAssignmentUnitIndex = jsonPosition.fields.blockingAssignmentUnitIndex
  player.pos = jsonPosition.fields.name;
  player.num = jsonPosition.fields.name;
  player.routeCoordinates = [[player.startX, player.startY]]
  if(routeCoordinates){
    player.breakPoints = routeCoordinates.slice(1, routeCoordinates.length);
  }
  player.establishFill();

  return player
};
