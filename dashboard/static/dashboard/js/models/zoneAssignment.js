
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
	this.x = config.x || null;
	this.y = config.y || null;
};

ZoneAssignment.ARROW_LENGTH = 1.5;

//***************************************************************************//
//***************************************************************************//

// draw determines the type of the block and calls the appropriate draw
// function for that type of block.
ZoneAssignment.prototype.draw = function(startX, startY, field) {
	stroke(Colors.zoneCoverageColor())
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

	var theta = atan((y2-y1)/(x2-x1));

	if(x2 < x1){
		theta = PI + theta;
	}

	var xDiff = ZoneAssignment.ARROW_LENGTH * cos(theta)
	var yDiff = ZoneAssignment.ARROW_LENGTH * sin(theta)
	var xLabel = x2 + field.yardsToPixels(xDiff)
	var yLabel = y2 + field.yardsToPixels(yDiff)

	//var xLabel =

	//draw the label at the endpoint
	fill(Colors.blackColor());
	text(this.type, xLabel, yLabel);

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

ZoneAssignment.prototype.to_dict = function(){
	return {type: this.type, x: this.x, y: this.y}
}

ZoneAssignment.prototype.deepCopy = function(){
	return new ZoneAssignment(this.to_dict())
}
