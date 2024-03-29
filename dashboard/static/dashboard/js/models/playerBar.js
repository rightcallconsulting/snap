
var PlayerBar = function(config) {
	this.x = config.x || 0;
	this.y = config.y || 0;
	this.width = config.width || field.width;
	this.height = config.height || 35;
	this.fill = config.fill || color(230, 230, 230);
	this.playerOptions = config.playerOptions || [];
};

PlayerBar.prototype.init = function(field) {
	var playerSiz = 25;
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

// resize updates the coordinates and sizes of the buttons on the player
// bar. It's current implmentation just calls the init function.
PlayerBar.prototype.resize = function(field) {
	this.init(field);
};
