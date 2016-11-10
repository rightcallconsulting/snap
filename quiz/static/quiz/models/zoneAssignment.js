
//***************************************************************************//
//																			 //
// zoneAssignment.js - Right Call Consulting. All Rights Reserved. 2016			 //
//																			 //
//***************************************************************************//
//																			 //
//           //
//																			 //
//***************************************************************************//

//@param type: String code (1/4, 1/2, etc.)
//@param theta: (optional) direction of arrow
var ZoneAssignment = function(config) {
	this.type = config.type || "1/4";
	//this.theta = config.theta || null; //null means no arrow, 0 => 2*PI are valid theta values
	this.x = config.x || null;
	this.y = config.y || null;
};

ZoneAssignment.ARROW_LENGTH = 1.5;

//***************************************************************************//
//***************************************************************************//

// draw determines the type of the block and calls the appropriate draw
// function for that type of block.
ZoneAssignment.prototype.draw = function(startX, startY, field) {
	var black = color(0, 0, 0);
	stroke(black);
	textAlign(CENTER);
	textSize(12); //field.getTextSize()???

	var x1 = field.getTranslatedX(startX)
	var y1 = field.getTranslatedY(startY)

	if(this.x == null || this.y == null){
		//draw label but no arrow
		text(this.type, x1, y1-field.yardsToPixels(1));
		return;
	}

	var x2 = field.getTranslatedX(this.x)
	var y2 = field.getTranslatedY(this.y)

	var xMid = (x1+x2)/2; var yMid = (y1+y2)/2;

	//draw the label at the midpoint
	text(this.type, xMid, yMid-field.yardsToPixels(1));

	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	//draw the arrow
	var dx = (x2-x1);
	var dy = (y2-y1);
	var theta = atan(dy/dx);

	arrow(x2, y2, theta, dx);

	noStroke()
};
