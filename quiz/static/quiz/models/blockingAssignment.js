
var BlockingAssignment = function(config){
	this.name = config.name || "";
	this.dLineman = config.dLineman || null;
	this.playerTested = config.playerTested || null;
};

BlockingAssignment.prototype.getBlockedPlayer = function(){
	var blockedPlayer = this.playerTested.blockingAssignment;

};

BlockingAssignment.prototype.getBlockDirection = function(direction){
	
};

BlockingAssignment.prototype.drawBlockLeft = function(){
	fill(255, 0, 0);
	line(this.startCoords[0], this.startCoords.[1], this.getBlockCoords[0], this.getBlockCoords[1]);
};









