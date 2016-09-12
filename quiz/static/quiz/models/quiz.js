
//***************************************************************************//
//																			 //
// quiz.js - Right Call Consulting. All Rights Reserved. 2016		     	 //
//																			 //
//***************************************************************************//
//																			 //
// A quiz object contains all the formations, plays, and concepts in one     //
// assigned quiz.                                                            //
//																			 //
//***************************************************************************//

var Quiz = function(config) {
	this.name = config.name || "";
	this.unit = config.unit || "offense";
	this.formations = config.formations || [];
	this.plays = config.plays || [];
	this.concepts = config.concepts || [];
};

//***************************************************************************//
//***************************************************************************//

// save handles everything that need to be done when the user pressed the save
// button. It checks the validity of the play and then saves it (if valid)
Play.prototype.save = function (path, csrf_token) {
	if (this.isValid()) {
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

		playJson = JSON.stringify(this, ["name", "scoutName", "team", "unit", "formation", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz", "blockingAssignmentArray", "type", "player", "defensiveMovement", "route"]);
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
		this.feedbackMessage = "Invalid Play";
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
	var result = new Play({
		id: this.id,
		name: this.name,
		scoutName: this.scoutName,
		team: this.team,
		unit: this.unit,
		formation: this.formation,
		feedbackMessage: this.feedbackMessage
	});

	for (var i = 0; i < this.quarterback.length; ++i) {
		result.quarterback.push(this.quarterback[i].deepCopy());
	}

	for (var i = 0; i < this.offensivePlayers.length; ++i) {
		result.offensivePlayers.push(this.offensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < this.defensivePlayers.length; ++i) {
		result.defensivePlayers.push(this.defensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < this.offensiveLinemen.length; ++i) {
		result.offensiveLinemen.push(this.offensiveLinemen[i].deepCopy());
	}

	for (var i = 0; i < this.eligibleReceivers.length; ++i) {
		result.eligibleReceivers.push(this.eligibleReceivers[i].deepCopy());
	}

	return result;
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
			siz: playJsonDictionary.offensivePlayers[i].siz
		});

		if (player.pos === "QB") {
			quarterback.push(player);
		}

		if (player.eligible === true) {
			eligibleReceiversArray.push(player);
		}

		if (playJsonDictionary.offensivePlayers[i].route != null) {
			for (var j = 0; j < playJsonDictionary.offensivePlayers[i].route.length; ++j) {
				var route = playJsonDictionary.offensivePlayers[i].route[j];
				player.route.push([route[0], route[1]]);
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
			siz: playJsonDictionary.defensivePlayers[i].siz
		});

		if (playJsonDictionary.defensivePlayers[i].defensiveMovement != null) {
			for (var j = 0; j < playJsonDictionary.defensivePlayers[i].defensiveMovement.length; ++j) {
				var movement = playJsonDictionary.defensivePlayers[i].defensiveMovement[j];
				player.defensiveMovement.push([movement[0], movement[1]]);
			}
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

	var scoutName = "";
	if (playJsonDictionary.scoutName != null) {
		scoutName = playJsonDictionary.scoutName;
	}

	var result = new Play({
		name: playJsonDictionary.name,
		scoutName: scoutName,
		team: playJsonDictionary.team,
		unit: playJsonDictionary.unit,
		formation: playJsonDictionary.formation,
		offensivePlayers: offensivePlayersArray,
		defensivePlayers: defensivePlayersArray,
		quarterback: quarterback,
		offensiveLinemen: offensiveLinemenArray,
		eligibleReceivers: eligibleReceiversArray
	});

	return result;
};

/*******************************************************************************************************************************************/

/*******************************************************************************************************************************************/

/*******************************************************************************************************************************************/

/*******************************************************************************************************************************************/