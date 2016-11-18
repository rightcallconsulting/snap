
//***************************************************************************//
//																			 //
// play.js - Right Call Consulting. All Rights Reserved. 2016		     	 //
//																			 //
//***************************************************************************//
//																			 //
// A play object represents one offensive or defensive play. //
// The object maintains an array of all of the players  //
// in the play and their positions on the field.				 			 //
//***************************************************************************//

var Play = function(config) {
	this.name = config.name || "";
	this.scoutName = config.scoutName || "";
	this.unit = config.unit || "offense";
	this.formation = config.formation || "";
	this.offensivePlayers = config.offensivePlayers || [];
	this.defensivePlayers = config.defensivePlayers || [];
	this.quarterback = config.quarterback || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.offensiveLinemen = config.offensiveLinemen || [];
	this.feedbackMessage = config.feedbackMessage || "";
	this.movementIndex = config.movementIndex || 0;
	this.notes = config.notes || [];
};

Play.prototype.getFullName = function(){
	if(this.formation === ""){
		return this.name
	}
	return this.formation + ": " + this.name;
}

//***************************************************************************//
//***************************************************************************//

// drawPlayers draws all the players in a play.
Play.prototype.drawPlayers = function (field) {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].draw(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].draw(field);
	}
};

// drawAssignments draws the assignments of all of the players in a play.
Play.prototype.drawAssignments = function (field) {
	if(this.movementIndex > 0){
		return;
	}
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].drawAssignments(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].drawAssignments(field);
	}
};

Play.prototype.runPlay = function(){
		if(this.movementIndex === 0){
			if(this.runPreSnap()){
				this.movementIndex++;
				this.resetPlayerMovementIndices();
			}
			return false;
		}
		if(this.movementIndex === 1){
			if(this.runPostSnap()){
				return true;
			}
		}
}

Play.prototype.runPreSnap = function(){
	var isFinished = true;
	for(var i = 0; i < this.offensivePlayers.length; i++){
		if(!this.offensivePlayers[i].runPreSnap()){
			isFinished = false;
		}
	}
	//no defense pre-snap for now, but this should be written anyway
	for(var i = 0; i < this.defensivePlayers.length; i++){
		if(!this.defensivePlayers[i].runPreSnap()){
			isFinished = false;
		}
	}

	return isFinished
}

Play.prototype.runPostSnap = function(){
	var isFinished = true;
	for(var i = 0; i < this.offensivePlayers.length; i++){
		if(!this.offensivePlayers[i].runPostSnap()){
			isFinished = false;
		}
	}
	//no defense pre-snap for now, but this should be written anyway
	for(var i = 0; i < this.defensivePlayers.length; i++){
		if(!this.defensivePlayers[i].runPostSnap()){
			isFinished = false;
		}
	}
	return isFinished
}

Play.prototype.resetPlayerMovementIndices = function(){
	for(var i = 0; i < this.offensivePlayers.length; i++){
		this.offensivePlayers[i].movementIndex = 0;
	}
	for(var i = 0; i < this.defensivePlayers.length; i++){
		this.defensivePlayers[i].movementIndex = 0;
	}
}

Play.prototype.resetPlay = function(){
	this.movementIndex = 0;
	this.resetPlayerMovementIndices();
	for(var i = 0; i < this.offensivePlayers.length; i++){
		this.offensivePlayers[i].x = this.offensivePlayers[i].startX;
		this.offensivePlayers[i].y = this.offensivePlayers[i].startY;
	}
	for(var i = 0; i < this.defensivePlayers.length; i++){
		this.defensivePlayers[i].x = this.defensivePlayers[i].startX;
		this.defensivePlayers[i].y = this.defensivePlayers[i].startY;
	}
}

// isValid checks the legality of a play.
Play.prototype.isValid = function() {
	// TODO: Implement
	//
	// IDEAS: More players in a play than can be in a play.
	//		  Inelligable setups. Illegal actions.

	if (this.offensivePlayers.length > 11 || this.defensivePlayers.length > 11) {
		return false;
	}

	return true;
};

// getSelected iterates through all the players in a play and returns
// the one player that is selected. If no one is selected it returns null.
//
// TODO: implement logic for selecting multiple players and return an array.
Play.prototype.getSelected = function() {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		if (this.offensivePlayers[i].selected) {
			return [this.offensivePlayers[i], i];
		}
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		if (this.defensivePlayers[i].selected) {
			return [this.defensivePlayers[i], i];
		}
	}

	return [null, null];
};

