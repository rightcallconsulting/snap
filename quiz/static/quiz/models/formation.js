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

	this.qb = config.qb || [];
	this.playName = config.playName || "";
	this.changeablePlayers = config.changeablePlayers || [];
	this.optionsToCreate = config.optionsToCreate || [];
	this.feedbackMessage = "";
	this.id = config.id || null;
	this.updated_at = config.updated_at || null;
	this.created_at = config.created_at || null;
	this.positions = config.positions || [];
	this.dline = config.dline || [];
	this.oline = config.oline || [];
	this.linebackers = config.linebackers || [];
	this.cornerbacks = config.cornerbacks || [];
	this.safeties = config.safeties || [];
	this.offensiveFormationID = config.offensiveFormationID || 0;
};

//***************************************************************************//
//***************************************************************************//

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
		formationJson = JSON.stringify(this, ["name", "team", "unit", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz"]);

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

// createPlayer takes a new player object as an input and adds him
// to the formation.
Formation.prototype.createPlayer = function(new_player) {
	if(new_player.unit === "defense") {
		if (this.defensivePlayers.length < 11) {
			this.defensivePlayers.push(new_player);
			this.changeablePlayers.push(new_player);
			this.establishingNewPlayer = new_player;
			if(new_player.pos === "DL" || new_player.pos === "DE") {
				this.dline.push(new_player);
			} else if(new_player.pos === "W" || new_player.pos === "M" || new_player.pos === "S") {
				this.linebackers.push(new_player);
			} else if(new_player.pos === "CB") {
				this.cornerbacks.push(new_player);
			} else if(new_player.pos === "SS" || new_player.pos === "FS") {
				this.safeties.push(new_player);
			}
		}
	} else {
		if (this.offensivePlayers.length < 11) {
			this.offensivePlayers.push(new_player);
			this.eligibleReceivers.push(new_player);
			this.establishingNewPlayer = new_player;
		}
	}
};

// mouseInReceiverOrNode iterates through the elligible receivers in a
// formation and checks if the mouse is inside any of the receivers of the
// nodes in their route. It returns the player that the mouse is inside.
Formation.prototype.mouseInReceiverOrNode = function(field) {
	var receiverClicked = null;
	var selectedNode = null;

	for(var i = 0; i < this.eligibleReceivers.length; i++) {
		var player = this.eligibleReceivers[i];

		if (player.isMouseInside(field)) {
			receiverClicked = player;
		}

		for(var j = 0; j < player.routeNodes.length; j++) {
			var node = player.routeNodes[j];

			if (node.isMouseInside(field)) {
				selectedNode = node;
			}
		}

		for(var k = 0; k < player.runNodes.length; k++){
			var node = player.runNodes[k];

			if (node.isMouseInside(field)){
				selectedNode = node;
			}
		}
	}

	return [receiverClicked, selectedNode];
};

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

// mouseInOptionsToCreate iterates through the player options available
// and checks if the mouse is inside any of the player options.	It returns
// the center if the mouse is inside of it or null otherwise.
Formation.prototype.mouseInCenter = function(field){
	for(var i = 0; i < this.offensiveLinemen.length; i++) {
		var p = this.offensiveLinemen[i];
		if (p.pos === "C" && p.isMouseInside(field)) {
			return p;
		}
	}

	return null;
};

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

//POSITIVE = STRONG RIGHT, NEGATIVE = STRONG LEFT, 0 = EVEN
Formation.prototype.getPassStrength = function(){
  var centerX = this.offensiveLinemen[2].x;
  var count = 0;
  this.eligibleReceivers.forEach(function(wr){
    if(wr.x > centerX){
      count++;
    }else{
      count--;
    }
  })
  return count;
};

Formation.prototype.createOLineAndQB = function(ballY){
	var olPositions = ["LT", "LG", "C", "RG", "RT"];
	for (var i = -2; i <= 2; i++) {
		var xPos = Field.WIDTH / 2 + i*2.5;
		var yPos = ballY-1.5;
		if (i !== 0) {
			yPos -= 0.5;
		}
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

Formation.prototype.createSkillPlayers = function(){
	var rb1 = new Player ({
      x: this.quarterback[0].x,
      y: this.quarterback[0].y + 60,
      num: 22,
      pos: "RB",
      fill: color(255, 0, 0),
      progressionRank: 3,
      routeNum: 2,
      eligible: true
  });

  var te1 = new Player ({
      x: this.offensiveLinemen[0].x - 30,
      y: this.offensiveLinemen[0].y,
      num: 80,
      pos: "TE",
      fill: color(255, 0, 0),
      progressionRank: 2,
      routeNum: 3,
      eligible: true
  });
  var te2 = new Player({
     x: this.offensiveLinemen[4].x + 40,
     y: this.offensiveLinemen[4].y + 30,
     num: 17,
     pos: "TE",
     fill: color(255, 0, 0),
     progressionRank: 4,
     routeNum: 4,
     eligible: true
  });
  var wr1 = new Player({
     x: this.offensiveLinemen[0].x - 80,
     y: this.offensiveLinemen[4].y + 30,
     num: 88,
     pos: "WR",
     fill: color(255, 0, 0),
     progressionRank: 1,
     routeNum: 0,
     eligible: true
  });
  var wr2 = new Player({
     x: this.offensiveLinemen[4].x + 80,
     y: this.offensiveLinemen[4].y,
     num: 84,
     pos: "WR",
     fill: color(255, 0, 0),
     progressionRank: 5,
     routeNum: 1,
     eligible: true
  });
  this.offensivePlayers.push(rb1);
  this.offensivePlayers.push(te1);
  this.offensivePlayers.push(te2);
  this.offensivePlayers.push(wr1);
  this.offensivePlayers.push(wr2);

  this.eligibleReceivers.push(rb1);
  this.eligibleReceivers.push(te1);
  this.eligibleReceivers.push(te2);
  this.eligibleReceivers.push(wr1);
  this.eligibleReceivers.push(wr2);
};


/*Formation.prototype.getPlayerFromIndex = function(playerIndex, unitIndex){
    if(this.unit === "offense"){
      var unit = this.offensiveLinemen;
      if(unitIndex === 1){
          unit = this.wideReceivers;
      }else if(unitIndex === 2){
          unit = this.runningBacks;
      }else if(unitIndex === 3){
          unit = this.tightEnds;
      }
      if(playerIndex >= 0 && playerIndex < unit.length){
        return unit[playerIndex];
      }
      return null;
    }else{
      var unit = this.dline;
      if(unitIndex === 1){
          unit = this.linebackers;
      }else if(unitIndex === 2){
          unit = this.cornerbacks;
      }else if(unitIndex === 3){
          unit = this.safeties;
      }
      if(playerIndex >= 0 && playerIndex < unit.length){
        return unit[playerIndex];
      }
      return null;
    }
}*/

//pos is a str for now, but could be an int code later
Formation.prototype.getPlayerFromPosition = function(pos) {
	var players = this.offensivePlayers.filter(function(player) {return player.pos === pos});
	players.concat(this.defensivePlayers.filter(function(player) {return player.pos === pos}))
	if(players.length === 0) {
		return null;
	}

	return players[0];
};

Formation.prototype.establishZoneHotSpots = function() {
	var centerYardX = this.getPlayerFromPosition("C").startX;
	var centerYardY = this.getPlayerFromPosition("C").startY;
};

Formation.prototype.drawOLQB = function() {
	this.offensiveLinemen.forEach(function(offensiveLineman) {
		offensiveLineman.draw();
	});

	this.quarterback.forEach(function(quarterback) {
		quarterback.draw();
	});
};

Formation.prototype.drawAllPlayers = function(field) {
	this.offensivePlayers.forEach(function(player) {
		player.draw(field);
	});

	this.defensivePlayers.forEach(function(player) {
		player.draw(field);
	});

	this.changeablePlayers.forEach(function(player) {
		player.draw(field);
	});
};

Formation.prototype.drawOptionsToCreate = function() {
	this.optionsToCreate.forEach(function(player){
		player.draw(field);
	})
};

Formation.prototype.createDefensivePlay = function() {
	var defensivePlay = new DefensivePlay({});
	defensivePlay.defensivePlayers = this.defensivePlayers;
	defensivePlay.offensiveFormationID = this.offensiveFormationID;
	defensivePlay.dline = this.dline;
	defensivePlay.linebacker = this.linebacker;
	defensivePlay.cornerbacks = this.cornerbacks;
	defensivePlay.safeties = this.safeties;
	defensivePlay.id = this.id;
	defensivePlay.playName = this.playName;
	defensivePlay.defensivePlayers.forEach(function(player){
		player.unit = "defense";
	})
	return defensivePlay
};

Formation.prototype.findSelectedWR = function(){
  var selectedWR = this.eligibleReceivers.filter(function(wr) {
    return wr.clicked === true;
  })[0];
  return selectedWR;
};

Formation.prototype.findSelectedDefensivePlayer = function(){
  var selectedPlayer = this.defensivePlayers.filter(function(player) {
    return player.clicked === true;
  })[0];
  return selectedPlayer;
};

Formation.prototype.removeAllPlayers = function(){
  if(this.unit === "defense"){
    this.defensivePlayers = [];
    this.dline = [];
    this.linebackers = [];
    this.safeties = [];
    this.cornerbacks = [];
    this.changeablePlayers = [];
  }
  else{
    this.eligibleReceivers.forEach(function(player){
        index = this.offensivePlayers.indexOf(player);
        this.offensivePlayers.splice(index, 1);
    }.bind(this))
    this.eligibleReceivers = [];
    this.changeablePlayers = [this.quarterback[0]];
  }
};

Formation.prototype.mouseInQB = function(field) {
	for(var i = 0; i < this.quarterback.length; i++) {
		var p = this.quarterback[i];
		if (p.isMouseInside(field)) {
			return [p];
		}
	}
	return [];
};

Formation.prototype.mouseInDefensivePlayer = function(field) {
	for(var i = 0; i < this.defensivePlayers.length; i++) {
		var p = this.defensivePlayers[i];
		if (p.isMouseInside(field)) {
			var defensivePlayer = p;
		}
	}
	return defensivePlayer;
};

Formation.prototype.validFormation = function(){
	return true;
}

Formation.prototype.deletePlayer = function(player){
  if(player.unit === "defense"){
    index = this.defensivePlayers.indexOf(player);
    this.defensivePlayers.splice(index, 1);
    index = this.changeablePlayers.indexOf(player);
    this.changeablePlayers.splice(index, 1);

    if(player.pos === "DL" || player.pos === "DE"){
      index = this.dline.indexOf(player);
      this.dline.splice(index, 1);
    }
    else if(player.pos === "W" || player.pos === "M" || player.pos === "S"){
      index = this.linebackers.indexOf(player);
      this.linebackers.splice(index, 1);
    }
    else if(player.pos === "CB"){
      index = this.cornerbacks.indexOf(player);
      this.cornerbacks.splice(index, 1);
    }
    else if(player.pos === "SS" || player.pos === "FS"){
      index = this.safeties.indexOf(player);
      this.safeties.splice(index, 1);
    }
  }
  else{
    index = this.eligibleReceivers.indexOf(player);
    this.eligibleReceivers.splice(index, 1);
    index = this.changeablePlayers.indexOf(player);
    this.changeablePlayers.splice(index, 1);
    index = this.offensivePlayers.indexOf(player);
    this.offensivePlayers.splice(index, 1);
  }
};

Formation.prototype.clearPreviousRouteDisplays = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    p.showPreviousRoute = false;
    p.showPreviousRouteGuess = false;
  }
}

Formation.prototype.clearProgression = function(){
    for(var i = 0; i < this.eligibleReceivers.length; i++){
        var p = this.eligibleReceivers[i];
        p.unselect();
        p.showRoute = false;
    }
};

Formation.prototype.clearRouteDrawings = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    p.routeCoordinates = [[p.startX, p.startY]];
    p.routeNodes = [];
    p.progressionRank = 0;
    p.showPreviousRoute = false;
    p.showPreviousRouteGuess = false;
    p.blocker = false;
    p.blockingAssignment = null;
  }
};

