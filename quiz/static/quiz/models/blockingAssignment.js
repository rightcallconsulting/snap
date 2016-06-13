var BlockingAssignment = function(config){
	if(config.json_seed){
		return;
	}
	this.name = config.name || "";
	this.blockedPlayers = config.blockedPlayers || [];
	this.blockedPlayerIDs = config.blockedPlayerIDs || [];
	this.blockedZone = config.blockedZone || 0; //0 means no zone, 1 is left, 2 is right, 3 is back
	this.type = config.type || ""; //PULL is an option
};

var createBlockingAssignmentFromJSON = function(json){
	if(!json){
		return null;
	}
	while(json.indexOf("u'") >= 0){
		json = json.replace("u'", "'");
	}

	while(json.indexOf("'") >= 0){
		json = json.replace("'", "\"");
	}

	var dict = JSON.parse(json);

  var assignment = new BlockingAssignment({
		blockedZone: dict.blockedZone || 0,
		type: dict.type || "",
		name: dict.name || "",
		blockedPlayerIDs: dict.blockedPlayerIDs || []
  });

	return assignment;
};

BlockingAssignment.prototype.drawBlockedZone = function(blocker, field){
  var dist = 3;
	if(this.blockedZone === 0){
		return;
	}
	var startX = blocker.startX;
	var startY = blocker.startY;
	var x1 = field.getTranslatedX(startX);
	var y1 = field.getTranslatedY(startY);
	var x2 = field.getTranslatedX(startX + dist);
	var y2 = field.getTranslatedY(startY + dist);
	stroke(0, 0, 220);
	if(this.blockedZone === 1){
		x2 = field.getTranslatedX(startX - dist);
	}else if(this.blockedZone === 3){
    x2 = x1;
    y2 = field.getTranslatedY(startY - dist);
  }
	line(x1, y1, x2, y2);
};

BlockingAssignment.prototype.getBlockedPlayer = function(i){
	if(this.blockedPlayers.length <= i){
		return null;
	}
	return this.blockedPlayers[i];
};

BlockingAssignment.prototype.toggleBlockingPlayer = function(player){
	for(var i = 0; i < this.blockedPlayers.length; i++){
		var p = this.blockedPlayers[i];
		if(p === player){
			this.removeBlockedPlayer(i);
			return;
		}
	}
	this.addBlockedPlayer(player);
};

BlockingAssignment.prototype.isBlockingPlayer = function(player){
	for(var i = 0; i < this.blockedPlayers.length; i++){
		var p = this.blockedPlayers[i];
		if(p === player){
			return true;
		}
	}
	return false;
};


BlockingAssignment.prototype.addBlockedPlayer = function(player){
	this.blockedPlayers.push(player);
};

BlockingAssignment.prototype.clearBlockedPlayers = function(){
	this.blockedPlayers = [];
};

BlockingAssignment.prototype.removeBlockedPlayer = function(i){
  if(this.blockedPlayers.length < 2){
    this.type = "";
    this.blockedPlayers = [];
    return;
  }
	var secondPiece = this.blockedPlayers.slice(i+1);
	this.blockedPlayers = this.blockedPlayers.slice(0, i).concat(secondPiece);
};

BlockingAssignment.prototype.removeLastBlockedPlayer = function(){
	if(this.blockedPlayers.length > 0){
		this.blockedPlayers.pop();
	}
  if(this.blockedPlayers.length === 0){
    this.type = "";
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
		var x1 = field.getTranslatedX(startX);
		var y1 = field.getTranslatedY(startY);
		var x2 = field.getTranslatedX(defender.x);
		var y2 = field.getTranslatedY(defender.y);
		stroke(255,238,88);
		strokeWeight(3);
		if(this.type === "PULL" && i === 0){
			var turnX = field.getTranslatedX(startX + (defender.x - startX) * 0.2); //experiment with the constant
			var turnY = field.getTranslatedY(startY - 3); //experiment with the constant
			line(x1, y1, turnX, turnY);
			line(turnX, turnY, x2, y2);

		}else{
			line(x1, y1, x2, y2);
		}
    noStroke();
		strokeWeight(1);
 	}
 	this.drawBlockedZone(blocker, field);
};


BlockingAssignment.prototype.equals = function(assignment){
	if(assignment === null){
		return false;
	}
	if(this.type !== assignment.type){
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

BlockingAssignment.prototype.convertBlockedPlayersToIDs = function(){
	this.blockedPlayerIDs = [];
	for(var i = 0; i < this.blockedPlayers.length; i++){
		var p = this.blockedPlayers[i];
		this.blockedPlayerIDs.push([p.playerIndex, p.unitIndex]);
	}
}

BlockingAssignment.prototype.createBlockedPlayersFromIDs = function(defense){
	var defensivePlayers = defense.defensivePlayers;
	if(this.blockedPlayerIDs && defensivePlayers){
		this.blockedPlayers = [];
		for(var i = 0; i < this.blockedPlayerIDs.length; i++){
			var playerIndex = this.blockedPlayerIDs[i][0]
			var unitIndex = this.blockedPlayerIDs[i][1]
			var opponent = defense.getPlayerFromIndex(playerIndex, unitIndex);
			if(opponent){
				this.blockedPlayers.push(opponent);
			}
			//debugger;
		}
	}

}