// clearSelected iterates through all the players in a play and makes
// them all unselected.
Play.prototype.clearSelected = function() {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].setUnselected();
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].setUnselected();
	}
};

// reset clears the current play and returns an empty screen.
Play.prototype.reset = function() {
	this.offensivePlayers = [];
	this.quarterback = [];
	this.offensiveLinemen = [];
	this.eligibleReceivers = [];
	this.defensivePlayers = [];
};

// mouseInPlayer iterates through all the offensive and defensive players
// in a play. It returns the player that the mouse is inside of or
// null if the mouse is not inside any player.
Play.prototype.mouseInPlayer = function(field) {
	for(var i = this.offensivePlayers.length-1; i >= 0; i--) {
		var player = this.offensivePlayers[i];
		if (player.isMouseInside(field)) {
			return player;
		}
	}

	for(var i = this.defensivePlayers.length-1; i >= 0; i--) {
		var player = this.defensivePlayers[i];
		if (player.isMouseInside(field)) {
			return player;
		}
	}

	return null;
};

Play.prototype.mouseInNode = function(field){
	for(var i = 0; i < this.offensivePlayers.length; i++) {
		var player = this.offensivePlayers[i];
		for(var j = player.routeNodes.length-1; j >= 0; j--){
			if(player.routeNodes[j].isMouseInside(field)){
				return player.routeNodes[j];
			}
		}
	}
	return null;
}

// save handles everything that need to be done when the user pressed the save
// button. It checks the validity of the play and then saves it (if valid)
Play.prototype.save = function (path, csrf_token) {
	if (this.isValid()) {
		this.clearSelected();

		var playJson = "";
		var player;

		for(var i = 0; i < this.offensivePlayers.length; i++) {
			player = this.offensivePlayers[i];
			player.startX = player.x;
			player.startY = player.y;
		}

		for(var i = 0; i < this.defensivePlayers.length; i++) {
			player = this.defensivePlayers[i];
			player.startX = player.x;
			player.startY = player.y;
		}

		playJson = JSON.stringify(this, ["name", "scoutName", "team", "unit", "formation", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz", "motionCoords", "dropback", "run", "route", "blockingAssignmentArray", "type", "player", "defensiveMovement", "blitz", "manCoverage", "zoneCoverage", "notes", "call", "progressionRank"]);
		var playName = this.name;
		var scoutName = this.scoutName;
		var playUnit = this.unit;
		var formationName = this.formation;

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, save: true, delete: false, name: playName, scout_name: scoutName, unit: playUnit, formation: formationName, play: playJson}
			).done(function() {
				console.log("Play successfully sent to Django to be saved");
			}).fail(function() {
				console.log("Error sending Play to Django to be saved");
		});
	} else {
		//this.feedbackMessage = "Invalid Play";
	}
};

// delete sends a delete request to Django for this play.
Play.prototype.delete = function(path, csrf_token) {
	var playName = this.name;
	var scoutName = this.scoutName;
	var formationName = this.formation;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: false, delete: true, name: playName, scout_name: scoutName, formation: formationName}
		).done(function() {
			console.log("Play successfully sent to Django to be deleted");
		}).fail(function() {
			console.log("Error sending Play to Django to be deleted");
	});
};