Formation.prototype.clearBlockingAssignments = function(){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    this.offensivePlayers[i].blockingAssignment = null;
    this.offensivePlayers[i].blockingAssignmentObject = null;
    this.offensivePlayers[i].unselect();
  }
};

Formation.prototype.clearRunAssignments = function(){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    this.offensivePlayers[i].runAssignment = null;
    this.offensivePlayers[i].runner = false;
  }
};

Formation.prototype.drawRunAssignments = function(field){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    var player = this.offensivePlayers[i];
    if(player.runAssignment){
        player.runAssignment.draw(player, field);
    }
  }
};

Formation.prototype.drawBlockingAssignmentObjects = function(field){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    var player = this.offensivePlayers[i];
    if(player.blockingAssignmentObject){
      player.blockingAssignmentObject.draw(player, field);
    }
  }
}

Formation.prototype.drawBlockingAssignments = function(field, defensivePlay){
  this.offensivePlayers.forEach(function(player){
    if(!player.blockingAssignment && defensivePlay && player.blockingAssignmentUnitIndex && player.blockingAssignmentPlayerIndex){
      player.blockingAssignment = defensivePlay.getPlayer(player.blockingAssignmentUnitIndex, player.blockingAssignmentPlayerIndex);
    }
    if(player.blockingAssignment){
      var x1 = field.getTranslatedX(player.x);
      var y1 = field.getTranslatedY(player.y);
      var x2 = field.getTranslatedX(player.blockingAssignment.x);
      var y2 = field.getTranslatedY(player.blockingAssignment.y);
      strokeWeight(1);
      stroke(100);
      line(x1, y1, x2, y2);
    }
  })
};

