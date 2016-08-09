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
	this.offensiveLine = config.offensiveLine || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.defensivePlayers = config.defensivePlayers || [];
};

//***************************************************************************//
//***************************************************************************//

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

Concept.prototype.isValid = function() {
	// TODO: Implement
};


Concept.prototype.reset = function() {
	this.offensivePlayers = [];
	this.quarterback = null;
	this.offensiveLine = [];
	this.eligibleReceivers = [];
	this.defensivePlayers = [];
};
