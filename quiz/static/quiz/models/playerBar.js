
var PlayerBar = function(config) {
	this.x = config.x || field.getYardX(0);
	this.y = config.y || field.getYardY(0);
	this.width = config.width || field.pixelsToYards(field.width);
	this.height = config.height || 10;
	this.fill = config.fill || color(230, 230, 230);
	this.playerTypes = config.playerTypes || ["C", "G", "T", "F", "Y"];
	this.playerOptions = config.playerOptions || [];
};

PlayerBar.prototype.init = function(field) {
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var width = field.yardsToPixels(this.width);
	var height = field.yardsToPixels(this.height);

	var playerOptionX = field.getYardX(x+width*0.04);
	var playerOptionY = field.getYardY(y+height/2);
	var eligible = false;

	for (var i = 0; i < this.playerTypes.length; ++i) {
		var player;

		if (this.playerTypes[i] === "F" || this.playerTypes[i] === "Y") {
			player = new Player ({
				num: this.playerTypes[i],
				pos: this.playerTypes[i],
				x: playerOptionX,
				y: playerOptionY,
				siz: 2.5,
				red: 255, green: 0, blue: 0,
				eligible: true
			});
		} else {
			player = new Player ({
				num: this.playerTypes[i],
				pos: this.playerTypes[i],
				x: playerOptionX,
				y: playerOptionY,
				siz: 2.5,
				red: 143, blue: 29, green: 29,
				eligible: false
			});
		}

		this.playerOptions.push(player);
		playerOptionX += field.pixelsToYards(width*0.06);
	}
}

PlayerBar.prototype.draw = function(field) {
	fill(this.fill);
	var x = field.getTranslatedX(this.x);
	var y = field.getTranslatedY(this.y);
	var width = field.yardsToPixels(this.width);
	var height = field.yardsToPixels(this.height);
	rect(x, y, width, height);

	for (var i = 0; i < this.playerOptions.length; ++i) {
		this.playerOptions[i].draw();
	}
};

/*// getSelected iterates through all the players options in the bar and returns
// the one player that is selected. If no one is selected it returns null.
PlayerBar.prototype.getSelected = function() {
	var numberOfPlayerOptions = this.playerOptions.length;

	for(var i = 0; i < numberOfPlayerOptions; i++) {
		if (this.playerOptions[i].selected) {
			return this.playerOptions[i];
		}
	}

	return null;
};*/

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

// mouseInPlayer iterates through all the offensive and defensive players
// in the bar. It returns the player that the mouse is inside of or null 
// if the mouse is not inside any player.
PlayerBar.prototype.mouseInPlayer = function(field) {
	for(var i = 0; i < this.playerOptions.length; i++) {
		var player = this.playerOptions[i];
		if (player.isMouseInside(field)) {
			return player;
		}
	}

	return null;
};
