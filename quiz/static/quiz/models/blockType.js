
//***************************************************************************//
//																			 //
// blockType.js - Right Call Consulting. All Rights Reserved. 2016			 //
//																			 //
//***************************************************************************//
//																			 //
// A block type represents some offensive players (for now) block.            //
//																			 //
//***************************************************************************//

//@param type: Int code; 0 - segment, 1 - on player, 2 - money, 3/4 - down r/l, 5/6 - seal r/l, 7/8 - kickout
//@param player: if type = 1, player being blocked; otherwise will be null
//@param x: x coordinate in yards, never null
//@param y: y coordinate in yards, never null
var BlockType = function(config) {
	this.type = config.type || 0;
	this.player = config.player || null;
	if(config.x && config.y){
			this.x = config.x
			this.y = config.y
	}else if(this.type === 1 && this.player !== null){
		this.x = this.player.x
		this.y = this.player.y
	}else if(config.prevX && config.prevY){
		if(this.type === 2){
			this.x = config.prevX
			this.y = config.prevY + 1.5
		}else if(this.type === 3 || this.type === 4){
			var dist = 2;
			var xDiff = (dist/2)*sqrt(2)
			var yDiff = (dist/2)*sqrt(2)
			if(this.type === 4){
				xDiff *= -1.0
			}
			this.x = config.prevX + xDiff
			this.y = config.prevY + yDiff
		}else if(this.type === 5 || this.type === 6){
			var dist = 3;
			var xDiff = 0;
			var yDiff = dist;
			this.x = config.prevX + xDiff
			this.y = config.prevY + yDiff
		}else if(this.type === 7 || this.type === 8){
			var dist = 1.5;
			var alpha = 55*(PI/180);
			if(this.type === 8){
				alpha = PI - alpha
			}
			var xDiff = cos(alpha)*dist;
			var yDiff = sin(alpha)*dist;
			this.x = config.prevX + xDiff
			this.y = config.prevY + yDiff
		}
	}
};

//***************************************************************************//
//***************************************************************************//

// draw determines the type of the block and calls the appropriate draw
// function for that type of block.
BlockType.prototype.draw = function(prevX, prevY, field) {
	var black = color(0, 0, 0);
	stroke(black);

	var x1 = field.getTranslatedX(prevX)
	var y1 = field.getTranslatedY(prevY)
	var x2 = field.getTranslatedX(this.x)
	var y2 = field.getTranslatedY(this.y)
	if(this.type === 1 && this.player){
		x2 = field.getTranslatedX(this.player.x)
		y2 = field.getTranslatedY(this.player.y)
	}

	line(x1, y1, x2, y2)

	if(this.type === 2){
		//money
	}else if(this.type === 3){

	}else{
		//tbi
	}

	noStroke()
};
