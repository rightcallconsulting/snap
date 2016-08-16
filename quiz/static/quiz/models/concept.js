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
	this.unit = config.unit || null; // There might not be a need for this - probably a smarter way to do it
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
		this.offensivePlayers[i].draw();
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].draw();
	}
};

// drawAssignments
Concept.prototype.drawAssignments = function (field) {
	var numberOfOffensivePlayers = this.offensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].drawAllBlocks(field);
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
			return this.offensivePlayers[i];
		}
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		if (this.defensivePlayers[i].selected) {
			return this.defensivePlayers[i];
		}
	}

	return null;
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
Concept.prototype.save = function (path) {

};

// post handles sending as JSON object to backend so it can be saved to the
// database.
Concept.prototype.post = function(path) {

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
