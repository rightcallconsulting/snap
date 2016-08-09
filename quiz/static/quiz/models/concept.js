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
	this.quarterback = config.quarterback || null;
	this.offensiveLinemen = config.offensiveLine || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.defensivePlayers = config.defensivePlayers || [];
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
Concept.prototype.drawAssignments = function () {
	// TODO: Implement
};

  														
// isValid checks the legality of a concept.
Concept.prototype.isValid = function() {
	// TODO: Implement
	//
	// IDEAS: More players in a concept than can be in a play.
	//		  Inelligable setups. Illegal actions.
};
														
// reset clears the current concept and returns an empty screen
Concept.prototype.reset = function() {
	this.offensivePlayers = [];
	this.quarterback = null;
	this.offensiveLinemen = [];
	this.eligibleReceivers = [];
	this.defensivePlayers = [];
};

// mouseInCenter iterates through the players on the offensive line and checks
// if the mouse is inside the center. It returns the center if the mouse is 
// inside of it or null otherwise.
Concept.prototype.mouseInCenter = function(field) {
	for(var i = 0; i < this.offensiveLineman.length; i++) {
		var player = this.offensiveLineman[i];
		if (player.pos === "C" && player.isMouseInside(field)) {
			return player;
		}
	}

	return null;
};

/* Static functions for concepts */
// createSwoop creates a static version Stanfords swoop blocking concept
Concept.prototype.createSwoop = function(ballY){
	// Create Offensive Players
	var olPositions = ["LT", "LG", "C", "RG", "RT"];

	for (var i = -2; i <= 0; i++) {
		var xPos = Field.WIDTH / 2 + i*2.5;
		var yPos = ballY-1.5;
		
		if (i !== 0) {
			yPos -= 0.5;
		}

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

	var f = new Player ({
		num: "F", pos: "F", 
		x: left_tackle.x-2.5,
		y: left_tackle.y,
		red: 255, green: 0, blue: 0
	});

	this.eligibleReceivers.push(f);
	this.offensivePlayers.push(f);

	// Create Defensive Players
	var w = new Player ({
		num: "W", pos: "W",
		unit: "defense", 
		change: true,
		x: left_tackle.x,
		y: left_tackle.y+5,
		red: 0, green: 0, blue: 0
	});

	var e = new Player ({
		num: "E", pos: "E",
		unit: "defense", 
		change: true,
		x: f.x, y: f.y+2.5,
		red: 0, green: 0, blue: 0
	});

	this.defensivePlayers.push(w);
	this.defensivePlayers.push(e);
};
