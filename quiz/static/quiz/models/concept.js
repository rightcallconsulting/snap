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
	this.name = config.name || null;
	this.team = config.team || null;
	this.unit = config.unit || "offense";
	this.offensivePlayers = config.offensivePlayers || [];
	this.defensivePlayers = config.defensivePlayers || [];
	this.quarterback = config.quarterback || null;
	this.offensiveLinemen = config.offensiveLinemen || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.feedbackMessage = config.feedbackMessage || [];
};

//***************************************************************************//
//***************************************************************************//

// drawPlayers draws all the players in a concept.
Concept.prototype.drawPlayers = function () {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].draw(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].draw(field);
	}
};

// drawAssignments
Concept.prototype.drawAssignments = function (field) {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].drawAllBlocks(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].drawDefensiveMovement(field);
	}
};


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
	this.quarterback = null;
	this.offensiveLinemen = [];
	this.eligibleReceivers = [];
	this.defensivePlayers = [];
};

// mouseInPlayer iterates through all the offensive and defensive players
// in a concept. It returns the player that the mouse is inside of or
// null if the mouse is not inside any player.
Concept.prototype.mouseInPlayer = function(field) {
	for(var i = 0; i < this.offensivePlayers.length; i++) {
		var player = this.offensivePlayers[i];
		if (player.isMouseInside(field)) {
			return player;
		}
	}

	for(var i = 0; i < this.defensivePlayers.length; i++) {
		var player = this.defensivePlayers[i];
		if (player.isMouseInside(field)) {
			return player;
		}
	}

	return null;
};

// save handles everything that need to be done when the user pressed the save
// button. It checks the validity of the concept and then saves it (if valid)
// and removes everything from the frontend display.
Concept.prototype.save = function (path, csrf_token) {
	if (this.isValid()) {
		/*var conceptToPost = new Concept ({
			name: this.name,
			team: this.team,
			unit: this.unit,
			offensivePlayers: this.offensivePlayers,
			defensivePlayers: this.defensivePlayers
		});

		this.post(path, csrf_token);*/

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
		}

		var conceptName = this.name;
		var conceptUnit = this.unit;
		conceptJson = JSON.stringify(this, ["name", "team", "unit", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz", "blockingAssignmentArray", "defensiveMovement"]);

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

Concept.prototype.deepCopy = function() {
	var result = new Concept({
		id: this.id,
		name: this.name,
		team: this.team,
		unit: this.unit,
		offensivePlayers: this.offensivePlayers,
		defensivePlayers: this.defensivePlayers,
		quarterback: this.quarterback,
		offensiveLinemen: this.offensiveLinemen,
		eligibleReceivers: this.eligibleReceivers,
		feedbackMessage: this.feedbackMessage
	});

	return result;
}

/*********************************/
/*     Non object functions      */
/*********************************/

function createConceptFromJson(conceptJsonDictionary) {
	var quarterback;
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
			siz: conceptJsonDictionary.offensivePlayers[i].siz
		});

		if (player.pos === "QB") {
			quarterback = player;
		}

		if (player.eligible === true) {
			eligibleReceiversArray.push(player);
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
			siz: conceptJsonDictionary.defensivePlayers[i].siz
		});

		if (conceptJsonDictionary.defensivePlayers[i].defensiveMovement != null) {
			for (var j = 0; j < conceptJsonDictionary.defensivePlayers[i].defensiveMovement.length; ++j) {
				var movement = conceptJsonDictionary.defensivePlayers[i].defensiveMovement[j];
				player.defensiveMovement.push([movement[0], movement[1]]);
			}
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
				siz: conceptJsonDictionary.offensiveLinemen[i].siz
			});

			offensiveLinemenArray.push(player);
		}
	}

	for (var i = 0; i < offensivePlayersArray.length; ++i) {
		for (var j = 0; j < conceptJsonDictionary.offensivePlayers[i].blockingAssignmentArray[0].length ; ++j) {
			var primaryAssignment = conceptJsonDictionary.offensivePlayers[i].blockingAssignmentArray[0][j];

			if (primaryAssignment.x != null) {
				for (var k = 0; k < defensivePlayersArray.length; ++k) {
					if (primaryAssignment.x === defensivePlayersArray[k].x && primaryAssignment.y === defensivePlayersArray[k].y) {
						primaryAssignment = defensivePlayersArray[k];
					}
				}
			}

			offensivePlayersArray[i].blockingAssignmentArray[0].push(primaryAssignment);
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
		eligibleReceivers: eligibleReceiversArray
	});

	return result;
};

/*********************************/
/* Static functions for concepts */
/*********************************/

