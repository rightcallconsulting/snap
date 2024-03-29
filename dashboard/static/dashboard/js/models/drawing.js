//***************************************************************************//
//																			 //
// drawing.js - Right Call Consulting. All Rights Reserved. 2016			 //
//																			 //
//***************************************************************************//
//																			 //
// Drawing defines a set of drawing functions that can be used in different  //
// views. These functions are build around functions in the p5.js library.	 //
//																			 //
//***************************************************************************//

// draws a dotted line from x1, y1 to x2, y2.
function dottedLine(x1, y1, x2, y2) {
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	var dist = sqrt(pow(deltaX, 2) + pow(deltaY, 2));
	var alpha = atan(deltaY/deltaX);
	var segmentDist = 5;
	var stepSizePercentage = segmentDist/dist;

	var xDiff = cos(alpha)*segmentDist;
	var yDiff = sin(alpha)*segmentDist;

	if (deltaX < 0) {
		xDiff = -xDiff;
		yDiff = -yDiff;
	}

	var xStart = x1;
	var yStart = y1;
	var xEnd = x1+xDiff;
	var yEnd = y1+yDiff;

	for (var i = 0; i < 1/stepSizePercentage; ++i) {
		if (i%2 == 0) {
			var j = i+1;
			if (j >= 1/stepSizePercentage) {
				xEnd = x2;
				yEnd = y2;
			}
			line(xStart, yStart, xEnd, yEnd);
		}

		xStart = xEnd;
		yStart = yEnd;
		xEnd += xDiff;
		yEnd += yDiff;
	}
};

// draws an arrow at point x1, y1 facing in the direciton of alpha.
function arrow(x1, y1, alpha, deltaX) {
	var lengthOfArrow = 0.6;
	var beta = (45*(PI/180)) - alpha;
	var xDiff = cos(beta)*lengthOfArrow;
	var yDiff = sin(beta)*lengthOfArrow;

	var x2 = x1 + yDiff;
	var y2 = y1 + xDiff;

	if (deltaX >= 0) {
		x2 = x1 - yDiff;
		y2 = y1 - xDiff;
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

	if (deltaX >= 0) {
		x2 = x1 - xDiff;
		y2 = y1 + yDiff;
	} else {
		x2 = x1 + xDiff;
		y2 = y1 - yDiff;
	}

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
};

function perpendicularLine(x1, y1, x2, y2){
	var lengthOfPerpLine = 1.5;

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
}

// draws prongs at point x1, y1 facing in the direciton of alpha (for man coverage).
function prongs(x1, y1, x2, y2) {
	var lengthOfPerpLine = 1.5;
	var lengthOfParallelLines = lengthOfPerpLine/2;

	var deltaY = y2 - y1;
	var deltaX = x2 - x1;
	var perp_alpha = atan(-1* deltaX/deltaY);
	var alpha = atan(deltaY/deltaX);
	var xDiff = cos(alpha)*lengthOfParallelLines;
	var yDiff = sin(alpha)*lengthOfParallelLines;
	if(deltaX < 0){
		xDiff *= -1;
		yDiff *= -1;
	}

	x1 = x2 - lengthOfPerpLine*cos(perp_alpha)/2;
	y1 = y2 - lengthOfPerpLine*sin(perp_alpha)/2;
	x2 = x2 + lengthOfPerpLine*cos(perp_alpha)/2;
	y2 = y2 + lengthOfPerpLine*sin(perp_alpha)/2;

	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);
	line(x1, y1, x2, y2);
	x1 = field.getYardX(x1);
	y1 = field.getYardY(y1);
	x2 = field.getYardX(x2);
	y2 = field.getYardY(y2);

	//continue out from x1, y1 in alpha direction; then do same from x2, y2

	var dest1X = field.getTranslatedX(x1 + xDiff);
	var dest1Y = field.getTranslatedY(y1 + yDiff);
	var dest2X = field.getTranslatedX(x2 + xDiff);
	var dest2Y = field.getTranslatedY(y2 + yDiff);
	x1 = field.getTranslatedX(x1);
	y1 = field.getTranslatedY(y1);
	x2 = field.getTranslatedX(x2);
	y2 = field.getTranslatedY(y2);

	line(x1, y1, dest1X, dest1Y);
	line(x2, y2, dest2X, dest2Y);

};

class Colors{
	//Field Colors
	static fieldColor(){
			return color(93, 148, 81);
	}

	//Player Colors
	static playerColor(){
		return Colors.olColor(); //default
	}
	static selectedPlayerColor(){
		return Colors.yellowColor(); //default
	}
	static skillPlayerColor(){
		return Colors.redColor();
	}
	static qbColor(){
		return color(212, 130, 130);
	}
	static olColor(){
		return color(143, 29, 29);
	}
	static defensivePlayerColor(){
		return Colors.blackColor();
	}
	static nodeColor(){
		return Colors.redColor();
	}

	//Assignmnet Colors
	static blockColor(){
		return Colors.blackColor();
	}
	static dropbackColor(){
		return Colors.yellowColor();
	}
	static motionColor(){
		return Colors.greyColor();
	}
	static routeColor(){
		return Colors.redColor();
	}
	static runColor(){
		return Colors.blueColor();
	}
	static blitzColor(){
		return Colors.redColor();
	}
	static defensiveMovementColor(){
		return Colors.greyColor();
	}
	static manCoverageColor(){
		return Colors.blackColor();
	}
	static zoneCoverageColor(){
		return Colors.greyColor();
	}

	//Basic Colors
	static blackColor(){
		return color(0, 0, 0);
	}
	static redColor(){
		return color(255, 0, 0);
	}
	static whiteColor(){
		return color(255, 255, 255);
	}
	static blueColor(){
		return color(0, 0, 255);
	}
	static yellowColor(){
		return color(255, 255, 0);
	}
	static greyColor(){
		return color(50, 50, 50);
	}

}
