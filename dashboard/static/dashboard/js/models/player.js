
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
	this.unit = config.unit || "offense";

	// Player assignments - these could be converted into object types later on
	this.dropback = config.dropback || [];
	this.motionCoords = config.motionCoords || [];
	this.run = config.run || [];
	this.route = config.route || [];
	this.blockingAssignmentArray = config.blockingAssignmentArray || [];
	this.defensiveMovement = config.defensiveMovement || [];
	this.blitz = config.blitz || [];
	this.manCoverage = config.manCoverage || [];
	this.zoneCoverage = config.zoneCoverage || null;
	this.progressionRank = config.progressionRank || 0;

	// Player notes and calls - strings used to add extra description to players assignments
	this.notes = config.notes || [];
	this.call = config.call || "";

	// Player movement - Sam is trying stuff here
	this.movementIndex = config.movementIndex || 0;
};

//***************************************************************************//
//***************************************************************************//

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

Player.prototype.clearAssignments = function(){
	this.dropback = [];
	this.motionCoords = [];
	this.run = [];
	this.route = [];
	this.blockingAssignmentArray = [];
	this.defensiveMovement = [];
	this.blitz = [];
	this.manCoverage = [];
	this.zoneCoverage = null;

}
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

	if (this.blitz.length != 0) {
		return true;
	}

	if (this.zoneCoverage != null) {
		return true;
	}

	if (this.manCoverage.length > 0) {
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
	if(this.run.length === 0){
		return;
	}
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
	if(this.route.length === 0){
		return;
	}
	var x1 = this.x;
	var y1 = this.y;

	if (this.motionCoords.length > 0) {
		x1 = this.motionCoords[this.motionCoords.length - 1][0]
		y1 = this.motionCoords[this.motionCoords.length - 1][1]
	}

	var x2 = x1;
	var y2 = y1;

	var red = color(255, 0, 0);
	var white = color(255, 255, 255);
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

		if(i === 0 && this.progressionRank > 0){
			var xMid = (x1+x2)/2;
			var yMid = (y1+y2)/2;
			var xLabel = xMid + field.yardsToPixels(1);
			var yLabel = yMid + field.yardsToPixels(1);
			textSize(14);
			fill(white);
			noStroke();
			text(str(this.progressionRank), xLabel, yLabel);
			stroke(red);
			fill(red);
		}

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
	if(this.blockingAssignmentArray.length === 0){
		return;
	}

	var prevX = this.x;
	var prevY = this.y;

	if (this.motionCoords.length > 0) {
		prevX = this.motionCoords[this.motionCoords.length - 1][0]
		prevY = this.motionCoords[this.motionCoords.length - 1][1]
	}

	var blockPart;
	var playersBlocked = 0;
	for (var i = 0; i < this.blockingAssignmentArray.length; i++) {
		blockPart = this.blockingAssignmentArray[i]
		blockPart.draw(prevX, prevY, field, playersBlocked)
		prevX = blockPart.x
		prevY = blockPart.y

		if (blockPart.type === 1 && blockPart.player !== null) {
			playersBlocked++;
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

	if (blockPart != null && blockPart.type === 0) {
		var black = color(0, 0, 0);
		stroke(black);

		var lengthOfPerpLine = 1.5;
		var x1 = this.x//blockPart.x + lengthOfPerpLine/2;
		var y1 = this.y//blockPart.y;
		var x2 = blockPart.x;//blockPart.x - lengthOfPerpLine/2;
		var y2 = blockPart.y;//blockPart.y;

		if(this.blockingAssignmentArray.length > 1){
			x1 = this.blockingAssignmentArray[this.blockingAssignmentArray.length - 2].x;
			y1 = this.blockingAssignmentArray[this.blockingAssignmentArray.length - 2].y;
		}

		var deltaY = y2 - y1;
		var deltaX = x2 - x1;
		var alpha = atan(-1* deltaX/deltaY);

		x1 = x2 - lengthOfPerpLine*cos(alpha)/2;
		y1 = y2 - lengthOfPerpLine*sin(alpha)/2;
		x2 = x2 + lengthOfPerpLine*cos(alpha)/2;
		y2 = y2 + lengthOfPerpLine*sin(alpha)/2;

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
	this.drawZoneCoverage(field);
}

Player.prototype.drawZoneCoverage = function(field){
	if(this.zoneCoverage != null){
		var startX = this.x;
		var startY = this.y;
		if(this.defensiveMovement.length > 0){
			startX = this.defensiveMovement[this.defensiveMovement.length-1][0];
			startY = this.defensiveMovement[this.defensiveMovement.length-1][1];
		}
		this.zoneCoverage.draw(startX, startY, field);
	}
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
		unit: this.unit,
		name: this.name,
		notes: this.notes,
		call: this.call,
		progressionRank: this.progressionRank
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

	for (var i = 0; i < this.blitz.length; ++i) {
		deepCopy.blitz.push([this.blitz[i][0], this.blitz[i][1]]);
	}

	for (var i = 0; i < this.manCoverage.length; ++i){
		deepCopy.manCoverage.push(this.manCoverage[i].deepCopy());
	}

	if(this.zoneCoverage != null){
		deepCopy.zoneCoverage = this.zoneCoverage.deepCopy();
	}

	return deepCopy;
};

/******************************************************************************************************************************/
/******************************************************************************************************************************/

Player.prototype.getX = function(field) { return field.getTranslatedX(this.x); };

Player.prototype.getY = function(field) { return field.getTranslatedY(this.y); };

Player.prototype.getYardX = function() { return this.x; };

Player.prototype.getYardY = function() { return this.y; };

Player.prototype.clearRoute = function() { this.route = []; };

// isMouseInside returns true if the mouse coordinates are somewhere inside
// this player.
Player.prototype.isMouseInside = function(field) {
	var siz = field.yardsToPixels(this.siz);
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var dist = Math.sqrt( (mouseX - x)*(mouseX - x)+(mouseY - y)*(mouseY - y) );
	return dist <= siz/2;
};

Player.prototype.pixelIsMouseInside = function(field){
	var siz = this.siz;
	var x = this.x;
	var y = this.y;
	var dist = Math.sqrt( (mouseX - x)*(mouseX - x)+(mouseY - y)*(mouseY - y) );
	return dist <= siz/2;
}
