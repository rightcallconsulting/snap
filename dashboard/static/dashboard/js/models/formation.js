//***************************************************************************//
//																			 //
// formation.js - Right Call Consulting. All Rights Reserved. 2016			 //
//																			 //
//***************************************************************************//
//																			 //
// A formation object represents one offensive or defensive formation.		 //
// Each instance of one of these objects maintains an array of all of the	 //
// players in the formation and their positions on the field.				 //
//																			 //
//***************************************************************************//

var Formation = function(config){
	this.name = config.name || "";
	this.unit = config.unit || "offense";
	this.offensivePlayers = config.offensivePlayers || [];
	this.defensivePlayers = config.defensivePlayers || [];
	this.quarterback = config.quarterback || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.offensiveLinemen = config.offensiveLinemen || [];
	this.notes = config.notes || [];

	this.optionsToCreate = config.optionsToCreate || [];
	this.feedbackMessage = "";
	this.id = config.id || null;
};

//***************************************************************************//
//***************************************************************************//

Formation.prototype.getFullName = function(){
	return this.name;
}

Formation.prototype.drawAssignments = function(field){
	for(var i = 0; i < this.defensivePlayers.length; i++){
		this.defensivePlayers[i].drawAssignments(field);
	}
}

// createOffensiveLineAndQuarterback
Formation.prototype.createOffensiveLineAndQuarterback = function(ballY){
	var olPositions = ["LT", "LG", "C", "RG", "RT"];
	for (var i = -2; i <= 2; i++) {
		var xPos = Field.WIDTH/2 + i*2.5;
		var yPos = ballY;

		var offensive_lineman = new Player({
			x: xPos,
			y: yPos,
			num: olPositions[i+2],
			fill: color(143, 29, 29),
			red: 143,
			blue: 29,
			green: 29,
			pos: olPositions[i+2],
			index: i
		});
		this.offensiveLinemen.push(offensive_lineman);
		this.offensivePlayers.push(offensive_lineman);
	}

	currentPlayer = this.offensiveLinemen[3];
	var quarterback = new Player ({
		x: this.offensiveLinemen[2].x,
		y: this.offensiveLinemen[2].y-2.25,
		num: 12,
		fill: color(212, 130, 130),
		red: 212,
		blue: 130,
		green: 130,
		pos: "QB",
		eligible: true
	});

	this.quarterback.push(quarterback);
	this.offensivePlayers.push(quarterback);
};

// drawPlayers draws all of the players currently in the offensive and
// defensive player arrays for this formation.
Formation.prototype.drawPlayers = function(field) {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].draw(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].draw(field);
	}
};

// isValid checks the legality of a formation.
Formation.prototype.isValid = function() {
	// TODO: Implement
	//
	// IDEAS: More players in a formation than can be in a play.
	//		  Inelligable setups. Illegal actions.

	return true;
};

// getSelected iterates through all the players in a formation and returns
// the one player that is selected. If no one is selected it returns null.
//
// TODO: implement logic for selecting multiple players and return an array.
Formation.prototype.getSelected = function() {
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

// clearSelected iterates through all the players in a formation and makes
// them all unselected.
Formation.prototype.clearSelected = function() {
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].setUnselected();
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].setUnselected();
	}
};

// mouseInPlayer iterates through all the offensive and defensive players
// in a formation. It returns the player that the mouse is inside of or
// null if the mouse is not inside any player.
Formation.prototype.mouseInPlayer = function(field) {
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

Formation.prototype.updateCoverageForOffense = function(offense){
	for(var i = 0; i < this.defensivePlayers.length; i++){
		var defender = this.defensivePlayers[i];
		for(var j = 0; j < defender.manCoverage.length; j++){
			var assignment = defender.manCoverage[j];
			var found = false;
			for(var k = 0; k < offense.offensivePlayers.length; k++){
				var receiver = offense.offensivePlayers[k];
				if(receiver.pos === assignment.pos && receiver.x === assignment.x && receiver.y === assignment.y){
					defender.manCoverage[j] = receiver;
					found = true;
					break;
				}
			}
			if (!found){
				defender.manCoverage.splice(j, 1);
				j--;
			}
		}
	}
}

// save handles everything that need to be done when the user pressed the save
// button. It checks the validity of the formation and then saves it (if valid).
Formation.prototype.save = function (path, csrf_token) {
	if (this.isValid()) {
		var formationJson = "";
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

		var formationName = this.name;
		var formationUnit = this.unit;
		formationJson = JSON.stringify(this, ["name", "team", "unit", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz", "notes", "blitz", "manCoverage", "zoneCoverage", "type"]);

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, save: true, delete: false, name: formationName, unit: formationUnit, formation: formationJson}
			).done(function() {
				console.log("Formation successfully sent to Django to be saved");
			}).fail(function() {
				console.log("Error sending Formation to Django to be saved");
		});
	} else {
		this.feedbackMessage = "Invalid Formation";
	}
};

// delete sends a delete request to Django for this formation.
Formation.prototype.delete = function(path, csrf_token) {
	var formationName = this.name;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: false, delete: true, name: formationName}
		).done(function() {
			console.log("Formation successfully sent to Django to be deleted");
		}).fail(function() {
			console.log("Error sending Formation to Django to be deleted");
	});
};

