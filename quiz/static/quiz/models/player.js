
//***************************************************************************//
//																			 //
// player.js - Right Call Consulting. All Rights Reserved. 2016				 //
//																			 //
//***************************************************************************//
//																			 //
// A player object represents some player on the field. The object keeps	 //
// track of all of it's assignments.                                         //
//																			 //
//***************************************************************************//

var Player = function(config) {
	// Main player member variables
	this.x = config.x || width/2;
	this.y = config.y || height/2;
	this.startX = this.x;
	this.startY = this.y;
	this.pos = config.pos || "X";
	this.siz = config.siz || 2;
	this.red = config.red || 0;
	this.blue = config.blue || 0;
	this.green = config.green || 0;
	this.selected = config.selected || false;
	this.eligible = config.eligible || false;

	// Player assignments - these should be converted into object types later on
	this.dropback = config.dropback || [];
	this.motionCoords = config.motionCoords || [];
	this.run = config.run || [];
	this.route = config.route || [];
	this.blockingAssignmentArray = config.blockingAssignmentArray || [];
	this.defensiveMovement = config.defensiveMovement || [];
	this.blitz = config.blitz || [];
	this.manCoverage = config.manCoverage || [];

	// Player notes and calls - strings used to add extra description to players assignments
	this.notes = config.notes || [];
	this.call = config.call || "";

	// Player movement - Sam is trying stuff here
	this.movementIndex = config.movementIndex || 0;

	// Older stuff
	this.clicked = config.clicked || false;
	this.fill = config.fill || color(0, 0, 0);
	this.stroke = config.stroke || noStroke();
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
	this.currentMotionBreak = config.currentMotionBreak || 0;
	this.zoneAssignment = config.zoneAssignment || 0;
	this.optionAssignment = config.optionAssignment || [];
	this.coverageAssignment = config.coverageAssignment || [];
};

//***************************************************************************//
//***************************************************************************//

Player.rank = 1;
Player.altRank = -1;

// click selects or unselects a player based on their current selected status.
// click does not return anything.
Player.prototype.click = function() {
	if (this.selected) {
		this.setUnselected();
	} else {
		this.setSelected();
	}

};

// setSelected changes the selected status to true and changes the color of the
// selected player.
Player.prototype.setSelected = function () {
	this.selected = true;

	var red = 255;
	var green = 255;
	var blue = 0;

	// TODO: impletment a different scheme for selecting defensive players.
	// Maybe try drawing a white ellipse behind them.

	this.setFill(red, green, blue);
};

// setUnselected changes the selected status to false and changes the color of
// the player to their default color.
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

// setFill changes the r, g, b values of the player.
Player.prototype.setFill = function(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;
};

// hasAssignments returns true is the player has a block, route, run, or
// dropback.
Player.prototype.hasAssignment = function() {
	if (this.dropback.length != 0) {
		return true;
	}

	if (this.motionCoords.length != 0) {
		return true;
	}

	if (this.run.length != 0) {
		return true;
	}

	if (this.route.length != 0) {
		return true;
	}

	if (this.blockingAssignmentArray.length != 0) {
		return true;
	}

	if (this.defensiveMovement.length != 0) {
		return true;
	}

	return false;
};