// createSwoop creates a static version Stanfords swoop blocking concept
Concept.prototype.createSwoop = function(ballY){
	// Create Offensive Players
	var olPositions = ["LT", "LG", "C", "RG", "RT"];

	for (var i = -2; i <= 0; i++) {
		var xPos = Field.WIDTH / 2 + i*2.5;
		var yPos = ballY-1.5;

		var offensive_lineman = new Player({
			num: olPositions[i+2],
			pos: olPositions[i+2],
			x: xPos, y: yPos,
			red: 143, blue: 29, green: 29,
		});

		this.offensiveLinemen.push(offensive_lineman);
		this.offensivePlayers.push(offensive_lineman);
	}

	var left_tackle = this.offensiveLinemen[0];
	var left_guard = this.offensiveLinemen[1];
	var center = this.offensiveLinemen[2];

	var f = new Player ({
		num: "F", pos: "F",
		x: left_tackle.x-2.5,
		y: left_tackle.y,
		red: 255, green: 0, blue: 0,
		eligible: true
	});

	this.eligibleReceivers.push(f);
	this.offensivePlayers.push(f);

	// Create Defensive Players
	var e = new Player ({
		num: "E", pos: "E",
		unit: "defense",
		change: true,
		x: f.x, y: f.y+2,
		red: 0, green: 0, blue: 0
	});

	var t = new Player ({
		num: "T", pos: "T",
		unit: "defense",
		change: true,
		x: left_guard.x-1, y: left_guard.y+2,
		red: 0, green: 0, blue: 0
	});

	var w = new Player ({
		num: "W", pos: "W",
		unit: "defense",
		change: true,
		x: left_tackle.x, y: left_tackle.y+5,
		red: 0, green: 0, blue: 0
	});

	this.defensivePlayers.push(e);
	this.defensivePlayers.push(t);
	this.defensivePlayers.push(w);

	// Create offensive assignments
	f.blockingAssignmentArray[0].push("Down Block Right");
	left_tackle.blockingAssignmentArray[0].push("Down Block Right");
	left_guard.blockingAssignmentArray[0].push("Down Block Right");
	left_guard.blockingAssignmentArray[0].push("Straight Seal Right");
};

// createCat creates a static version Stanfords cat blocking concept
Concept.prototype.createCat = function(ballY){
	// Create Offensive Players
	var olPositions = ["LT", "LG", "C", "RG", "RT"];

	for (var i = -2; i <= 0; i++) {
		var xPos = Field.WIDTH / 2 + i*2.5;
		var yPos = ballY-1.5;

		var offensive_lineman = new Player({
			num: olPositions[i+2],
			pos: olPositions[i+2],
			x: xPos, y: yPos,
			red: 143, blue: 29, green: 29,
		});

		this.offensiveLinemen.push(offensive_lineman);
		this.offensivePlayers.push(offensive_lineman);
	}

	var left_tackle = this.offensiveLinemen[0];
	var left_guard = this.offensiveLinemen[1];
	var center = this.offensiveLinemen[2];

	// Create Defensive Players
	var t = new Player ({
		num: "T", pos: "T",
		unit: "defense",
		change: true,
		x: left_guard.x-1, y: left_guard.y+2,
		red: 0, green: 0, blue: 0
	});

	var n = new Player ({
		num: "N", pos: "N",
		unit: "defense",
		change: true,
		x: center.x+0.5, y: center.y+2,
		red: 0, green: 0, blue: 0
	});

	var w = new Player ({
		num: "W", pos: "W",
		unit: "defense",
		change: true,
		x: left_guard.x-1.25, y: left_guard.y+5,
		red: 0, green: 0, blue: 0
	});

	this.defensivePlayers.push(t);
	this.defensivePlayers.push(n);
	this.defensivePlayers.push(w);

	// Create offensive assignments
	left_tackle.blockingAssignmentArray[0].push("Down Block Right");
	center.blockingAssignmentArray[0].push(t);
	center.blockingAssignmentArray[0].push(w);
};

// createTO creates a static version Stanfords T.O. blocking concept
Concept.prototype.createTO = function(ballY){
	// Create Offensive Players
	var olPositions = ["LT", "LG", "C", "RG", "RT"];

	for (var i = 1; i <= 2; i++) {
		var xPos = Field.WIDTH / 2 + i*2.5;
		var yPos = ballY-1.5;

		var offensive_lineman = new Player({
			num: olPositions[i+2],
			pos: olPositions[i+2],
			x: xPos, y: yPos,
			red: 143, blue: 29, green: 29
		});

		this.offensiveLinemen.push(offensive_lineman);
		this.offensivePlayers.push(offensive_lineman);
	}

	var right_guard = this.offensiveLinemen[0];
	var right_tackle = this.offensiveLinemen[1];

	var y = new Player ({
		num: "Y", pos: "Y",
		x: right_tackle.x+2.5,
		y: right_tackle.y,
		red: 255, green: 0, blue: 0,
		eligible: true
	});

	this.eligibleReceivers.push(y);
	this.offensivePlayers.push(y);

	// Create Defensive Players
	var e = new Player ({
		num: "E", pos: "E",
		unit: "defense",
		change: true,
		x: right_tackle.x+1.75, y: right_tackle.y+2,
		red: 0, green: 0, blue: 0
	});

	var s = new Player ({
		num: "S", pos: "S",
		unit: "defense",
		change: true,
		x: y.x+1.75, y: y.y+2,
		red: 0, green: 0, blue: 0
	});

	this.defensivePlayers.push(e);
	this.defensivePlayers.push(s);

	// Create offensive assignments
	right_tackle.blockingAssignmentArray[0].push("Down Block Right");
	y.blockingAssignmentArray[0].push("Down Block Right");
};
