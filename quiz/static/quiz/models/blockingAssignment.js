
var BlockingAssignment = function(config){
	this.name = config.name || "";
	this.startCoords = config.startCoords || [];
	this.blockCoords = config.blockCoords || []; 
	this.playerTested = config.playerTested || null;
};

BlockingAssignment.prototype.getBlockDest = function(distance, theta){
	var xDist = distance * Math.cos(theta);
	var yDist = distance * Math.sin(theta);
	return [xDist, yDist];
};

BlockingAssignment.prototype.getStartCoords = function(player){
		var x = this.playerTested.x;
		var y = this.playerTested.y;
		this.startCoords.push([x, y]);
	};

BlockingAssignment.prototype.getBlockDirection = function(direction){
	switch(direction){
		case 0: getBlockDest(10, (3*Math.PI)/4);
		break;
		case 1: getBlockDest(5, Math.PI/2);
		break;
		case 2: getBlockDest(10, Math.PI/4);
		break;
	}
};

BlockingAssignment.prototype.blockCoords = function(){
	return [(getBlockDirection(0)[0] + this.playerTested.x)	,(getBlockDirection(0)[1] + this.playerTested.y)];
};

BlockingAssignment.prototype.drawBlockLeft = function(){
	fill(255, 0, 0);
	line(this.startCoords[0], this.startCoords.[1], this.blockCoords[0], this.blockCoords[1]);

};









