
//***************************************************************************//
//																			 //
// player.js - Right Call Consulting. All Rights Reserved. 2016				 //
//																			 //
//***************************************************************************//
//																			 //
// A player object represents some player on the field.						 //
//																			 //
//***************************************************************************//

var Player = function(config) {
  this.x = config.x || width/2;
  this.y = config.y || height/2;
  this.startX = this.x;
  this.startY = this.y;
  this.siz = config.siz || 2;
  this.fill = config.fill || color(0, 0, 0);
  this.stroke = config.stroke || noStroke();
  this.red = config.red || 0;
  this.blue = config.blue || 0;
  this.green = config.green || 0;
  this.clicked = config.clicked || false;
  this.selected = config.selected || false;
  this.eligible = config.eligible || false;
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
  this.runNodes = [];
  this.change = config.change || false;
  this.progressionRank = config.progressionRank || 0;
  this.routeNum = config.routeNum || null;
  this.blockingAssignment = config.blockingAssignment || null;
  this.blockingAssignmentPlayerIndex = config.blockingAssignmentPlayerIndex || null;
  this.blockingAssignmentUnitIndex = config.blockingAssignmentUnitIndex || null;
  this.blockingAssignmentObject = createBlockingAssignmentFromJSON(config.blockingAssignmentObject) || null; //eventually replaces above three
  this.blocker = config.blocker || false;
  this.runner = config.runner || false;
  if(config.runAssignment){
	this.runAssignment = createRunAssignmentFromJSON(config.runAssignment) || null;
  }
  this.speed = 0.1;
  this.initialRank = 1;
  this.CBAssignment = config.CBAssignment || null;
  this.CBAssignmentPlayerID = config.CBAssignmentPlayerID || null;
  this.isBeingTested = config.isBeingTested || false;
  this.id = config.id || null;
  this.zoneXPoint = config.zoneXPoint || null;
  this.zoneYPoint = config.zoneYPoint || null;
  this.gapXPoint = config.gapXPoint || null;
  this.gapYPoint = config.gapYPoint || null;
  this.motionCoords = config.motionCoords || []; // assume (x, y)
  this.currentMotionBreak = config.currentMotionBreak || 0;
  this.zoneAssignment = config.zoneAssignment || 0;
  this.optionAssignment = config.optionAssignment || [];
  this.coverageAssignment = config.coverageAssignment || [];

  // Blocker assignments - eventually we should just have some child object for Linemen
  this.blockingAssignmentArray = config.blockingAssignmentArray || [[], []];
};

//***************************************************************************//
//***************************************************************************//

Player.rank = 1;
Player.altRank = -1;

// Instance Methods
Player.prototype.click = function() {
	if (this.selected) {
		this.setUnselected();
	} else {
		this.setSelected();
	}
	
};

Player.prototype.setSelected = function () {
	this.selected = true;

	var red = 255;
	var green = 255;
	var blue = 0;
	
	/*if (this.unit === "offense") {
		red = 255; green = 255; blue = 0;
	} else if (this.unit === "defense") {
		red = 200; green = 200; blue = 200;
	}*/

	this.setFill(red, green, blue);
};

Player.prototype.setUnselected = function () {
	this.selected = false;

	var red = 0;
	var green = 0;
	var blue = 0;

	if (this.pos === "QB") {
		red = 212; green = 130; blue = 130;
	} else if (this.unit === "defense") {
		red = 0; green = 0; blue = 0;
	} else if (this.eligible) {
		red = 255; green = 0; blue = 0;
	} else if (!this.eligible) {
		red = 143; green = 29; blue = 29;
	}

	this.setFill(red, green, blue);
};

Player.prototype.setFill = function(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;
};

