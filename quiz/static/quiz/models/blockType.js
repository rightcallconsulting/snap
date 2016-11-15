
//***************************************************************************//
//																			 //
// blockType.js - Right Call Consulting. All Rights Reserved. 2016			 //
//																			 //
//***************************************************************************//
//																			 //
// A block type represents some offensive players (for now) block.           //
//																			 //
//***************************************************************************//

//@param type: Int code; 0 - segment, 1 - on player, 2 - money, 3/4 - down r/l, 5/6 - seal r/l, 7/8 - kickout
//@param player: if type = 1, player being blocked; otherwise will be null
//@param x: x coordinate in yards, never null
//@param y: y coordinate in yards, never null
var BlockType = function(config) {
	this.type = config.type || 0;
	this.player = config.player || null;

	if (config.x && config.y) {
			this.x = config.x
			this.y = config.y
	} else if (this.type === 1 && this.player !== null) {
		this.x = this.player.x
		this.y = this.player.y - (this.player.siz / 2)
	} else if(config.prevX && config.prevY) {
		if (this.type === 2) {
			this.x = config.prevX
			this.y = config.prevY + 1.5
		} else if(this.type === 3 || this.type === 4) {
			var dist = 2;
			var xDiff = (dist/2)*sqrt(2)
			var yDiff = (dist/2)*sqrt(2)
			if(this.type === 4){
				xDiff *= -1.0
			}
			this.x = config.prevX + xDiff
			this.y = config.prevY + yDiff
		} else if(this.type === 5 || this.type === 6) {
			var dist = 3;
			var xDiff = 0;
			var yDiff = dist;
			this.x = config.prevX + xDiff
			this.y = config.prevY + yDiff
		} else if(this.type === 7 || this.type === 8) {
			var dist = 2.5;
			var alpha = 55*(PI/180);

			if (this.type === 8) {
				alpha = PI - alpha
			}

			var xDiff = cos(alpha)*dist;
			var yDiff = sin(alpha)*dist;
			this.x = config.prevX + xDiff
			this.y = config.prevY// + yDiff
		}
	}
};

//***************************************************************************//
//***************************************************************************//

// draw determines the type of the block and calls the appropriate draw
// function for that type of block.
BlockType.prototype.draw = function(prevX, prevY, field, playersBlocked) {
	var black = color(0, 0, 0);
	stroke(black);

	var x1 = field.getTranslatedX(prevX)
	var y1 = field.getTranslatedY(prevY)
	var x2 = field.getTranslatedX(this.x)
	var y2 = field.getTranslatedY(this.y)

	if (this.type === 1 && this.player != null) {
		var defensiveMovement = this.player.defensiveMovement
		var defensiveMovementLength = defensiveMovement.length
		if (defensiveMovementLength > 0) {
			x2 = field.getTranslatedX(defensiveMovement[defensiveMovementLength-1][0])
			y2 = field.getTranslatedY(defensiveMovement[defensiveMovementLength-1][1])
		} else {
			x2 = field.getTranslatedX(this.player.x)
			y2 = field.getTranslatedY(this.player.y - (this.player.siz / 3))
		}

		debugger;

		if(playersBlocked > 0){
			debugger;
			dottedLine(x1, y1, x2, y2);
			return;
		}

	} else if (this.type === 7 || this.type === 8) {
		xMid = (x1+x2)/2
		yMid = field.getTranslatedY(this.y - 1)
		line(x1, y1, xMid, yMid)
		x1 = xMid
		y1 = yMid
	}

	line(x1, y1, x2, y2)

	var lengthOfPerpLine = 1.5;
	var x1 = prevX;
	var y1 = prevY;
	var x2 = this.x;
	var y2 = this.y;

	if(this.type === 1 && this.player){
		x2 = this.player.x;
		y2 = this.player.y-this.player.siz/3;
	}

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

	if (this.type > 0 && this.type < 9) {
		line(x1, y1, x2, y2);
	}

	noStroke()
};