Formation.prototype.findSelectedOL = function(){
	var selectedOffensiveLineman = this.offensiveLinemen.filter(function(offensiveLineman) {
		return offensiveLineman.clicked === true;
	})[0];

	return selectedOffensiveLineman;
};

Formation.prototype.mouseInOL = function(field){
	var selectedOffensiveLineman = this.offensiveLinemen.filter(function(offensiveLineman) {
		return offensiveLineman.isMouseInside(field) === true;
	})[0];

	if (selectedOL) {
		selectedOffensiveLineman.select();
	}

	return selectedOffensiveLineman;
};

Formation.prototype.saveToDB = function(){
	var formationJSON = "";
	var cache = [];

	for(var i = 0; i < this.offensivePlayers.length; i++) {
		p = this.offensivePlayers[i];
		p.startX = p.x;
		p.startY = p.y;
	}

	for(var i = 0; i < this.defensivePlayers.length; i++) {
		p = this.defensivePlayers[i];
		p.startX = p.x;
		p.startY = p.y;
	}

	try {
		formationJSON = JSON.stringify(this, ['playName', 'unit', 'offensivePlayers', 'pos', 'startX', 'startY', 'playerIndex', 'id', 'offensiveFormationID', 'defensivePlayers', 'CBAssignment', 'gapXPoint', 'gapYPoint', 'zoneXPoint', 'zoneYPoint'])
		$.post( "teams/broncos/formations/new", {formation: formationJSON})
			.done(function() { /* use for debugging information */ })
			.fail(function() { /* use for debugging information */ });
	} catch(e) {
		console.log(e);
	}
};

