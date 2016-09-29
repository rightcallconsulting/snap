
//***************************************************************************//
//                                                                           //
// button.js - Right Call Consulting. All Rights Reserved. 2016              //
//                                                                           //
//***************************************************************************//
//                                                                           //
// A button object represents a button in the creation an quiz taking views. //
//                                                                           //
//***************************************************************************//

var Button = function(config) {
	this.x = config.x || 20;
	this.y = config.y || 20;
	this.width = config.width || 80;
	this.height = config.height || 35;
	this.label = config.label || "";

	this.fill = config.fill || color(255, 255, 255);
	this.clicked = config.clicked || false;
	this.display = config.display || false;
};

//***************************************************************************//
//***************************************************************************//

Button.prototype.draw = function(field) {
	stroke(color(0, 0, 0));
	strokeWeight(1);
	fill(this.fill);
	var x = this.x;
	var y = this.y;
	var width = this.width;
	var height = this.height;

	rect(x, y, width, height);

	noStroke();
	fill(0, 0, 0);
	textSize(12);
	textAlign(CENTER, CENTER);

	text(this.label, x, y, width, height);
};

Button.prototype.isMouseInside = function(field) {
	var x = this.x;
	var y = this.y;
	var width = this.width;
	var height = this.height;

	if (this.display === false) {
		return false;
	}

	return mouseX > x &&
		mouseX < (x + width) &&
		mouseY > y &&
		mouseY < (y + height);
};

Button.prototype.setClicked = function() {
	this.fill = color(176, 176, 176);
	this.clicked = true;
};

Button.prototype.setUnclicked = function() {
	this.fill = color(255, 255, 255);
	this.clicked = false;
};

Button.prototype.click = function() {
	if (this.clicked) {
		this.setUnclicked();
	} else {
		this.setClicked();
	}
};