Player.prototype.drawAllBlocks= function(field) {
	var primaryAssignment = this.blockingAssignmentArray[0];
	var secondaryAssignment = this.blockingAssignmentArray[1];
	var primaryAssingmentLength = primaryAssignment.length;
	var secondaryAssignmentLength = secondaryAssignment.length;

	var currentX = field.getTranslatedX(this.x);
	var currentY = field.getTranslatedY(this.y);

	var black = color(0, 0, 0);
	stroke(black);

	for (var i = 0; i < primaryAssingmentLength; i++) {
		if (primaryAssignment[i] != null) {
			if (primaryAssignment[i] instanceof Player) {
				/*var black = color(0, 0, 0);
				stroke(black);
				line(currentX, currentY, field.getTranslatedX(primaryAssignment[i].x), field.getTranslatedY(primaryAssignment[i].y));

				currentX = field.getTranslatedX(primaryAssignment[i].x);
				currentY = field.getTranslatedY(primaryAssignment[i].y);*/
				var new_coordinates = this.drawBlockOnPlayer(field, currentX, currentY, primaryAssignment[i]);
				currentX = new_coordinates[0];
				currentY = new_coordinates[1];
			} else if (primaryAssignment[i] === "Money Block") {
				var new_coordinates = this.drawMoneyBlock(field, currentX, currentY);
				currentX = new_coordinates[0];
				currentY = new_coordinates[1];
			} else if (primaryAssignment[i] === "Down Block Right") {
				var new_coordinates = this.drawDownBlockRight(field, currentX, currentY);
				currentX = new_coordinates[0];
				currentY = new_coordinates[1];
			} else if (primaryAssignment[i] === "Down Block Left") {
				var new_coordinates = this.drawDownBlockLeft(field, currentX, currentY);
				currentX = new_coordinates[0];
				currentY = new_coordinates[1];
			} else if (primaryAssignment[i] === "Straight Seal Right") {
				var new_coordinates = this.drawStraightSealRight(field, currentX, currentY);
				currentX = new_coordinates[0];
				currentY = new_coordinates[1];
			} else if (primaryAssignment[i] === "Straight Seal Left") {
				var new_coordinates = this.drawStraightSealLeft(field, currentX, currentY);
				currentX = new_coordinates[0];
				currentY = new_coordinates[1];
			}
		}
	}

	noStroke();
};