var createFormationButtons = function(formationArray){
	var formationButtons = []
  var prevYCoord
  for(var i = 0; i < formationArray.length; i++){
    var xDist;
    var yDist;
    if(i < 4){
      xDist = i;
      yDist = 0;
    }
    else if (i % 4 == 0){
      xDist = 0;
      yDist++;
    }
    else {
      xDist = i % 4;
    }

    var tmpButton = new Button({
        x: 10 + (100 * xDist),
        y: 420 + (50 * yDist),
        width: 80,
        label: formationArray[i].playName,
        displayButton: true,
        clicked: false
    });
    prevYCoord = tmpButton.y;
    formationButtons.push(tmpButton);
  }
	return formationButtons
};

Formation.prototype.establishPersonnel = function(personnel, field){
  this.removeAllPlayers();
  if(personnel === "Base"){
    var de1 = new Player({
      x: 20,
      y: 76,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de1);

    var de2 = new Player({
      x: 33,
      y: 76,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de2);

    var dl1 = new Player({
      x: 24,
      y: 76,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl1);

    var dl2 = new Player({
      x: 28,
      y: 76,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl2);

    var will = new Player({
      x: 21,
      y: 79,
      num: "W",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "W"
    })
    this.createPlayer(will);

    var mike = new Player({
      x: 27,
      y: 80,
      num: "M",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "M"
    })
    this.createPlayer(mike);

    var sam = new Player({
      x: 32,
      y: 79,
      num: "S",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "S"
    })
    this.createPlayer(sam);

    var cb1 = new Player({
      x: 12,
      y: 76,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb1);

    var cb2 = new Player({
      x: 40,
      y: 77,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb2);

    var ss = new Player({
      x: 29,
      y: 85,
      num: "SS",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "SS"
    })
    this.createPlayer(ss);

    var fs = new Player({
      x: 20,
      y: 85,
      num: "FS",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "FS"
    })

    this.createPlayer(fs);

  }
  else if(personnel === "Nickel"){
    var de1 = new Player({
      x: 128,
      y: 197.33,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de1);

    var de2 = new Player({
      x: 264,
      y: 191.33,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de2);

    var dl1 = new Player({
      x: 176,
      y: 195.33,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl1);

    var dl2 = new Player({
      x: 219,
      y: 191,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl2);

    var mike1 = new Player({
      x: 176,
      y: 137,
      num: "M",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "M"
    })
    this.createPlayer(mike1);

    var mike2 = new Player({
      x: 264,
      y: 131,
      num: "M",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "M"
    })
    this.createPlayer(mike2);

    var cb1 = new Player({
      x: 342,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb1);

    var cb2 = new Player({
      x: 52,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb2);

    var cb3 = new Player({
      x: 292,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb3);

    var ss = new Player({
      x: 308,
      y: 63,
      num: "SS",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "SS"
    })
    this.createPlayer(ss);

    var fs = new Player({
      x: 147,
      y: 60,
      num: "FS",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "FS"
    })
    this.createPlayer(fs);


  }
  else if(personnel === "Jumbo"){
    var de1 = new Player({
      x: 128,
      y: 197.33,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de1);

    var de2 = new Player({
      x: 264,
      y: 191.33,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de2);

    var dl1 = new Player({
      x: 176,
      y: 195.33,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl1);

    var dl2 = new Player({
      x: 219,
      y: 191,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl2);

    var will = new Player({
      x: 136,
      y: 137,
      num: "W",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "W"
    })
    this.createPlayer(will);

    var mike1 = new Player({
      x: 204,
      y: 131,
      num: "M",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "M"
    })
    this.createPlayer(mike1);

    var mike2 = new Player({
      x: 244,
      y: 131,
      num: "M",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "M"
    })
    this.createPlayer(mike2);

    var sam = new Player({
      x: 271,
      y: 133,
      num: "S",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "S"
    })
    this.createPlayer(sam);

    var cb1 = new Player({
      x: 342,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb1);

    var cb2 = new Player({
      x: 52,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb2);

    var fs = new Player({
      x: 147,
      y: 60,
      num: "FS",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "FS"
    })

    this.createPlayer(fs);
  }
  else if(personnel === "Goal Line"){
    var de1 = new Player({
      x: 128,
      y: 197.33,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de1);

    var de2 = new Player({
      x: 264,
      y: 191.33,
      num: "DE",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DE"
    })
    this.createPlayer(de2);

    var dl1 = new Player({
      x: 176,
      y: 195.33,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl1);

    var dl2 = new Player({
      x: 219,
      y: 191,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl2);

    var dl3 = new Player({
      x: 239,
      y: 191,
      num: "DL",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "DL"
    })
    this.createPlayer(dl3);

    var will = new Player({
      x: 136,
      y: 137,
      num: "W",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "W"
    })
    this.createPlayer(will);

    var mike1 = new Player({
      x: 204,
      y: 131,
      num: "M",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "M"
    })
    this.createPlayer(mike1);

    var sam = new Player({
      x: 271,
      y: 133,
      num: "S",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "S"
    })
    this.createPlayer(sam);

    var cb1 = new Player({
      x: 342,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb1);

    var cb2 = new Player({
      x: 52,
      y: 175,
      num: "CB",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "CB"
    })
    this.createPlayer(cb2);

    var fs = new Player({
      x: 147,
      y: 60,
      num: "FS",
      fill: color(0, 0, 0),
      unit: "defense",
      change: true,
      pos: "FS"
    })

    this.createPlayer(fs);

  }
  this.establishingNewPlayer = null;
};

var isFormationClicked = function(formationButtonArray, field){
  var formationClicked;
  formationButtonArray.forEach(function(button){
    if (button.isMouseInside(field)){
      formationClicked = button;
    }
  })
  return formationClicked;
};

//Formatting differences with Nick's code. Will eventually merge
var createFormationFromJSONSeed = function(jsonFormation){
  var formation = new Formation({
    id: jsonFormation.id,
    name: jsonFormation.name,
    playName: jsonFormation.name,
    offensiveFormationID: jsonFormation.offensiveFormationID,
    teamID: jsonFormation.team,
    unit: jsonFormation.unit,
  });
  formation.positions = jsonFormation.positions;
  return formation;
};

var createFormationFromJSON = function(jsonFormation){
  var formation = new Formation({
    id: jsonFormation.pk,
    name: jsonFormation.fields.name,
    playName: jsonFormation.fields.name,
    offensiveFormationID: jsonFormation.fields.offensiveFormationID,
    teamID: jsonFormation.fields.team,
    unit: jsonFormation.fields.unit
  });
  return formation;
};

Formation.prototype.createDummyFormation = function(){
	var jsonString = "{\"name\":\"Green RT\",\"team\":\"1\",\"unit\":\"offense\",\"offensivePlayers\":[{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":21.665,\"startY\":65,\"x\":21.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":24.165,\"startY\":65,\"x\":24.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"C\",\"num\":\"C\",\"startX\":26.665,\"startY\":65,\"x\":26.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":29.165,\"startY\":65,\"x\":29.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":31.665,\"startY\":65,\"x\":31.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"QB\",\"num\":12,\"startX\":26.665,\"startY\":62.75,\"x\":26.665,\"y\":62.75,\"eligible\":true,\"red\":212,\"green\":130,\"blue\":130,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"Y\",\"num\":\"Y\",\"startX\":34.10227992957746,\"startY\":65,\"x\":34.10227992957746,\"y\":65,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"X\",\"num\":\"X\",\"startX\":11.848758802816901,\"startY\":65,\"x\":11.848758802816901,\"y\":65,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"Z\",\"num\":\"Z\",\"startX\":41.56706866197183,\"startY\":63.274647887323944,\"x\":41.56706866197183,\"y\":63.274647887323944,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"H\",\"num\":\"H\",\"startX\":26.77833626760563,\"startY\":57.21830985915493,\"x\":26.77833626760563,\"y\":57.21830985915493,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"F\",\"num\":\"F\",\"startX\":26.707913732394367,\"startY\":59.61267605633803,\"x\":26.707913732394367,\"y\":59.61267605633803,\"eligible\":true,\"red\":255,\"green\":0,\"blue\":0,\"siz\":2}],\"defensivePlayers\":[],\"quarterback\":[{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"QB\",\"num\":12,\"startX\":26.665,\"startY\":62.75,\"x\":26.665,\"y\":62.75,\"eligible\":true,\"red\":212,\"green\":130,\"blue\":130,\"siz\":2}],\"offensiveLinemen\":[{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":21.665,\"startY\":65,\"x\":21.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":24.165,\"startY\":65,\"x\":24.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"C\",\"num\":\"C\",\"startX\":26.665,\"startY\":65,\"x\":26.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"G\",\"num\":\"G\",\"startX\":29.165,\"startY\":65,\"x\":29.165,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2},{\"name\":\"\",\"unit\":\"offense\",\"pos\":\"T\",\"num\":\"T\",\"startX\":31.665,\"startY\":65,\"x\":31.665,\"y\":65,\"eligible\":false,\"red\":143,\"green\":29,\"blue\":29,\"siz\":2}],\"eligibleReceivers\":[]}"
	return createFormationFromJson(JSON.parse(jsonString))
}

Formation.prototype.positionsToPlayers = function(){
  var positionsAsPlayers = [];
  for(var j = 0; j < this.positions.length; j++){
    var position = this.positions[j];
    var player = createPlayerFromJSONSeed(position);
    positionsAsPlayers.push(player);
  }
  this.positions = positionsAsPlayers;
}

Formation.prototype.populatePositions = function(){
  if(this.unit === "defense"){
    this.positions.forEach(function(player){
      if(player.pos === "DL" || player.pos === "DE" || player.pos === "RE"){
        this.dline.push(player);
      }
      else if(player.pos === "W" || player.pos === "M" || player.pos === "S"){
        this.linebackers.push(player);
      }
      else if(player.pos === "CB"){
        this.cornerbacks.push(player);
      }
      else if(player.pos === "SS" || player.pos === "FS"){
        this.safeties.push(player);
      }
    }.bind(this))
    this.defensivePlayers = this.positions.slice();
    this.dline.sort(sortLeftToRight);
    this.linebackers.sort(sortLeftToRight);
    this.cornerbacks.sort(sortLeftToRight);
    this.safeties.sort(sortLeftToRight);
  }
  else{
    var offensiveLinemen = this.positions.filter(function(player) {
      return player.pos ==="OL" || player.pos ==="LT" || player.pos ==="LG" || player.pos ==="C" || player.pos ==="RG" || player.pos ==="RT";
    });
    offensiveLinemen.forEach(function(player){this.offensiveLinemen.push(player)}.bind(this));
    var quarterback = this.positions.filter(function(player) {return player.pos ==="QB"});
    this.quarterback = quarterback
    var receiverPositionOptions = ["X", "Y", "Z", "F", "A", "H"];
    var eligibleReceivers = this.positions.filter(function(player) {
      return receiverPositionOptions.indexOf(player.pos) >= 0;
    });
    this.eligibleReceivers = eligibleReceivers;
    this.offensivePlayers = this.positions;
  }

};

var sortLeftToRight = function(a, b){
  return a.x - b.x;
}

Formation.prototype.convertToPlayObject = function(){
  if(this.unit === "defense"){
    var play = new DefensivePlay({
      defensivePlayers: this.defensivePlayers,
      playName: this.playName,
      name: this.name,
      formation: this,
      positions: this.positions,
      cornerbacks: this.cornerbacks,
      safeties: this.safeties,
      dline: this.dline,
      linebacker: this.linebackers,
      id: this.id,
      offensiveFormationID: this.offensiveFormationID
    });

  }
  else {
    var play = new Play({
      eligibleReceivers: this.eligibleReceivers,
      offensivePlayers: this.offensivePlayers,
      defensivePlayers: this.defensivePlayers,
      playName: this.playName,
      name: this.name,
      qb: this.qb,
      oline: this.oline,
      formation: this,
      positions: this.positions,
      id: this.id
    });
  }
  return play
};