// draw draws the player on the field. It assumes the players coordinates
// are in yards and not pixels.
Player.prototype.draw = function(field) {
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

// pixelDraw draws the player on the field. It assumes the players coordinates
// are in yards and not pixels.
Player.prototype.pixelDraw = function(field) {
	if(this.unit === "offense") {
		noStroke();
		fill(this.red, this.green, this.blue);
		ellipse(this.x, this.y, this.siz, this.siz);
		fill(0,0,0);
		textSize(14);
		textAlign(CENTER, CENTER);
		text(this.pos, this.x, this.y);
	} else if (this.unit === "defense") {
		noStroke();
		fill(this.red, this.green, this.blue);
		textSize(17);
		textAlign(CENTER, CENTER);
		text(this.pos, this.x, this.y);
		fill(0,0,0);
	}
};

// drawAssignments draws all of a players assignments.
Player.prototype.drawAssignments = function(field){
	this.drawMotion(field);
	this.drawDropback(field);
	this.drawRun(field);
	this.drawRoute(field);
	this.drawBlocks(field);

	this.drawDefensiveMovement(field);
	this.drawBlitz(field);
	this.drawCoverage(field);
};

// drawMotion iterates through a players presnap motion landmarks and draws
// their motion in a dotted line.
Player.prototype.drawMotion = function(field){
	var x1 = field.getTranslatedX(this.x);
	var y1 = field.getTranslatedY(this.y);
	for (var i = 0; i < this.motionCoords.length; i++) {
		var x2 = field.getTranslatedX(this.motionCoords[i][0]);
		var y2 = field.getTranslatedY(this.motionCoords[i][1]);

		stroke(50, 50, 50);
		dottedLine(x1, y1, x2, y2);
		noStroke();

		x1 = x2;
		y1 = y2;
	}
};

// drawDropback iterates through a quarterbacks landmarks and draws their
// dropback.
Player.prototype.drawDropback = function(field) {
	var x1 = this.x;
	var y1 = this.y;

	if (this.motionCoords.length > 0) {
		x1 = this.motionCoords[this.motionCoords.length - 1][0]
		y1 = this.motionCoords[this.motionCoords.length - 1][1]
	}

	var x2 = x1;
	var y2 = y1;

	var yellow = color(255, 255, 0);
	stroke(yellow);

	for (var i = 0; i < this.dropback.length; i++) {
		x1 = x2;
		y1 = y2;
		x2 = this.dropback[i][0];
		y2 = this.dropback[i][1];

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		line(x1, y1, x2, y2);
		x1 = field.getYardX(x1);
		y1 = field.getYardY(y1);
		x2 = field.getYardX(x2);
		y2 = field.getYardY(y2);
	}
};

// drawRun iterates through a players landmarks and draws their run
// with an arrow at the end.
Player.prototype.drawRun = function(field) {
	var x1 = this.x;
	var y1 = this.y;

	if (this.motionCoords.length > 0) {
		x1 = this.motionCoords[this.motionCoords.length - 1][0]
		y1 = this.motionCoords[this.motionCoords.length - 1][1]
	}

	var x2 = x1;
	var y2 = y1;

	var blue = color(0, 0, 255);
	stroke(blue);

	for (var i = 0; i < this.run.length; i++) {
		x1 = x2;
		y1 = y2;
		x2 = this.run[i][0];
		y2 = this.run[i][1];

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		line(x1, y1, x2, y2);
		x1 = field.getYardX(x1);
		y1 = field.getYardY(y1);
		x2 = field.getYardX(x2);
		y2 = field.getYardY(y2);
	}

	// Draw arrow
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	var alpha = atan(deltaY/deltaX);

	arrow(x2, y2, alpha, deltaX);

	noStroke();
};

// drawRoute iterates through a players landmarks and draws their route
// with an arrow at the end.
Player.prototype.drawRoute = function(field) {
	var x1 = this.x;
	var y1 = this.y;

	if (this.motionCoords.length > 0) {
		x1 = this.motionCoords[this.motionCoords.length - 1][0]
		y1 = this.motionCoords[this.motionCoords.length - 1][1]
	}

	var x2 = x1;
	var y2 = y1;

	var red = color(255, 0, 0);
	stroke(red);

	for (var i = 0; i < this.route.length; i++) {
		x1 = x2;
		y1 = y2;
		x2 = this.route[i][0];
		y2 = this.route[i][1];

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		line(x1, y1, x2, y2);
		x1 = field.getYardX(x1);
		y1 = field.getYardY(y1);
		x2 = field.getYardX(x2);
		y2 = field.getYardY(y2);
	}

	// Draw arrow
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	var alpha = atan(deltaY/deltaX);

	arrow(x2, y2, alpha, deltaX);

	noStroke();
};

// drawAllBlocks iterates through the players blocking assignments and draws
// all of them. It calls noStroke before it exits, but has no return value.
Player.prototype.drawBlocks = function(field) {
	var prevX = this.x;
	var prevY = this.y;

	if (this.motionCoords.length > 0) {
		prevX = this.motionCoords[this.motionCoords.length - 1][0]
		prevY = this.motionCoords[this.motionCoords.length - 1][1]
	}

	var blockPart;
	for (var i = 0; i < this.blockingAssignmentArray.length; i++) {
		blockPart = this.blockingAssignmentArray[i]
		blockPart.draw(prevX, prevY, field)
		prevX = blockPart.x
		prevY = blockPart.y

		if (blockPart.type === 1 && blockPart.player !== null) {
			var defensiveMovement = blockPart.player.defensiveMovement
			var defensiveMovementLength = defensiveMovement.length
			if (defensiveMovementLength > 0) {
				prevX = defensiveMovement[defensiveMovementLength-1][0]
				prevY = defensiveMovement[defensiveMovementLength-1][1]
			} else {
				prevX = blockPart.player.x
				prevY = blockPart.player.y - (blockPart.player.siz / 3)
			}
		}
	}

	if (blockPart != null && !this.selected && blockPart.type === 0) {
		var black = color(0, 0, 0);
		stroke(black);

		var lengthOfPerpLine = 1.5;
		var x1 = blockPart.x + lengthOfPerpLine/2;
		var y1 = blockPart.y;
		var x2 = blockPart.x - lengthOfPerpLine/2;
		var y2 = blockPart.y;

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		line(x1, y1, x2, y2);

		noStroke();
	}
};

Player.prototype.runPreSnap = function(){
	if(this.movementIndex < this.motionCoords.length){
		var dest = this.motionCoords[this.movementIndex];
		if(this.moveTo(dest[0], dest[1])){
			this.movementIndex++;
		}
		return false;
	}
	return true;
}

Player.prototype.runPostSnap = function(){
	if(this.movementIndex < this.blockingAssignmentArray.length){
		var dest = this.blockingAssignmentArray[this.movementIndex];
		var destX = dest.x;
		var destY = dest.y;
		if(dest.type === 1 && dest.player !== null){
			destX = dest.player.x;
			destY = dest.player.y;
			var defensiveMovementLength = dest.player.defensiveMovement.length;
			if(defensiveMovementLength > 0){
				destX = dest.player.defensiveMovement[defensiveMovementLength-1][0]
				destY = dest.player.defensiveMovement[defensiveMovementLength-1][1]
			}
		}
		if(this.moveTo(destX, destY)){
			this.movementIndex++;
		}
		return false;
	}if(this.movementIndex < this.route.length){
		var dest = this.route[this.movementIndex];
		if(this.moveTo(dest[0], dest[1])){
			this.movementIndex++;
		}
		return false;
	}if(this.movementIndex < this.dropback.length){
		var dest = this.dropback[this.movementIndex];
		if(this.moveTo(dest[0], dest[1])){
			this.movementIndex++;
		}
		return false;
	}if(this.movementIndex < this.run.length){
		var dest = this.run[this.movementIndex];
		if(this.moveTo(dest[0], dest[1])){
			this.movementIndex++;
		}
		return false;
	}if(this.movementIndex < this.defensiveMovement.length){
		var dest = this.defensiveMovement[this.movementIndex];
		if(this.moveTo(dest[0], dest[1])){
			this.movementIndex++;
		}
		return false;
	}
	return true;
}

// moveTo advances a player towards their next breakpoint. It returns true if
// the player is at their final point and false if they are not.
Player.prototype.moveTo = function(x, y) {
	var xDist = (x-this.x);
	if (x < 0) {
		xDist = 0-this.x;
	}

	var yDist = (y-this.y);
	if (y < 0) {
		yDist = 0-this.y;
	}

	var hDist = Math.sqrt(xDist*xDist+yDist*yDist);
	var numMoves = hDist / this.speed;
	if (numMoves < 1) {
		return true;
	}

	var xRate = xDist / numMoves;
	var yRate = yDist / numMoves;

	this.x += xRate;
	this.y += yRate;
	return false;
};

// drawDefensiveMovement iterates through the players defensive movements
// and draws a dotted line to the plave on the field they should be
Player.prototype.drawDefensiveMovement = function(field) {
	if(this.defensiveMovement.length === 0){
		return;
	}
	var x1 = this.x;
	var y1 = this.y;
	var x2 = this.x;
	var y2 = this.y;

	var gray = color(60, 60, 60);
	stroke(gray);

	for (var i = 0; i < this.defensiveMovement.length; i++) {
		x1 = x2;
		y1 = y2;
		x2 = this.defensiveMovement[i][0];
		y2 = this.defensiveMovement[i][1];

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		dottedLine(x1, y1, x2, y2);
		x1 = field.getYardX(x1);
		y1 = field.getYardY(y1);
		x2 = field.getYardX(x2);
		y2 = field.getYardY(y2);

	}

	if(this.blitz.length === 0){
		// Draw arrow
		var deltaX = x2 - x1;
		var deltaY = y2 - y1;
		var alpha = atan(deltaY/deltaX);

		arrow(x2, y2, alpha, deltaX);
	}


	noStroke();
};

Player.prototype.drawBlitz = function(field){
	if(this.blitz.length === 0){
		return;
	}
	var x1 = this.x;
	var y1 = this.y;

	if(this.defensiveMovement.length > 0){
		x1 = this.defensiveMovement[this.defensiveMovement.length - 1][0]
		y1 = this.defensiveMovement[this.defensiveMovement.length - 1][1]
	}

	var x2 = x1;
	var y2 = y1;

	var red = color(255, 0, 0);
	stroke(red);

	for (var i = 0; i < this.blitz.length; i++) {
		x1 = x2;
		y1 = y2;
		x2 = this.blitz[i][0];
		y2 = this.blitz[i][1];

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		line(x1, y1, x2, y2);
		x1 = field.getYardX(x1);
		y1 = field.getYardY(y1);
		x2 = field.getYardX(x2);
		y2 = field.getYardY(y2);

	}

	// Draw arrow
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	var alpha = atan(deltaY/deltaX);

	arrow(x2, y2, alpha, deltaX);

	noStroke();
};

Player.prototype.drawCoverage = function(field){
	this.drawManCoverage(field);
	//this.drawZoneCoverage(field);
}

Player.prototype.drawManCoverage = function(field){
	if(this.manCoverage.length === 0){
		return;
	}
	var x1 = this.x;
	var y1 = this.y;

	if(this.defensiveMovement.length > 0){
		x1 = this.defensiveMovement[this.defensiveMovement.length - 1][0]
		y1 = this.defensiveMovement[this.defensiveMovement.length - 1][1]
	}

	var x2 = x1;
	var y2 = y1;

	var black = color(0, 0, 0);
	stroke(black);

	for (var i = 0; i < this.manCoverage.length; i++) {
		x1 = x2;
		y1 = y2;
		x2 = this.manCoverage[i].x;
		y2 = this.manCoverage[i].y;

		x1 = field.getTranslatedX(x1);
		y1 = field.getTranslatedY(y1);
		x2 = field.getTranslatedX(x2);
		y2 = field.getTranslatedY(y2);
		line(x1, y1, x2, y2);
		x1 = field.getYardX(x1);
		y1 = field.getYardY(y1);
		x2 = field.getYardX(x2);
		y2 = field.getYardY(y2);

	}

	// Draw arrow
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	var alpha = atan(deltaY/deltaX);

	arrow(x2, y2, alpha, deltaX);

	noStroke();
};

// deepCopy returns a new Player object that is exactly the same as this.
Player.prototype.deepCopy = function() {
	var deepCopy = new Player({
		x: this.x,
		y: this.y,
		startX: this.startX,
		startY: this.startY,
		siz: this.siz,
		red: this.red,
		blue: this.blue,
		green: this.green,
		eligible: this.eligible,
		selected: this.selected,
		pos: this.pos,
		num: this.num,
		unit: this.unit,
		name: this.name,
		notes: this.notes,
		call: this.call
	});

	for (var i = 0; i < this.dropback.length; ++i) {
		deepCopy.dropback.push([this.dropback[i][0], this.dropback[i][1]]);
	}

	for (var i = 0; i < this.motionCoords.length; ++i) {
		deepCopy.motionCoords.push([this.motionCoords[i][0], this.motionCoords[i][1]]);
	}

	for (var i = 0; i < this.run.length; ++i) {
		deepCopy.run.push([this.run[i][0], this.run[i][1]]);
	}

	for (var i = 0; i < this.route.length; ++i) {
		deepCopy.route.push([this.route[i][0], this.route[i][1]]);
	}

	for (var i = 0; i < this.blockingAssignmentArray.length; ++i) {
		var blockingAssignment = new BlockType ({
			type: this.blockingAssignmentArray[i].type,
			x: this.blockingAssignmentArray[i].x,
			y: this.blockingAssignmentArray[i].y
		});

		if (blockingAssignment.type === 1) {
			blockingAssignment.player = this.blockingAssignmentArray[i].player.deepCopy();
		}

		deepCopy.blockingAssignmentArray.push(blockingAssignment);
	}

	for (var i = 0; i < this.defensiveMovement.length; ++i) {
		deepCopy.defensiveMovement.push([this.defensiveMovement[i][0], this.defensiveMovement[i][1]]);
	}

	return deepCopy;
};

// drawBlockOnPlayer draws a block from a specific starting point to a
// defense player that the offensive player is assigned to block. It
// returns a 1x2 array containing the offensive players new coordinates
// after completing their block.
Player.prototype.drawBlockOnPlayer = function(field, currentX, currentY, assignment) {
	var assignmentX = assignment.x;
	var assignmentY = assignment.y;
	var deltaX = assignmentX - currentX;
	var deltaY = assignmentY - currentY;
	var distToAssignment = sqrt(pow(deltaX, 2) + pow(deltaY, 2));
	var alpha = atan(deltaY/deltaX);
	var bufferFromAssignment = assignment.siz/3;

	var dist = distToAssignment - bufferFromAssignment;
	var xDiff = cos(alpha)*dist;
	var yDiff = sin(alpha)*dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2, y2;

	if (deltaX >= 0) {
		x2 = currentX + xDiff;
		y2 = currentY + yDiff;
	} else {
		x2 = currentX - xDiff;
		y2 = currentY - yDiff;
	}

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the block
	var lengthOfPerpLine = 1.5;
	xDiff = sin(alpha)*lengthOfPerpLine/2;
	yDiff = cos(alpha)*lengthOfPerpLine/2;
	x1 = x2 + xDiff;
	y1 = y2 - yDiff;
	x2 = x2 - xDiff;
	y2 = y2 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawBlockingMovement draws a straight line from (x1, y1) to (x2, y2) as a
// part of a blocking assignment. There is no perpendicular blocking line drawn
// at the end.
Player.prototype.drawBlockingMovement = function(field, x1, y1, x2, y2) {
	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	return new_coordinates;
};

// drawBlockingMovementWithEnd draws a straight line from (x1, y1) to (x2, y2)
// as a part of a blocking assignment. There is a perpendicular blocking line
// drawn at the end.
Player.prototype.drawBlockingMovementWithEnd = function(field, x1, y1, x2, y2) {
	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the block
	var lengthOfPerpLine = 1.5;
	var alpha = atan((y2 - y1)/(x2 - x1));
	var xDiff = sin(alpha)*lengthOfPerpLine/2;
	var yDiff = cos(alpha)*lengthOfPerpLine/2;
	x1 = x2 + xDiff;
	y1 = y2 - yDiff;
	x2 = x2 - xDiff;
	y2 = y2 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawMoneyBlock draws a man on block. It returns a 1x2 array containing
// the offensive players new coordinates after completing their block.
Player.prototype.drawMoneyBlock = function(field, currentX, currentY) {
	var dist = 1.5;
	var xDiff = 0;
	var yDiff = dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX - xDiff;
	var y2 = currentY + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawDownBlockRight draws a down block to the right. It returns a 1x2
// array containing the offensive players new coordinates after completing
// their block.
Player.prototype.drawDownBlockRight = function(field, currentX, currentY) {
	var dist = 2;
	var xDiff = (dist/2)*sqrt(2);
	var yDiff = (dist/2)*sqrt(2);

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX + xDiff;
	var y2 = currentY + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 + yDiff;
	x2 = x2 + xDiff;
	y2 = y2 - yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawDownBlockLeft draws a down block to the left. It returns a 1x2
// array containing the offensive players new coordinates after completing
// their block.
Player.prototype.drawDownBlockLeft = function(field, currentX, currentY) {
	var dist = 2;
	var xDiff = (dist/2)*sqrt(2);
	var yDiff = (dist/2)*sqrt(2);

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX - xDiff;
	var y2 = currentY + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = lengthOfPerpLine/2;
	yDiff = 0;
	x1 = x2 - xDiff;
	y1 = y2 + yDiff;
	x2 = x2 + xDiff;
	y2 = y2 - yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawStraightSealRight draws a straight block that seals the right side of
// the field. It returns a 1x2 array containing the offensive players new
// coordinates after completing their block.
Player.prototype.drawStraightSealRight = function(field, currentX, currentY) {
	var dist = 3;
	var xDiff = 0;
	var yDiff = dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX + xDiff;
	var y2 = currentY + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = (lengthOfPerpLine/4)*sqrt(2);
	yDiff = (lengthOfPerpLine/4)*sqrt(2);
	x1 = x2 - xDiff;
	y1 = y2 - yDiff;
	x2 = x2 + xDiff;
	y2 = y2 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawStraightSealLeft draws a straight block that seals the left side of
// the field. It returns a 1x2 array containing the offensive players new
// coordinates after completing their block.
Player.prototype.drawStraightSealLeft = function(field, currentX, currentY) {
	var dist = 3;
	var xDiff = 0;
	var yDiff = dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2 = currentX - xDiff;
	var y2 = currentY + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = (lengthOfPerpLine/4)*sqrt(2);
	yDiff = (lengthOfPerpLine/4)*sqrt(2);
	x1 = x2 - xDiff;
	y1 = y2 + yDiff;
	x2 = x2 + xDiff;
	y2 = y2 - yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawKickOutRight draws a kick out block to the right. It returns a 1x2
// array containing the offensive players new coordinates after completing
// their block.
Player.prototype.drawKickOutRight = function(field, currentX, currentY) {
	var dist = 1.5;
	var alpha = 55*(PI/180);
	var xDiff = cos(alpha)*dist;
	var yDiff = sin(alpha)*dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2, y2;

	x2 = currentX + xDiff;
	y2 = currentY - yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	dist = 3;
	xDiff = cos(alpha)*dist;
	yDiff = sin(alpha)*dist;
	x1 = x2;
	y1 = y2;
	x2 = x1 + xDiff;
	y2 = y1 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = sin(alpha)*lengthOfPerpLine/2;
	yDiff = cos(alpha)*lengthOfPerpLine/2;
	x1 = x2 + xDiff;
	y1 = y2 - yDiff;
	x2 = x2 - xDiff;
	y2 = y2 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

// drawKickOutLeft draws a kick out block to the left. It returns a 1x2
// array containing the offensive players new coordinates after completing
// their block.
Player.prototype.drawKickOutLeft = function(field, currentX, currentY) {
	var dist = 1.5;
	var alpha = 55*(PI/180);
	var xDiff = cos(alpha)*dist;
	var yDiff = sin(alpha)*dist;

	// Angled line that shows the direction of the downblock
	var x1 = currentX;
	var y1 = currentY;
	var x2, y2;

	x2 = currentX - xDiff;
	y2 = currentY - yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	dist = 3;
	xDiff = cos(alpha)*dist;
	yDiff = sin(alpha)*dist;
	x1 = x2;
	y1 = y2;
	x2 = x1 - xDiff;
	y2 = y1 + yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	var new_coordinates = [x2, y2];

	// Perpendicular line at the end of the down block
	var lengthOfPerpLine = 1.5;
	xDiff = sin(alpha)*lengthOfPerpLine/2;
	yDiff = cos(alpha)*lengthOfPerpLine/2;
	x1 = x2 + xDiff;
	y1 = y2 + yDiff;
	x2 = x2 - xDiff;
	y2 = y2 - yDiff;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);

	return new_coordinates;
};

/******************************************************************************************************************************/
/******************************************************************************************************************************/

Player.prototype.getX = function(field) { return field.yardsToPixels(this.getYardX() - field.getXOffset()); };

Player.prototype.getY = function(field) { return field.height - field.yardsToPixels(this.getYardY() - field.getYOffset()); };

Player.prototype.getYardX = function() { return this.x; };

Player.prototype.getYardY = function() { return this.y; };

Player.prototype.setColor = function(newFillColor) { this.fill = newFillColor; };

Player.prototype.clearRoute = function() { this.route = []; };

Player.prototype.checkPosition = function(test) { test.scoreboard.feedbackMessage = "You are at: " + this.x + "," + this.y; };

// isMouseInside returns true if the mouse coordinates are somewhere inside
// this player.
Player.prototype.isMouseInside = function(field) {
	var siz = field.yardsToPixels(this.siz);
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var dist = Math.sqrt( (mouseX - x)*(mouseX - x)+(mouseY - y)*(mouseY - y) );
	return dist <= siz/2;
};

// pixelIsMouseInside returns true if the mouse coordinates are somewhere
// inside this player.
Player.prototype.pixelIsMouseInside = function(field) {
	var siz = this.siz;
	var x = this.x;
	var y = this.y;
	var dist = Math.sqrt((mouseX-x)*(mouseX-x)+(mouseY-y)*(mouseY-y));
	return dist <= siz/2;
};

// containsPoint takes an arbitrary set of coordinates as an argument and
// returns true if that set of coordinates if inside the player.
Player.prototype.containsPoint = function(x, y){
	var dist = Math.sqrt((x-this.x)*(x-this.x)+(y-this.y)*(y-this.y));
	return dist <= this.siz/2;
}

// moveAtAngle takes a distance and an angle and moves this player.
Player.prototype.moveAtAngle = function(distance, theta) {
	var xDist = distance*Math.cos(theta);
	var yDist = -1*distance*Math.sin(theta);
	this.moveTo(this.startX + xDist, this.startY + yDist);
};

// resetToStart moves teh player back to their original picture.
Player.prototype.resetToStart = function(){
	this.x = this.startX;
	this.y = this.startY;
	this.currentBreak = 0;
};

// zone is an array [x1,y1,x2,y2]
Player.prototype.coverZone = function(zone, play){
	var newX = (zone[2] + zone[0])/2;
	var newY = (zone[3] + zone[1])/2;

	var playersInZone = getPlayersFromZone(zone, play);
	var closestPlayer = null;

	for(var i = 0; i < playersInZone.length; i++) {
		var player = playersInZone[i];
		if (player !== this) {
			if (closestPlayer === null) {
				closestPlayer = player;
			} else {
				var xDist = this.x - closestPlayer.x;
				var yDist = this.y - closestPlayer.y;
				var d1 = Math.sqrt(xDist*xDist + yDist*yDist);
				xDist = this.x - player.x;
				yDist = this.y - player.y;
				var d2 = Math.sqrt(xDist*xDist + yDist*yDist);
				if(d2 < d1){
					closestPlayer = player;
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

/******************************************************************************************************************************/
/******************************************************************************************************************************/

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

Player.prototype.drawRouteCoordinates = function(field) {
	this.breakPoints = this.routeCoordinates.slice();
	this.drawRoute(field);
};

Player.prototype.drawBreakPoints = function(field) {
	var x1 = field.getTranslatedX(this.startX);
	var y1 = field.getTranslatedY(this.startY);

	if (this.breakPoints.length > 0) {
		var x2 = field.getTranslatedX(this.breakPoints[0][0]);
		var y2 = field.getTranslatedY(this.breakPoints[0][1]);
		stroke(255, 0, 0);
		line(x1,y1,x2,y2);
		noStroke();
		fill(255, 0, 0);
	}

	for(var i = 0; i < this.breakPoints.length - 1; i++) {
		x1 = field.getTranslatedX(this.breakPoints[i][0]);
		y1 = field.getTranslatedY(this.breakPoints[i][1]);
		var x2 = field.getTranslatedX(this.breakPoints[i+1][0]);
		var y2 = field.getTranslatedY(this.breakPoints[i+1][1]);
		stroke(255, 0, 0);
		line(x1, y1, x2, y2);
		noStroke();
		fill(255, 0, 0);
	}
};

Player.prototype.coverMan = function(opponent) {
	var oppX = opponent.x;
	var oppY = opponent.y;
	var xDist = (oppX-this.x);
	var yDist = (oppY-this.y);
	var hDist = Math.sqrt(xDist*xDist+yDist*yDist);
	var numMoves = hDist / this.speed;
	var xRate = xDist / numMoves;
	var yRate = yDist / numMoves;

	if(abs(xDist) > 10) {
		this.x += xRate;
	}else {
		this.x += xRate/2.0;
	}

	if(yDist > 0) {
		this.y += yRate/2.0;
		this.x += xRate/2.0;
	} else if(yDist < -10) {
		this.y += yRate;
	} else {
		this.y += yRate/2.0;
	}
};

Player.prototype.blitzGapScene = function() {
	var gapX = this.gapXPoint;
	var gapY = this.gapYPoint;
	this.moveTo(gapX, gapY);
};

Player.prototype.coverZoneScene = function() {
	var zoneX = this.zoneXPoint;
	var zoneY = this.zoneYPoint;
	this.moveTo(zoneX, zoneY);
};

Player.prototype.coverManScene = function(receiver) {
	var destX = receiver.x;
	var destY = receiver.y + 2;
	this.moveTo(destX, destY);
};


Player.prototype.blockMan = function(opponent, shade, isPull) {
	var oppX = opponent.x + shade * opponent.siz / 2;
	var oppY = opponent.y + opponent.siz/2;
	this.moveTo(oppX, oppY);
};

Player.prototype.isInsideZone = function(zone) {
	if(zone[0] > zone[2]) {
		var tmp = zone[0];
		zone[0] = zone[2];
		zone[2] = tmp;
	}

	if(zone[1] > zone[3]) {
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
	if(this.startX > center.startX) {
		direction = -1;
	}

	switch(val) {
		case 0: this.runSlant(direction); break;
		case 1: this.runArrow(direction); break;
		case 2: this.runPost(direction); break;
		case 3: this.runDeepPost(direction); break;
		case 4: this.runFade(); break;//this.runDeepCorner(center, direction); break;
		case 5: this.runDeepCorner(direction); break;//this.runFade(); break;
	}
};

Player.prototype.runRoute = function(){
	if(this.currentBreak < 0 || this.currentBreak >= this.breakPoints.length) {
		return; //TODO - dono
	}

	if(this.moveTo(this.breakPoints[this.currentBreak][0], this.breakPoints[this.currentBreak][1])) {
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
  player.blockingCoordinates = JSON.parse(jsonPosition.blockingCoordinates);
	player.motionCoords = jsonPosition.motionCoords;
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
	player.motionCoords = jsonPosition.motionCoords;
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
