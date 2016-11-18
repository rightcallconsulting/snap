//***************************************************************************//
//																			 //
// concept.js - Right Call Consulting. All Rights Reserved. 2016			 //
//																			 //
//***************************************************************************//
//																			 //
// A concept object represents one offensive or defensive concept.	It may	 //
// be a blocking concept or route combination etc. Each instance of one of 	 //
// these objects maintains an array of all of the players in the concept 	 //
// and their positions on the field.				 						 //
//																			 //
//***************************************************************************//

var Concept = function(config) {
	this.id = config.id || null;
	this.name = config.name || "";
	this.team = config.team || null;
	this.unit = config.unit || "offense";
	this.offensivePlayers = config.offensivePlayers || [];
	this.defensivePlayers = config.defensivePlayers || [];
	this.quarterback = config.quarterback || [];
	this.offensiveLinemen = config.offensiveLinemen || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.feedbackMessage = config.feedbackMessage || []; //FLAGGED FOR DELETION
	this.movementIndex = config.movementIndex || 0;
	this.notes = config.notes || [];
};

//***************************************************************************//
//***************************************************************************//

Concept.prototype.getFullName = function(){
	return this.name;
}

// drawPlayers draws all the players in a concept.
Concept.prototype.drawPlayers = function (field) {

	for(var i = 0; i < this.offensivePlayers.length; i++) {
		this.offensivePlayers[i].draw(field);
	}
	for(var i = 0; i < this.defensivePlayers.length; i++) {
		this.defensivePlayers[i].draw(field);
	}
};

// drawAssignments
Concept.prototype.drawAssignments = function (field) {
	if(this.movementIndex > 0){
		return;
	}
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].drawAssignments(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].drawAssignments(field);//DefensiveMovement(field);
	}
};

//Used for Route Progressions
Concept.prototype.getNextProgressionRank = function(){
	var highest = 0;
  for(var i = 0; i < this.offensivePlayers.length; i++){
		var rank = this.offensivePlayers[i].progressionRank;
    if(rank > highest){
			highest = rank;
		}
  }
	return highest+1;
};

//Used for Route Progressions
Concept.prototype.clearProgression = function(){
  for(var i = 0; i < this.offensivePlayers.length; i++){
      this.offensivePlayers[i].progressionRank = 0;
  }
};

//Updates man blocking assignments for defenders in concept
Concept.prototype.updateBlocksForDefense = function(){
	for(var i = 0; i < this.offensivePlayers.length; i++){
		var blocker = this.offensivePlayers[i];
		for(var j = 0; j < blocker.blockingAssignmentArray.length; j++){
			var assignment = blocker.blockingAssignmentArray[j]
			if(assignment.type === 1 && assignment.player !== null){
				for(var k = 0; k < this.defensivePlayers.length; k++){
					var defender = this.defensivePlayers[k];
					if(defender.pos === assignment.player.pos && defender.x === assignment.player.x && defender.y === assignment.player.y){
						var newAssignment = new BlockType({
							x: assignment.x,
							y: assignment.y,
							player: defender,
							type: 1
						})
						this.offensivePlayers[i].blockingAssignmentArray[j] = newAssignment;
					}
				}
			}
		}
	}
}

