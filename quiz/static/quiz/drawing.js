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
	var lengthOfArrow = 0.5;
	var beta = (45*(PI/180)) - alpha;
	var xDiff = cos(beta)*lengthOfArrow;
	var yDiff = sin(beta)*lengthOfArrow;

	if (deltaX >= 0) {
		x2 = x1 - yDiff;
		y2 = y1 - xDiff;
	} else {
		x2 = x1 + yDiff;
		y2 = y1 + xDiff;
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