// deepCopy returns a new Concept object that is exactly the same as this.
Formation.prototype.deepCopy = function() {
	var deepCopy = new Formation({
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

	return deepCopy;
};

/*********************************/
/*     Non object functions      */
/*********************************/

function createFormationFromJson(formationJsonDictionary) {
	var quarterback = [];
	var offensivePlayersArray = [];
	var defensivePlayersArray = [];
	var offensiveLinemenArray = [];
	var eligibleReceiversArray = [];

	for (var i = 0; i < formationJsonDictionary.offensivePlayers.length; ++i) {
		var player = new Player({
			x: formationJsonDictionary.offensivePlayers[i].x,
			y: formationJsonDictionary.offensivePlayers[i].y,
			startX: formationJsonDictionary.offensivePlayers[i].startX,
			startY: formationJsonDictionary.offensivePlayers[i].startY,
			num: formationJsonDictionary.offensivePlayers[i].num,
			pos: formationJsonDictionary.offensivePlayers[i].pos,
			red: formationJsonDictionary.offensivePlayers[i].red,
			green: formationJsonDictionary.offensivePlayers[i].green,
			blue: formationJsonDictionary.offensivePlayers[i].blue,
			unit: formationJsonDictionary.offensivePlayers[i].unit,
			eligible: formationJsonDictionary.offensivePlayers[i].eligible,
			siz: formationJsonDictionary.offensivePlayers[i].siz
		});

		if (player.pos === "QB") {
			quarterback.push(player);
		}

		if (player.eligible === true) {
			eligibleReceiversArray.push(player);
		}

		offensivePlayersArray.push(player);
	}

	for (var i = 0; i < formationJsonDictionary.defensivePlayers.length; ++i) {
		var player = new Player({
			x: formationJsonDictionary.defensivePlayers[i].x,
			y: formationJsonDictionary.defensivePlayers[i].y,
			startX: formationJsonDictionary.defensivePlayers[i].startX,
			startY: formationJsonDictionary.defensivePlayers[i].startY,
			num: formationJsonDictionary.defensivePlayers[i].num,
			pos: formationJsonDictionary.defensivePlayers[i].pos,
			red: formationJsonDictionary.defensivePlayers[i].red,
			green: formationJsonDictionary.defensivePlayers[i].green,
			blue: formationJsonDictionary.defensivePlayers[i].blue,
			unit: formationJsonDictionary.defensivePlayers[i].unit,
			eligible: formationJsonDictionary.defensivePlayers[i].eligible,
			siz: formationJsonDictionary.defensivePlayers[i].siz
		});

		if (formationJsonDictionary.defensivePlayers[i].defensiveMovement != null) {
			for (var j = 0; j < formationJsonDictionary.defensivePlayers[i].defensiveMovement.length; ++j) {
				var movement = formationJsonDictionary.defensivePlayers[i].defensiveMovement[j];
				player.defensiveMovement.push([movement[0], movement[1]]);
			}
		}

		if (formationJsonDictionary.defensivePlayers[i].blitz != null) {
			for (var j = 0; j < formationJsonDictionary.defensivePlayers[i].blitz.length; ++j) {
				var blitz = formationJsonDictionary.defensivePlayers[i].blitz[j];
				player.blitz.push([blitz[0], blitz[1]]);
			}
		}

		if (formationJsonDictionary.defensivePlayers[i].manCoverage != null) {
			for (var j = 0; j < formationJsonDictionary.defensivePlayers[i].manCoverage.length; ++j) {
				var manCoverage = formationJsonDictionary.defensivePlayers[i].manCoverage[j];
				player.manCoverage.push(manCoverage);
			}
		}

		if (formationJsonDictionary.defensivePlayers[i].zoneCoverage != null) {
			player.zoneCoverage = new ZoneAssignment(formationJsonDictionary.defensivePlayers[i].zoneCoverage)
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

	var result = new Formation({
		name: formationJsonDictionary.name,
		team: formationJsonDictionary.team,
		unit: formationJsonDictionary.unit,
		notes: formationJsonDictionary.notes,
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
// mouseInOptionsToCreate iterates through the player options available
// and checks if the mouse is inside any of the player options. It returns
// the player object that the mouse is in.
Formation.prototype.mouseInOptionsToCreate = function(field) {
	var optionClicked = null;

	for(var i = 0; i < this.optionsToCreate.length; i++) {
		var player = this.optionsToCreate[i];
		if (player.isMouseInside(field)) {
			optionClicked = player;
		}
	}

	return optionClicked;
};

Formation.prototype.removePlayerWithPosition = function(position){
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

Formation.prototype.getPlayersWithPosition = function(position){
  var players = [];
  for(var i = 0; i < offensivePlayers.length; i++){
    var p = offensivePlayers[i];
    if(p.pos === position){
      players.push(p);
    }
  }

  for(var i = 0; i < defensivePlayers.length; i++){
    var p = defensivePlayers[i];
    if(p.pos === position){
      players.push(p);
    }
  }
  return players;
}

//pos is a str for now, but could be an int code later
Formation.prototype.getPlayerFromPosition = function(pos) {
	var players = this.offensivePlayers.filter(function(player) {return player.pos === pos});
	players.concat(this.defensivePlayers.filter(function(player) {return player.pos === pos}))
	if(players.length === 0) {
		return null;
	}

	return players[0];
};

Formation.prototype.drawAllPlayers = function(field) {
	this.offensivePlayers.forEach(function(player) {
		player.draw(field);
	});

	this.defensivePlayers.forEach(function(player) {
		player.draw(field);
	});
};

Formation.prototype.drawOptionsToCreate = function() {
	this.optionsToCreate.forEach(function(player){
		player.draw(field);
	})
};

Formation.prototype.createDummyFormation = function(){
	var jsonString = "{\"name\":\"Green RT\",\"team\":\"1\",\"unit\":\"offense\",\"offensivePlayers\":[{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":21.665,\"startY\":65,\"x\":21.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":24.165,\"startY\":65,\"x\":24.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"C\",\"num\":\"C\",\"startX\":26.665,\"startY\":65,\"x\":26.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":29.165,\"startY\":65,\"x\":29.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":31.665,\"startY\":65,\"x\":31.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"QB\",\"num\":12,\"startX\":26.665,\"startY\":62.75,\"x\":26.665,\"y\":62.75,\"eligible\":true,\"red\":212,\"green\":130,\"blue\":130,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"Y\",\"num\":\"Y\",\"startX\":34.10227992957746,\"startY\":65,\"x\":34.10227992957746,\"y\":65,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"X\",\"num\":\"X\",\"startX\":11.848758802816901,\"startY\":65,\"x\":11.848758802816901,\"y\":65,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"Z\",\"num\":\"Z\",\"startX\":41.56706866197183,\"startY\":63.274647887323944,\"x\":41.56706866197183,\"y\":63.274647887323944,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"H\",\"num\":\"H\",\"startX\":26.77833626760563,\"startY\":57.21830985915493,\"x\":26.77833626760563,\"y\":57.21830985915493,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"F\",\"num\":\"F\",\"startX\":26.707913732394367,\"startY\":59.61267605633803,\"x\":26.707913732394367,\"y\":59.61267605633803,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2}],\"defensivePlayers\":[],\"quarterback\":[{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"QB\",\"num\":12,\"startX\":26.665,\"startY\":62.75,\"x\":26.665,\"y\":62.75,\"eligible\":true,\"red\":212,\"green\":130,\"blue\":130,\"siz\":2}],\"offensiveLinemen\":[{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":21.665,\"startY\":65,\"x\":21.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":24.165,\"startY\":65,\"x\":24.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"C\",\"num\":\"C\",\"startX\":26.665,\"startY\":65,\"x\":26.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":29.165,\"startY\":65,\"x\":29.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":31.665,\"startY\":65,\"x\":31.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2}],\"eligibleReceivers\":[]}"
	return createFormationFromJson(JSON.parse(jsonString))
}