//Updates man coverage assignments for receivers in concept
Concept.prototype.updateCoverageForOffense = function(){
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

//Runs concept on screen
Concept.prototype.runConcept = function(){
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

Concept.prototype.runPreSnap = function(){
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

Concept.prototype.runPostSnap = function(){
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

Concept.prototype.resetPlayerMovementIndices = function(){
	for(var i = 0; i < this.offensivePlayers.length; i++){
		this.offensivePlayers[i].movementIndex = 0;
	}
	for(var i = 0; i < this.defensivePlayers.length; i++){
		this.defensivePlayers[i].movementIndex = 0;
	}
}

Concept.prototype.resetConcept = function(){
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

//Used by buildQuestionAndAnswer in Quiz/Question
Concept.prototype.removePlayerWithPosition = function(position){
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

Concept.prototype.getPlayerFromPosition = function(position){
	for(var i = 0; i < this.offensivePlayers.length; i++){
		var player = this.offensivePlayers[i];
		if(player.pos === position){
			return player;
		}
	}
	for(var i = 0; i < this.defensivePlayers.length; i++){
		var player = this.defensivePlayers[i];
		if(player.pos === position){
			return player;
		}
	}
	return null;
}


// isValid checks the legality of a concept.
Concept.prototype.isValid = function() {
	// TODO: Implement
	//
	// IDEAS: More players in a concept than can be in a play.
	//		  Inelligable setups. Illegal actions.

	return true;
};

// getSelected iterates through all the players in a concept and returns
// the one player that is selected. If no one is selected it returns null.
//
// TODO: implement logic for selecting multiple players and return an array.
Concept.prototype.getSelected = function() {
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

// clearSelected iterates through all the players in a concept and makes
// them all unselected.
Concept.prototype.clearSelected = function() {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].setUnselected();
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].setUnselected();
	}
};

// reset clears the current concept and returns an empty screen.
Concept.prototype.reset = function() {
	this.offensivePlayers = [];
	this.quarterback = [];
	this.offensiveLinemen = [];
	this.eligibleReceivers = [];
	this.defensivePlayers = [];
};

Concept.prototype.mouseInNode = function(field){
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

// mouseInPlayer iterates through all the offensive and defensive players
// in a concept. It returns the player that the mouse is inside of or
// null if the mouse is not inside any player.
Concept.prototype.mouseInPlayer = function(field) {
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

// save handles everything that need to be done when the user pressed the save
// button. It checks the validity of the concept and then saves it (if valid)
Concept.prototype.save = function (path, csrf_token) {
	if (this.isValid()) {
		this.clearSelected();

		var conceptJson = "";
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

			//turn zoneCoverage into dict
			if(player.zoneCoverage != null){
				player.zoneCoverage = player.zoneCoverage.to_dict();
			}
		}

		var conceptName = this.name;
		var conceptUnit = this.unit;
		conceptJson = JSON.stringify(this, ["name", "team", "unit", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz", "motionCoords", "dropback", "run", "route", "blockingAssignmentArray", "type", "player", "defensiveMovement", "notes", "call", "zoneCoverage", "manCoverage", "blitz", "progressionRank"]);

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, save: true, delete: false, name: conceptName, unit: conceptUnit, concept: conceptJson}
			).done(function() {
				console.log("Concept successfully sent to Django to be saved");
			}).fail(function() {
				console.log("Error sending Concept to Django to be saved");
		});
	} else {
		this.feedbackMessage = "Invalid Concept";
	}
};

// delete sends a delete request to Django for this concept.
Concept.prototype.delete = function(path, csrf_token) {
	var conceptName = this.name;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: false, delete: true, name: conceptName}
		).done(function() {
			console.log("Concept successfully sent to Django to be deleted");
		}).fail(function() {
			console.log("Error sending Concept to Django to be deleted");
	});
};

// deepCopy returns a new Concept object that is exactly the same as this.
Concept.prototype.deepCopy = function() {
	var deepCopy = new Concept({
		id: this.id,
		name: this.name,
		team: this.team,
		unit: this.unit,
		feedbackMessage: this.feedbackMessage,
		notes: this.notes
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

	deepCopy.updateBlocksForDefense();
	deepCopy.updateCoverageForOffense();

	return deepCopy;
};

/*********************************/
/*     Non object functions      */
/*********************************/

function createConceptFromJson(conceptJsonDictionary) {
	var quarterback = [];
	var offensivePlayersArray = [];
	var defensivePlayersArray = [];
	var offensiveLinemenArray = [];
	var eligibleReceiversArray = [];

	for (var i = 0; i < conceptJsonDictionary.offensivePlayers.length; ++i) {
		var player = new Player({
			x: conceptJsonDictionary.offensivePlayers[i].x,
			y: conceptJsonDictionary.offensivePlayers[i].y,
			startX: conceptJsonDictionary.offensivePlayers[i].startX,
			startY: conceptJsonDictionary.offensivePlayers[i].startY,
			num: conceptJsonDictionary.offensivePlayers[i].num,
			pos: conceptJsonDictionary.offensivePlayers[i].pos,
			red: conceptJsonDictionary.offensivePlayers[i].red,
			green: conceptJsonDictionary.offensivePlayers[i].green,
			blue: conceptJsonDictionary.offensivePlayers[i].blue,
			unit: conceptJsonDictionary.offensivePlayers[i].unit,
			eligible: conceptJsonDictionary.offensivePlayers[i].eligible,
			siz: conceptJsonDictionary.offensivePlayers[i].siz,
			notes: conceptJsonDictionary.offensivePlayers[i].notes,
			call: conceptJsonDictionary.offensivePlayers[i].call,
			progressionRank: conceptJsonDictionary.offensivePlayers[i].progressionRank
		});

		if (player.pos === "QB") {
			quarterback.push(player);
		}

		if (player.eligible === true) {
			eligibleReceiversArray.push(player);
		}

		if (conceptJsonDictionary.offensivePlayers[i].motionCoords != null) {
			for (var j = 0; j < conceptJsonDictionary.offensivePlayers[i].motionCoords.length; ++j) {
				var motion = conceptJsonDictionary.offensivePlayers[i].motionCoords[j];
				player.motionCoords.push([motion[0], motion[1]]);
			}
		}

		if (conceptJsonDictionary.offensivePlayers[i].dropback != null) {
			for (var j = 0; j < conceptJsonDictionary.offensivePlayers[i].dropback.length; ++j) {
				var drop = conceptJsonDictionary.offensivePlayers[i].dropback[j];
				player.dropback.push([drop[0], drop[1]]);
			}
		}

		if (conceptJsonDictionary.offensivePlayers[i].run != null) {
			for (var j = 0; j < conceptJsonDictionary.offensivePlayers[i].run.length; ++j) {
				var run = conceptJsonDictionary.offensivePlayers[i].run[j];
				player.run.push([run[0], run[1]]);
			}
		}

		if (conceptJsonDictionary.offensivePlayers[i].route != null) {
			for (var j = 0; j < conceptJsonDictionary.offensivePlayers[i].route.length; ++j) {
				var route = conceptJsonDictionary.offensivePlayers[i].route[j];
				player.addToRoute(route[0], route[1]);
			}
		}

		offensivePlayersArray.push(player);
	}

	for (var i = 0; i < conceptJsonDictionary.defensivePlayers.length; ++i) {
		var player = new Player({
			x: conceptJsonDictionary.defensivePlayers[i].x,
			y: conceptJsonDictionary.defensivePlayers[i].y,
			startX: conceptJsonDictionary.defensivePlayers[i].startX,
			startY: conceptJsonDictionary.defensivePlayers[i].startY,
			num: conceptJsonDictionary.defensivePlayers[i].num,
			pos: conceptJsonDictionary.defensivePlayers[i].pos,
			red: conceptJsonDictionary.defensivePlayers[i].red,
			green: conceptJsonDictionary.defensivePlayers[i].green,
			blue: conceptJsonDictionary.defensivePlayers[i].blue,
			unit: conceptJsonDictionary.defensivePlayers[i].unit,
			eligible: conceptJsonDictionary.defensivePlayers[i].eligible,
			siz: conceptJsonDictionary.defensivePlayers[i].siz,
			notes: conceptJsonDictionary.defensivePlayers[i].notes,
			call: conceptJsonDictionary.defensivePlayers[i].call
		});

		if (conceptJsonDictionary.defensivePlayers[i].defensiveMovement != null) {
			for (var j = 0; j < conceptJsonDictionary.defensivePlayers[i].defensiveMovement.length; ++j) {
				var movement = conceptJsonDictionary.defensivePlayers[i].defensiveMovement[j];
				player.defensiveMovement.push([movement[0], movement[1]]);
			}
		}

		if (conceptJsonDictionary.defensivePlayers[i].blitz != null) {
			for (var j = 0; j < conceptJsonDictionary.defensivePlayers[i].blitz.length; ++j) {
				var blitz = conceptJsonDictionary.defensivePlayers[i].blitz[j];
				player.blitz.push([blitz[0], blitz[1]]);
			}
		}

		if (conceptJsonDictionary.defensivePlayers[i].manCoverage != null) {
			for (var j = 0; j < conceptJsonDictionary.defensivePlayers[i].manCoverage.length; ++j) {
				var manCoverage = conceptJsonDictionary.defensivePlayers[i].manCoverage[j];
				player.manCoverage.push(manCoverage);
			}
		}

		if (conceptJsonDictionary.defensivePlayers[i].zoneCoverage != null) {
			player.zoneCoverage = new ZoneAssignment(conceptJsonDictionary.defensivePlayers[i].zoneCoverage)
		}

		defensivePlayersArray.push(player);
	}

	if (conceptJsonDictionary.offensiveLinemen != null) {
		for (var i = 0; i < conceptJsonDictionary.offensiveLinemen.length; ++i) {
			var player = new Player({
				x: conceptJsonDictionary.offensiveLinemen[i].x,
				y: conceptJsonDictionary.offensiveLinemen[i].y,
				startX: conceptJsonDictionary.offensiveLinemen[i].startX,
				startY: conceptJsonDictionary.offensiveLinemen[i].startY,
				num: conceptJsonDictionary.offensiveLinemen[i].num,
				pos: conceptJsonDictionary.offensiveLinemen[i].pos,
				red: conceptJsonDictionary.offensiveLinemen[i].red,
				green: conceptJsonDictionary.offensiveLinemen[i].green,
				blue: conceptJsonDictionary.offensiveLinemen[i].blue,
				unit: conceptJsonDictionary.offensiveLinemen[i].unit,
				eligible: conceptJsonDictionary.offensiveLinemen[i].eligible,
				siz: conceptJsonDictionary.offensiveLinemen[i].siz,
				notes: conceptJsonDictionary.offensiveLinemen[i].notes,
				call: conceptJsonDictionary.offensiveLinemen[i].call
			});

			offensiveLinemenArray.push(player);
		}
	}

	for (i in offensivePlayersArray) {
		for (j in conceptJsonDictionary.offensivePlayers[i].blockingAssignmentArray) {
			var primaryAssignment = conceptJsonDictionary.offensivePlayers[i].blockingAssignmentArray[j];
			var playerToBlock = null;

			if (primaryAssignment.type === 1) {
				for (k in defensivePlayersArray) {
					if (primaryAssignment.player.x === defensivePlayersArray[k].x && primaryAssignment.player.y === defensivePlayersArray[k].y) {
						playerToBlock = defensivePlayersArray[k];
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

	var result = new Concept({
		name: conceptJsonDictionary.name,
		team: conceptJsonDictionary.team,
		unit: conceptJsonDictionary.unit,
		offensivePlayers: offensivePlayersArray,
		defensivePlayers: defensivePlayersArray,
		quarterback: quarterback,
		offensiveLinemen: offensiveLinemenArray,
		eligibleReceivers: eligibleReceiversArray,
		notes: conceptJsonDictionary.notes
	});
	result.updateBlocksForDefense();
	result.updateCoverageForOffense();
	return result;
};
