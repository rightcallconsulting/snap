
var BlockingAssignment = function(config){
	this.name = config.name || "";
	this.blockedPlayers = config.blockedPlayers || [];
};

BlockingAssignment.prototype.getBlockedPlayers = function(){
	return this.blockedPlayers;
};

BlockingAssignment.prototype.getBlockedPlayer = function(i){
	if(this.blockedPlayers.length <= i){
		return null;
	}
	return this.blockedPlayers[i];
};

BlockingAssignment.prototype.addBlockedPlayer = function(player){
	this.blockedPlayers.push(player);
};

BlockingAssignment.prototype.clearBlockedPlayers = function(){
	this.blockedPlayers = [];
};

BlockingAssignment.prototype.removeBlockedPlayer = function(i){
	var secondPiece = this.blockedPlayers.slice(i+1);
	this.blockedPlayers = this.blockedPlayers.slice(0, i).concat(secondPiece);
};

BlockingAssignment.prototype.removeLastBlockedPlayer = function(){
	if(this.blockedPlayers.length > 0){
		this.blockedPlayers.pop();
	}
};

BlockingAssignment.prototype.draw = function(blocker, field){
	var startX = blocker.x;
	var startY = blocker.y;
	for(var i = 0; i < this.blockedPlayers.length; i++){
		if(i > 0){
			startX = this.blockedPlayers[i-1].x;
			startY = this.blockedPlayers[i-1].y;
		}
		var defender = this.blockedPlayers[i]
		stroke(255, 255, 0);
		strokeWeight(3);
        line(field.getTranslatedX(startX), field.getTranslatedY(startY), field.getTranslatedX(defender.x), field.getTranslatedY(defender.y));
        noStroke();
		strokeWeight(1);
 	}
};


BlockingAssignment.prototype.equals = function(assignment){
	if(assignment === null){
		return false;
	}
	if(this.blockedPlayers.length !== assignment.blockedPlayers.length){
		return false;
	}
	for(var i = 0; i < this.blockedPlayers.length; i++){
		if(this.blockedPlayers[i] !== assignment.blockedPlayers[i]){
			return false;
		}
	}
	return true;
};