// deepCopy returns a new Play object that is exactly the same as this.
Play.prototype.deepCopy = function() {
	var deepCopy = new Play({
		id: this.id,
		name: this.name,
		scoutName: this.scoutName,
		team: this.team,
		unit: this.unit,
		notes: this.notes,
		formation: this.formation,
		feedbackMessage: this.feedbackMessage
	});

	for (var i = 0; i < this.quarterback.length; ++i) {
		deepCopy.quarterback.push(this.quarterback[i].deepCopy());
	}

	for (var i = 0; i < this.offensivePlayers.length; ++i) {
		deepCopy.offensivePlayers.push(this.offensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < this.defensivePlayers.length; ++i) {
		deepCopy.defensivePlayers.push(this.defensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < this.offensiveLinemen.length; ++i) {
		deepCopy.offensiveLinemen.push(this.offensiveLinemen[i].deepCopy());
	}

	for (var i = 0; i < this.eligibleReceivers.length; ++i) {
		deepCopy.eligibleReceivers.push(this.eligibleReceivers[i].deepCopy());
	}

	return deepCopy;
};

// fromFormation takes a formation object as an argument and creates a play
// with the same players in the formation.
Play.prototype.fromFormation = function(formation) {
	this.play = new Play({});

	var play_formation = formation.deepCopy();

	this.unit = play_formation.unit;
	this.formation = play_formation.name;

	for (var i = 0; i < play_formation.quarterback.length; ++i) {
		this.quarterback.push(play_formation.quarterback[i].deepCopy());
	}

	for (var i = 0; i < play_formation.offensivePlayers.length; ++i) {
		this.offensivePlayers.push(play_formation.offensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < play_formation.defensivePlayers.length; ++i) {
		this.defensivePlayers.push(play_formation.defensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < play_formation.offensiveLinemen.length; ++i) {
		this.offensiveLinemen.push(play_formation.offensiveLinemen[i].deepCopy());
	}

	for (var i = 0; i < play_formation.eligibleReceivers.length; ++i) {
		this.eligibleReceivers.push(play_formation.eligibleReceivers[i].deepCopy());
	}
};

// scoutFromFormation takes a cout formation object as an argument and adds the
// defensive look to this play.
Play.prototype.scoutFromFormation = function(formation) {
	formation.updateCoverageForOffense(this);
	var scout_formation = formation.deepCopy();

	this.defensivePlayers = [];

	for (var i = 0; i < scout_formation.defensivePlayers.length; ++i) {
		this.defensivePlayers.push(scout_formation.defensivePlayers[i].deepCopy());
	}
	this.scoutName = formation.name;
};

// removeScoutFormation gets rid of the defensive look
Play.prototype.removeScoutFormation = function() {
	this.defensivePlayers = [];
	this.scoutName = "";
};

/*********************************/
/*     Non object functions      */
/*********************************/

function createPlayFromJson(playJsonDictionary) {
	var quarterback = [];
	var offensivePlayersArray = [];
	var defensivePlayersArray = [];
	var offensiveLinemenArray = [];
	var eligibleReceiversArray = [];

	for (var i = 0; i < playJsonDictionary.offensivePlayers.length; ++i) {
		var player = new Player({
			x: playJsonDictionary.offensivePlayers[i].x,
			y: playJsonDictionary.offensivePlayers[i].y,
			startX: playJsonDictionary.offensivePlayers[i].startX,
			startY: playJsonDictionary.offensivePlayers[i].startY,
			num: playJsonDictionary.offensivePlayers[i].num,
			pos: playJsonDictionary.offensivePlayers[i].pos,
			red: playJsonDictionary.offensivePlayers[i].red,
			green: playJsonDictionary.offensivePlayers[i].green,
			blue: playJsonDictionary.offensivePlayers[i].blue,
			unit: playJsonDictionary.offensivePlayers[i].unit,
			eligible: playJsonDictionary.offensivePlayers[i].eligible,
			siz: playJsonDictionary.offensivePlayers[i].siz,
			notes: playJsonDictionary.offensivePlayers[i].notes,
			call: playJsonDictionary.offensivePlayers[i].call,
			progressionRank: playJsonDictionary.offensivePlayers[i].progressionRank
		});

		if (player.pos === "QB") {
			quarterback.push(player);
		}

		if (player.eligible === true) {
			eligibleReceiversArray.push(player);
		}

		if (playJsonDictionary.offensivePlayers[i].motionCoords != null) {
			for (var j = 0; j < playJsonDictionary.offensivePlayers[i].motionCoords.length; ++j) {
				var motion = playJsonDictionary.offensivePlayers[i].motionCoords[j];
				player.motionCoords.push([motion[0], motion[1]]);
			}
		}

		if (playJsonDictionary.offensivePlayers[i].dropback != null) {
			for (var j = 0; j < playJsonDictionary.offensivePlayers[i].dropback.length; ++j) {
				var drop = playJsonDictionary.offensivePlayers[i].dropback[j];
				player.dropback.push([drop[0], drop[1]]);
			}
		}

		if (playJsonDictionary.offensivePlayers[i].run != null) {
			for (var j = 0; j < playJsonDictionary.offensivePlayers[i].run.length; ++j) {
				var run = playJsonDictionary.offensivePlayers[i].run[j];
				player.run.push([run[0], run[1]]);
			}
		}

		if (playJsonDictionary.offensivePlayers[i].route != null) {
			for (var j = 0; j < playJsonDictionary.offensivePlayers[i].route.length; ++j) {
				var route = playJsonDictionary.offensivePlayers[i].route[j];
				player.addToRoute(route[0], route[1]);
			}
		}

		offensivePlayersArray.push(player);
	}

	for (var i = 0; i < playJsonDictionary.defensivePlayers.length; ++i) {
		var player = new Player({
			x: playJsonDictionary.defensivePlayers[i].x,
			y: playJsonDictionary.defensivePlayers[i].y,
			startX: playJsonDictionary.defensivePlayers[i].startX,
			startY: playJsonDictionary.defensivePlayers[i].startY,
			num: playJsonDictionary.defensivePlayers[i].num,
			pos: playJsonDictionary.defensivePlayers[i].pos,
			red: playJsonDictionary.defensivePlayers[i].red,
			green: playJsonDictionary.defensivePlayers[i].green,
			blue: playJsonDictionary.defensivePlayers[i].blue,
			unit: playJsonDictionary.defensivePlayers[i].unit,
			eligible: playJsonDictionary.defensivePlayers[i].eligible,
			siz: playJsonDictionary.defensivePlayers[i].siz,
			notes: playJsonDictionary.defensivePlayers[i].notes,
			call: playJsonDictionary.defensivePlayers[i].call
		});

		if (playJsonDictionary.defensivePlayers[i].defensiveMovement != null) {
			for (var j = 0; j < playJsonDictionary.defensivePlayers[i].defensiveMovement.length; ++j) {
				var movement = playJsonDictionary.defensivePlayers[i].defensiveMovement[j];
				player.defensiveMovement.push([movement[0], movement[1]]);
			}
		}
		if (playJsonDictionary.defensivePlayers[i].blitz != null) {
			for (var j = 0; j < playJsonDictionary.defensivePlayers[i].blitz.length; ++j) {
				var blitz = playJsonDictionary.defensivePlayers[i].blitz[j];
				player.blitz.push([blitz[0], blitz[1]]);
			}
		}

		if (playJsonDictionary.defensivePlayers[i].manCoverage != null) {
			for (var j = 0; j < playJsonDictionary.defensivePlayers[i].manCoverage.length; ++j) {
				var manCoverage = playJsonDictionary.defensivePlayers[i].manCoverage[j];
				player.manCoverage.push(manCoverage);
			}
		}

		if (playJsonDictionary.defensivePlayers[i].zoneCoverage != null) {
			player.zoneCoverage = new ZoneAssignment(playJsonDictionary.defensivePlayers[i].zoneCoverage)
		}

		defensivePlayersArray.push(player);
	}

	var left_tackle = new Player({});
	var left_guard = new Player({});
	var center = new Player({});
	var right_guard = new Player({});
	var right_tackle = new Player({});

	for (i in offensivePlayersArray) {
		player = offensivePlayersArray[i];

		if (player.pos === "LT") {
			left_tackle = player;
		} else if (player.pos === "RT") {
			right_tackle = player;
		} else if (player.pos === "LG") {
			left_guard = player;
		} else if (player.pos === "RG") {
			right_guard = player;
		} else if (player.pos === "C") {
			center = player;
		} else if (player.pos === "T") {
			if (left_tackle === null) {
				player.pos = "LT";
				left_tackle === player;
			} else if (player.x < left_tackle.x) {
				left_tackle.pos = "RT";
				right_tackle = left_tackle;
				player.pos = "LT";
				left_tackle = player;
			} else {
				player.pos = "RT";
				right_tackle === player;
			}
		} else if (player.pos === "G") {
			if (left_guard === null) {
				player.pos = "LG";
				left_guard === player;
			} else if (player.x < left_guard.x) {
				left_guard.pos = "RG";
				right_guard = left_guard;
				player.pos = "LG";
				left_guard = player;
			} else {
				player.pos = "RG";
				right_guard === player;
			}
		}
	}

	offensiveLinemenArray.push(left_tackle);
	offensiveLinemenArray.push(left_guard);
	offensiveLinemenArray.push(center);
	offensiveLinemenArray.push(right_guard);
	offensiveLinemenArray.push(right_tackle);

	for (i in offensivePlayersArray) {
		for (j in playJsonDictionary.offensivePlayers[i].blockingAssignmentArray) {
			var primaryAssignment = playJsonDictionary.offensivePlayers[i].blockingAssignmentArray[j];
			var playerToBlock = null;

			if (primaryAssignment.type === 1) {
				for (k in defensivePlayersArray) {
					if (primaryAssignment.player.pos === defensivePlayersArray[k].pos){
						if (playerToBlock == null || (primaryAssignment.player.x === defensivePlayersArray[k].x && primaryAssignment.player.y === defensivePlayersArray[k].y)) {
							playerToBlock = defensivePlayersArray[k];
						}
					}

				}
			}

			var block = new BlockType ({
				type: primaryAssignment.type,
				player: playerToBlock,
				x: primaryAssignment.x,
				y: primaryAssignment.y
			});

			offensivePlayersArray[i].blockingAssignmentArray.push(block);
		}
	}

	var scoutName = "";
	if (playJsonDictionary.scoutName != null) {
		scoutName = playJsonDictionary.scoutName;
	}

	var result = new Play({
		name: playJsonDictionary.name,
		scoutName: scoutName,
		team: playJsonDictionary.team,
		unit: playJsonDictionary.unit,
		notes: playJsonDictionary.notes,
		formation: playJsonDictionary.formation,
		offensivePlayers: offensivePlayersArray,
		defensivePlayers: defensivePlayersArray,
		quarterback: quarterback,
		offensiveLinemen: offensiveLinemenArray,
		eligibleReceivers: eligibleReceiversArray
	});

	result.updateCoverageForOffense();

	return result;
};

/*******************************************************************************************************************************************/

/*******************************************************************************************************************************************/

/*******************************************************************************************************************************************/

/*******************************************************************************************************************************************/

Play.prototype.getPlayerFromPosition = function(pos){
  for(var i = 0; i < this.offensivePlayers.length; i++){
		var player = this.offensivePlayers[i];
		if(player.pos === pos){
			return player
		}
	}
	for(var i = 0; i < this.defensivePlayers.length; i++){
		var player = this.defensivePlayers[i];
		if(player.pos === pos){
			return player
		}
	}
	return null;
};

Play.prototype.removePlayerWithPosition = function(position){
	for(var i = 0; i < this.offensivePlayers.length; i++){
		var player = this.offensivePlayers[i];
		if(player.pos === position){
			this.offensivePlayers.splice(i, 1)
			return 1;
		}
	}
	for(var i = 0; i < this.defensivePlayers.length; i++){
		var player = this.defensivePlayers[i];
		if(player.pos === position){
			this.defensivePlayers.splice(i, 1)
			return 1;
		}
	}
	return 0;
}

Play.prototype.getNextProgressionRank = function(){
	var highest = 0;
  for(var i = 0; i < this.offensivePlayers.length; i++){
		var rank = this.offensivePlayers[i].progressionRank;
    if(rank > highest){
			highest = rank;
		}
  }
	return highest+1;
};

Play.prototype.clearProgression = function(){
  for(var i = 0; i < this.offensivePlayers.length; i++){
      this.offensivePlayers[i].progressionRank = 0;
  }
};

Play.prototype.clearSelectedReceivers = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    this.eligibleReceivers[i].selected = false;
  }
};

Play.prototype.updateBlockingAssignmentForDefense = function(defensivePlayers){
  this.offensivePlayers.forEach(function(player){
    if(player.blockingAssignmentObject && player.blockingCoordinates){
        player.blockingAssignmentObject.setForDefense(defensivePlayers, player.blockingCoordinates)
    }
  })
}

Play.prototype.updateCoverageForOffense = function(){
	for(var i = 0; i < this.defensivePlayers.length; i++){
		var defender = this.defensivePlayers[i];
		for(var j = 0; j < defender.manCoverage.length; j++){
			var assignment = defender.manCoverage[j]
			for(var k = 0; k < this.offensivePlayers.length; k++){
				var receiver = this.offensivePlayers[k];
				if(receiver.pos === assignment.pos && receiver.x === assignment.x && receiver.y === assignment.y){
					defender.manCoverage[j] = receiver;
				}
			}
		}
	}
}
