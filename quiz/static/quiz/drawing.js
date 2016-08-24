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

function dottedLine(x1, y1, x2, y2) {
	var deltaX = x2 - x1;
	var deltaY = y2 - y1;
	var dist = sqrt(pow(deltaX, 2) + pow(deltaY, 2));
	var alpha = atan(deltaY/deltaX);
	var stepSizePercentage = 0.05;
	var segmentDist = dist*stepSizePercentage;

	var xDiff = cos(alpha)*segmentDist;
	var yDiff = sin(alpha)*segmentDist;

	var xStart = x1;
	var yStart = y1;
	var xEnd = xDiff;
	var yEnd = yDiff;

	for (var i = 0; i <= 1/stepSizePercentage; ++i) {
		if (i%2 == 0) {
			line(xStart, yStart, xEnd, yEnd);
		}

		xStart = xEnd;
		yStart = yEnd;
		xEnd += xDiff;
		yEnd += yDiff;
	}
};