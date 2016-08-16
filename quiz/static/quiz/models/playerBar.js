
var PlayerBar = function(config) {
	this.x = config.x || 0;
	this.y = config.y || 0;
	this.width = config.width || field.width;
	this.height = config.height || 50;
	this.fill = config.fill || color(230, 230, 230);
	this.playerOptions = config.playerOptions || [];
};

PlayerBar.prototype.init = function(field) {
	var playerSiz = 30
	var playerOptionX = this.x + playerSiz*0.75;
	var playerOptionY = this.y + (this.height/2);

	for (var i = 0; i < this.playerOptions.length; ++i) {
		var player = this.playerOptions[i];
		player.x = playerOptionX;
		player.y = playerOptionY;
		player.siz = playerSiz;
		playerOptionX += playerSiz*1.5;
	}
}

PlayerBar.prototype.draw = function(field) {
	fill(this.fill);
	rect(this.x, this.y, this.width, this.height);

	for (var i = 0; i < this.playerOptions.length; ++i) {
		this.playerOptions[i].pixelDraw();
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
	return mouseX > this.x &&
		mouseX < (this.x + this.width) &&
		mouseY > this.y &&
		mouseY < (this.y + this.height);
};

// mouseInPlayer iterates through all the offensive and defensive players
// in the bar. It returns the player that the mouse is inside of or null 
// if the mouse is not inside any player.
PlayerBar.prototype.mouseInPlayer = function(field) {
	for(var i = 0; i < this.playerOptions.length; i++) {
		var player = this.playerOptions[i];
		if (player.pixelIsMouseInside(field)) {
			return player;
		}
	}

	return null;
};
