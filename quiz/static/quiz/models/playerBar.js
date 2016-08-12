
var PlayerBar = function(config) {
	this.x = config.x || 50;
	this.y = config.y || field.height/2;
	this.width = config.width || field.width/2;
	this.height = config.height || 10;
	this.fill = config.fill || color(230, 230, 230);
	this.playerTypes = config.playerTypes || ["F", "T", "G", "C", "Y"];
};

PlayerBar.prototype.draw = function(field) {
	fill(this.fill);
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var width = field.yardsToPixels(this.width);
	var height = field.yardsToPixels(this.height);
	rect(x, y, width, height);

	var playerOptionX = x;
	var playerOptionY = y + height/2;
	var eligible = false;
	for (var i = 0; i < this.playerTypes.length; ++i) {
		var playerOption

		if (this.playerTypes[i] === "F" || this.playerTypes[i] === "Y") {
			var playerOption = new Player ({
				num: this.playerTypes[i],
				pos: this.playerTypes[i],
				x: playerOptionX,
				y: playerOptionY,
				siz: height,
				red: 255, green: 0, blue: 0,
				eligible: true
			});
		} else {
			var playerOption = new Player ({
				num: this.playerTypes[i],
				pos: this.playerTypes[i],
				x: playerOptionX,
				y: playerOptionY,
				siz: height,
				red: 143, blue: 29, green: 29,
				eligible: true
			});
		}

		playerOption.draw();
	}
};

PlayerBar.prototype.isMouseInside = function(field) {
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var width = field.yardsToPixels(this.width);
	var height = field.yardsToPixels(this.height);
	return mouseX > x &&
		mouseX < (x + width) &&
		mouseY > y &&
		mouseY < (y + height);
};
