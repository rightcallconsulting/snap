var playerBar = function(config) {
	this.x = config.x || 0;
	this.y = config.y || field.height;
	this.width = config.width || field.width;
	this.height = config.height || 5;
	this.fill = config.fill || color(230, 230, 230);
};

playerBar.prototype.draw = function(field) {
	fill(this.fill);
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var width = field.yardsToPixels(this.width);
	var height = field.yardsToPixels(this.height);
	rect(x, y, width, height);
};

playerBar.prototype.isMouseInside = function(field) {
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var width = field.yardsToPixels(this.width);
	var height = field.yardsToPixels(this.height);
	return mouseX > x &&
		mouseX < (x + width) &&
		mouseY > y &&
		mouseY < (y + height);
};