Player.prototype.drawBlockOnPlayer = function(field, currentX, currentY, assignment) {
	var assignmentX = field.getTranslatedX(assignment.x);
	var assignmentY = field.getTranslatedY(assignment.y);
	var deltaX = assignmentX - currentX;
	var deltaY = assignmentY - currentY;
	var distToAssignment = sqrt(pow(deltaX, 2) + pow(deltaY, 2));
	var alpha = atan(deltaY/deltaX);
	var bufferFromAssignment = assignment.siz*10;

	var dist = distToAssignment - bufferFromAssignment;
	var xDiff = cos(alpha)*dist;
	var yDiff = sin(alpha)*dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2, y2;

	if (deltaX > 0) {
		x2 = currentX + xDiff;
		y2 = currentY + yDiff;
	} else {
		x2 = currentX - xDiff;
		y2 = currentY - yDiff;
	}

	//var y2 = currentY - yDiff;

	line(x1, y1, x2, y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 20;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	line(x1, y1, x2, y2); 

	return new_coordinates;
};

Player.prototype.drawMoneyBlock = function(field, currentX, currentY) {
	var dist = 20;
	var xDiff = 0;
	var yDiff = dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX - xDiff;
	var y2 = currentY - yDiff;

	line(x1, y1, x2, y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 20;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	line(x1, y1, x2, y2); 

	return new_coordinates;
};

Player.prototype.drawDownBlockRight = function(field, currentX, currentY) {
	var dist = 30;
	var xDiff = (dist/2)*sqrt(2);
	var yDiff = (dist/2)*sqrt(2);

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX + xDiff;
	var y2 = currentY - yDiff;

	line(x1, y1, x2, y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 20;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	line(x1, y1, x2, y2); 

	return new_coordinates;
};

Player.prototype.drawDownBlockLeft = function(field, currentX, currentY) {
	var dist = 30;
	var xDiff = (dist/2)*sqrt(2);
	var yDiff = (dist/2)*sqrt(2);

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX - xDiff;
	var y2 = currentY - yDiff;

	line(x1, y1, x2, y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 20;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	line(x1, y1, x2, y2); 

	return new_coordinates;
};

Player.prototype.drawStraightSealRight = function(field, currentX, currentY) {
	var dist = 45;
	var xDiff = 0;
	var yDiff = dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX + xDiff;
	var y2 = currentY - yDiff;

	line(x1, y1, x2, y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 20;
	xDiff = (lengthOfPerpLine/4)*sqrt(2);
	yDiff = (lengthOfPerpLine/4)*sqrt(2);
	x1 = x2 - xDiff;
	y1 = y2 + yDiff;
	x2 = x2 + xDiff;
	y2 = y2 - yDiff;

	line(x1, y1, x2, y2); 

	return new_coordinates;
};

Player.prototype.drawStraightSealLeft = function(field, currentX, currentY) {
	var dist = 45;
	var xDiff = 0;
	var yDiff = dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX - xDiff;
	var y2 = currentY - yDiff;

	line(x1, y1, x2, y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 20;
	xDiff = (lengthOfPerpLine/4)*sqrt(2);
	yDiff = (lengthOfPerpLine/4)*sqrt(2);
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	line(x1, y1, x2, y2); 

	return new_coordinates;
};

// Dylan's line

Player.prototype.getX = function(field) {
	return field.yardsToPixels(this.getYardX() - field.getXOffset());
};

Player.prototype.getY = function(field) {
	return field.height - field.yardsToPixels(this.getYardY() - field.getYOffset());
};

Player.prototype.getYardX = function() {
	return this.x;
};

Player.prototype.getYardY = function() {
	return this.y;
};

Player.prototype.draw = function(){
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var siz = field.yardsToPixels(this.siz);

	if(this.unit === "offense") {
		noStroke();
		fill(this.red, this.green, this.blue);
		ellipse(x, y, siz, siz);
		fill(0,0,0);
		textSize(14);
		textAlign(CENTER, CENTER);
		text(this.pos, x, y);
	} else if (this.unit === "defense") {
		noStroke();
		fill(this.red, this.green, this.blue);
		textSize(17);
		textAlign(CENTER, CENTER);
		text(this.pos, x, y);
		fill(0,0,0);
	}
};

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

Player.prototype.isMouseInside = function(field) {
  var siz = field.yardsToPixels(this.siz);
  var x = field.getTranslatedX(this.x)
  var y = field.getTranslatedY(this.y)
  var dist = Math.sqrt((mouseX-x)*(mouseX-x)+(mouseY-y)*(mouseY-y));
  return dist <= siz/2;
  /*
  return mouseX > this.x-this.siz/1 &&
		 mouseX < (this.x + this.siz/1) &&
		 mouseY > this.y - this.siz/1 &&
		 mouseY < (this.y + this.siz/1);*/
	   };

  Player.prototype.resetToStart = function(){
	this.x = this.startX;
	this.y = this.startY;
	this.currentBreak = 0;
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

  Player.prototype.blitzGapScene = function(){
	var gapX = this.gapXPoint;
	var gapY = this.gapYPoint;
	this.moveTo(gapX, gapY);
  }

  Player.prototype.coverZoneScene = function(){
	var zoneX = this.zoneXPoint;
	var zoneY = this.zoneYPoint;
	this.moveTo(zoneX, zoneY);
  }

  Player.prototype.coverManScene = function(receiver){
	var destX = receiver.x;
	var destY = receiver.y + 2;
	this.moveTo(destX, destY);
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

Player.prototype.runMotion = function(){
  if(this.currentMotionBreak < 0 || this.currentMotionBreak >= this.motionCoords.length){
	return; //TODO - dono
  }
  if(this.moveTo(this.motionCoords[this.currentMotionBreak][0], this.motionCoords[this.currentMotionBreak][1])){
	this.currentMotionBreak++;
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
  if(coords.length < 1){
	return;
  }
  fill(255, 255, 255);
  strokeWeight(2);
  stroke(100);
  line(this.startX, this.startY, coords[0][0], coords[0][1]);
  for (var i = 0; i < coords.length - 1; i++) {
	line(coords[i][0], coords[i][1], coords[i+1][0], coords[i+1][1]);
  }
  strokeWeight(1);
};

Player.prototype.drawRouteCoordinates = function(field){
  this.breakPoints = this.routeCoordinates.slice();
  this.drawRoute(field);
}

Player.prototype.drawRoute = function(field){
  if(this.breakPoints.length < 1){
	return;
  }
  var routeCoordinates = [];
  routeCoordinates.push([this.startX, this.startY]);
  routeCoordinates = routeCoordinates.concat(this.breakPoints.slice());
  for(var i = 0; i < routeCoordinates.length - 1; i++){
	var x1 = field.getTranslatedX(routeCoordinates[i][0]);
	var y1 = field.getTranslatedY(routeCoordinates[i][1]);
	var x2 = field.getTranslatedX(routeCoordinates[i+1][0]);
	var y2 = field.getTranslatedY(routeCoordinates[i+1][1]);
	var yardsX = (abs(routeCoordinates[i+1][0] - routeCoordinates[i][0]))
	var yardsY = (abs(routeCoordinates[i+1][1] - routeCoordinates[i][1]))
	var yards = int(sqrt(yardsX * yardsX + yardsY * yardsY));
	stroke(255, 0, 0);
	line(x1,y1,x2,y2);
	noStroke();
	fill(255, 0, 0)
	textSize(18);
	if(yards >= 1 && i < routeCoordinates.length - 2){
	  text(yards, x2 + 15, y2 + 15);
	}

	node = this.routeNodes[i]
	if (node && node.change){
	  node.x = field.getYardX(mouseX);
	  node.y = field.getYardY(mouseY);
	  this.routeCoordinates[i + 1][0] = node.x;
	  this.routeCoordinates[i + 1][1] = node.y;
	}
	if(node){
	  if(i === this.routeNodes.length - 1){
		var prevX = this.startX;
		var prevY = this.startY;
		if(i > 0){
		  prevX = this.routeNodes[i-1].x;
		  prevY = this.routeNodes[i-1].y;
		}
		node.drawArrow(field, prevX, prevY);
	  }else{
		node.draw(field);
	  }

	}
  }
};

Player.prototype.drawBreakPoints = function(field){
  var x1 = field.getTranslatedX(this.startX);
  var y1 = field.getTranslatedY(this.startY);
  if(this.breakPoints.length > 0){
	var x2 = field.getTranslatedX(this.breakPoints[0][0]);
	var y2 = field.getTranslatedY(this.breakPoints[0][1]);
	stroke(255, 0, 0);
	line(x1,y1,x2,y2);
	noStroke();
	fill(255, 0, 0)
  }
  for(var i = 0; i < this.breakPoints.length - 1; i++){
	x1 = field.getTranslatedX(this.breakPoints[i][0]);
	y1 = field.getTranslatedY(this.breakPoints[i][1]);
	var x2 = field.getTranslatedX(this.breakPoints[i+1][0]);
	var y2 = field.getTranslatedY(this.breakPoints[i+1][1]);
	stroke(255, 0, 0);
	line(x1, y1, x2, y2);
	noStroke();
	fill(255, 0, 0)
  }
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


// Not prototype but maybe should be turned into prototypes

Player.prototype.getFlat = function(sideOfField){
  var y1 = height/2;
  var y2 = height/3;

  var x1 = 0;
  if(sideOfField > 0){
	x1 = width/2;
  }
  var x2 = x1 + width / 2;

  return [x1,y1,x2,y2];
};

Player.prototype.getDeepThird = function(sideOfField){
  var y1 = 0;
  var y2 = height/6;
  var x1 = 0;
  if(sideOfField > 0){
	x1 = width / 2;
  }
  var x2 = (x1 + width / 2);

  return [x1, y1, x2, y2];
};

Player.prototype.getDropZone = function(areaOfField){
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
  $.post( "/quiz/players/"+play.test.playerID+"/tests/"+play.test.id+"/update", {
	test: JSON.stringify(_.omit(play.test,'plays','defensivePlays', 'defensiveFormations', 'offensiveFormations')),
	play_id: play.id
  })
  play.test.newTest = false;
  return isCorrect
};



Player.prototype.movePlayer = function(field){
  var newX = field.getYardX(mouseX);
  if(newX < this.siz / 2){
	newX = this.siz / 2;
  }else if(newX > Field.WIDTH - this.siz / 2){
	newX = Field.WIDTH - this.siz / 2;
  }
  var newY = field.getYardY(mouseY);
  if (this.unit != "defense"){
	if(newY > field.ballYardLine - this.siz/2){
	  this.y = field.ballYardLine - this.siz/2;
	}else{
	  this.y = newY;
	}
  }
  else{
	this.y = newY;
  }
  this.x = newX;

  this.startX = this.x;
  this.startY = this.y;
  this.routeCoordinates[0][0] = this.x;
  this.routeCoordinates[0][1] = this.y;
};

Player.prototype.convertRouteDrawingToBreakPoints = function(){
  this.breakPoints = this.routeCoordinates.slice(1);
};

Player.prototype.saveToDB = function(){
  //create a connection to playerDB
  //get the variables we need for the DB in the proper format
  //push an entry into the players DB for this player with all data we need

};

Player.prototype.establishFill = function(){
  if(this.unit ==="defense"){
	this.red = 0;
	this.green = 0;
	this.blue = 0;
  }
  else{
	if(this.pos==="QB"){
	  this.red = 212;
	  this.green = 130;
	  this.blue = 130;
	}
	else if(this.pos==="OL" || this.pos ==="LT" || this.pos ==="LG" || this.pos ==="C" || this.pos ==="RG" || this.pos ==="RT"){
	  this.red = 143;
	  this.green = 29;
	  this.blue = 29;
	}
	else{
	  this.red = 255;
	  this.green = 0;
	  this.blue = 0;
	}
  }
  this.fill = color(this.red, this.green, this.blue);

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
  play = test.getCurrentPlay();
  if(test.getCurrentDefensivePlay().playerBeingTested() && test.getCurrentDefensivePlay().playerBeingTested().CBAssignmentPlayerID){
	var correctPlayer = test.getCurrentDefensivePlay().playerBeingTested().establishRightAnswerPlayer(test.getCurrentPlay());
  }
  else if (test.getCurrentPlay().playerBeingTested().blockingAssignmentPlayerIndex !== null){
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
  $.post( "/quiz/players/"+test.playerID+"/tests/"+test.id+"/update", {
	test: JSON.stringify(_.omit(test,'plays','defensivePlays', 'defensiveFormations', 'offensiveFormations')),
	play_id: play.id
  })
  test.newTest = false;
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

Player.prototype.establishRightAnswerPlayer = function(offensivePlay){
  var rightPlayer = offensivePlay.offensivePlayers.filter(function(player){
	return player.id === this.CBAssignmentPlayerID;
  }.bind(this))
  return rightPlayer[0];
};

var getPlayersFromZone = function(zone, play){
  var players = [];
  if(this.unit === "pffense"){
	for(var i = 0; i < play.offensivePlayers.length; i++){
	  if(play.offensivePlayers[i].isInsideZone(zone)){
		players.push(play.offensivePlayers[i]);
	  }
	}
  }
  if(this.unit === "defense"){
	for(var i = 0; i < defensivePlayers.length; i++){
	  if(defensivePlayers[i].isInsideZone(zone)){
		players.push(defensivePlayers[i]);
	  }
	}
  }
  return players;
};

var getDestination = function(distance, theta, x, y){
  var xDist = distance*Math.cos(theta);
  var yDist = -1*distance*Math.sin(theta);
  return [x + xDist, y + yDist];
};


var createPlayerFromJSONSeed = function(jsonPosition){
  jsonPosition.x = jsonPosition.startX;
  jsonPosition.y = jsonPosition.startY;
  var routeCoordinates = JSON.parse(jsonPosition.routeCoordinates);
  //var runCoordinates = JSON.parse(jsonPosition.fields.runCoordinates);
  var player = new Player(jsonPosition)
  player.id = jsonPosition.pk;
  player.blockingAssignmentUnitIndex = jsonPosition.blockingAssignmentUnitIndex
  player.blockingAssignmentPlayerIndex = jsonPosition.blockingAssignmentPlayerIndex
  player.runCoordinates = JSON.parse(jsonPosition.runCoordinates);
  player.pos = jsonPosition.name;
  player.num = jsonPosition.name;
  player.routeCoordinates = [[player.startX, player.startY]]
  if(routeCoordinates){
	player.breakPoints = routeCoordinates.slice(1, routeCoordinates.length);
  }

  if(jsonPosition.gapYardY){
	player.gapYPoint = jsonPosition.gapYardY;
	player.gapXPoint = jsonPosition.gapYardX;
  }
  if(jsonPosition.zoneYardY){
	player.zoneYPoint = jsonPosition.zoneYardY;
	player.zoneXPoint = jsonPosition.zoneYardX;
  }

  player.establishFill();

  return player;
};

var createPlayerFromJSON = function(jsonPosition){
  jsonPosition.fields.x = jsonPosition.fields.startX;
  jsonPosition.fields.y = jsonPosition.fields.startY;
  var routeCoordinates = JSON.parse(jsonPosition.fields.routeCoordinates);
  //var runCoordinates = JSON.parse(jsonPosition.fields.runCoordinates);
  var player = new Player(jsonPosition.fields)
  player.id = jsonPosition.pk;
  player.blockingAssignmentUnitIndex = jsonPosition.fields.blockingAssignmentUnitIndex
  player.blockingAssignmentPlayerIndex = jsonPosition.fields.blockingAssignmentPlayerIndex
  player.runCoordinates = JSON.parse(jsonPosition.fields.runCoordinates);
  player.pos = jsonPosition.fields.name;
  player.num = jsonPosition.fields.name;
  player.routeCoordinates = [[player.startX, player.startY]]
  if(routeCoordinates){
	player.breakPoints = routeCoordinates.slice(1, routeCoordinates.length);
  }

  if(jsonPosition.fields.gapYardY){
	player.gapYPoint = jsonPosition.fields.gapYardY;
	player.gapXPoint = jsonPosition.fields.gapYardX;
  }
  if(jsonPosition.fields.zoneYardY){
	player.zoneYPoint = jsonPosition.fields.zoneYardY;
	player.zoneXPoint = jsonPosition.fields.zoneYardX;
  }

  /*if(runCoordinates){
	player.runCoordinates = runCoordinates.slice(1, runCoordinates.length);
  }*/

  player.establishFill();

  return player
};

Player.prototype.drawGapAssignments = function(field) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var siz = field.yardsToPixels(this.siz);
  stroke(255, 0, 0);
  line(x, y, field.getTranslatedX(this.gapXPoint), field.getTranslatedY(this.gapYPoint));
  fill(255, 0, 0);
  noFill()
  ellipse(field.getTranslatedX(this.gapXPoint), field.getTranslatedY(this.gapYPoint), 10, 10);
};

Player.prototype.drawZoneAssignments = function(field) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var siz = field.yardsToPixels(this.siz);
  stroke(255, 0, 0);
  line(x, y, field.getTranslatedX(this.zoneXPoint), field.getTranslatedY(this.zoneYPoint));
  fill(255, 0, 0);
  noFill()
  rect(field.getTranslatedX(this.zoneXPoint), field.getTranslatedY(this.zoneYPoint), 40, 40);
};

Player.prototype.establishCBAssignment = function(offensiveFormation) {
  offensiveFormation.offensivePlayers.forEach(function(oPlayer){
	if(oPlayer.id === this.CBAssignmentPlayerID){
	  this.CBAssignment = oPlayer;
	}
  }.bind(this))
};
