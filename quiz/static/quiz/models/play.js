
//***************************************************************************//
//																			 //
// play.js - Right Call Consulting. All Rights Reserved. 2016		     	 //
//																			 //
//***************************************************************************//
//																			 //
// A play object represents one offensive or defensive play. Each instance   //
// of a play object is associated with one offensive formation and one       //
// defensive formation. The object maintains an array of all of the players  //
// in the play and their positions on the field.				 			 //
//																			 //
//***************************************************************************//

var Play = function(config) {
	this.name = config.name || "";
	this.unit = config.unit || "offense";
	this.formation = config.formation || "";
	this.offensivePlayers = config.offensivePlayers || [];
	this.defensivePlayers = config.defensivePlayers || [];
	this.quarterback = config.quarterback || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.offensiveLinemen = config.offensiveLinemen || [];
	this.feedbackMessage = config.feedbackMessage || "";

    this.playName = config.playName || "";
    this.qb = config.qb || null;
    this.oline = config.oline || [];
    this.formation = config.formation || null;
    this.checks = config.checks || [];
    this.test = config.test || null;
    this.inProgress = false;
    this.newPlay = config.newPlay || false;
    this.bigPlayer = config.bigPlayer || null;
    this.id = config.id || null;
    this.teamID = config.teamID || null;
    this.positions = config.positions || [];
    this.positionIDs = config.positionIDs || [];
    this.runPlay = config.runPlay || null;
    this.updated_at = config.updated_at || null;
    this.created_at = config.created_at || null;
    this.defensiveFormationID = config.defensiveFormationID || 0;
    this.defensivePlayObject = config.defensivePlayObject || null;
};

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
	var numberOfOffensivePlayers = this.offensivePlayers.length;
	var numberOfDefensivePlayers = this.defensivePlayers.length;

	for(var i = 0; i < numberOfOffensivePlayers; i++) {
		this.offensivePlayers[i].drawBlocks(field);
		this.offensivePlayers[i].drawRoute(field);
	}

	for(var i = 0; i < numberOfDefensivePlayers; i++) {
		this.defensivePlayers[i].drawDefensiveMovement(field);
	}
};


// isValid checks the legality of a play.
Play.prototype.isValid = function() {
	// TODO: Implement
	//
	// IDEAS: More players in a play than can be in a play.
	//		  Inelligable setups. Illegal actions.

	if (this.offensivePlayers.length != 11) {
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

		playJson = JSON.stringify(this, ["name", "team", "unit", "formation", "offensivePlayers", "defensivePlayers", "quarterback", "offensiveLinemen", "eligibleReceivers", "pos", "num", "startX", "startY", "x", "y", "unit", "eligible", "red", "green", "blue", "siz", "blockingAssignmentArray", "defensiveMovement", "route"]);
		var playName = this.name;
		var playUnit = this.unit;
		var formationName = this.formation;

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, save: true, delete: false, name: playName, unit: playUnit, formation: formationName, play: playJson}
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
	var formationName = this.formation;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: false, delete: true, name: playName, formation: formationName}
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
		team: this.team,
		unit: this.unit,
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

// fromFormation takes a formation object as an argument and creates a play
// with the same players in the formation.
Play.prototype.fromFormation = function(formation) {
	this.unit = formation.unit;
	this.formation = formation.name;

	for (var i = 0; i < formation.quarterback.length; ++i) {
		this.quarterback.push(formation.quarterback[i].deepCopy());
	}

	for (var i = 0; i < formation.offensivePlayers.length; ++i) {
		this.offensivePlayers.push(formation.offensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < formation.defensivePlayers.length; ++i) {
		this.defensivePlayers.push(formation.defensivePlayers[i].deepCopy());
	}

	for (var i = 0; i < formation.offensiveLinemen.length; ++i) {
		this.offensiveLinemen.push(formation.offensiveLinemen[i].deepCopy());
	}

	for (var i = 0; i < formation.eligibleReceivers.length; ++i) {
		this.eligibleReceivers.push(formation.eligibleReceivers[i].deepCopy());
	}
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

	if (playJsonDictionary.offensiveLinemen != null) {
		for (var i = 0; i < playJsonDictionary.offensiveLinemen.length; ++i) {
			var player = new Player({
				x: playJsonDictionary.offensiveLinemen[i].x,
				y: playJsonDictionary.offensiveLinemen[i].y,
				startX: playJsonDictionary.offensiveLinemen[i].startX,
				startY: playJsonDictionary.offensiveLinemen[i].startY,
				num: playJsonDictionary.offensiveLinemen[i].num,
				pos: playJsonDictionary.offensiveLinemen[i].pos,
				red: playJsonDictionary.offensiveLinemen[i].red,
				green: playJsonDictionary.offensiveLinemen[i].green,
				blue: playJsonDictionary.offensiveLinemen[i].blue,
				unit: playJsonDictionary.offensiveLinemen[i].unit,
				eligible: playJsonDictionary.offensiveLinemen[i].eligible,
				siz: playJsonDictionary.offensiveLinemen[i].siz
			});

			offensiveLinemenArray.push(player);
		}
	}

	for (var i = 0; i < offensivePlayersArray.length; ++i) {
		for (var j = 0; j < playJsonDictionary.offensivePlayers[i].blockingAssignmentArray.length ; ++j) {
			var primaryAssignment = playJsonDictionary.offensivePlayers[i].blockingAssignmentArray[j];

			if (primaryAssignment.x != null) {
				for (var k = 0; k < defensivePlayersArray.length; ++k) {
					if (primaryAssignment.x === defensivePlayersArray[k].x && primaryAssignment.y === defensivePlayersArray[k].y) {
						primaryAssignment = defensivePlayersArray[k];
					}
				}
			}

			offensivePlayersArray[i].blockingAssignmentArray.push(primaryAssignment);
		}
	}

	var result = new Play({
		name: playJsonDictionary.name,
		team: playJsonDictionary.team,
		unit: playJsonDictionary.unit,
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

Play.prototype.getPlayerFromPosition = function(pos){
  var players = this.offensivePlayers.filter(function(player) {return player.pos === pos});
  if(players.length === 0){
    return null;
  }
  return players[0];
};

//POSITIVE = STRONG RIGHT, NEGATIVE = STRONG LEFT, 0 = EVEN
Play.prototype.getPassStrength = function(){
  var centerX = this.oline[2].x;
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

Play.prototype.isValidPlay = function(){
  if(!this.formation.isValidPlay()){
    return false;
  }
  return true;
};


Play.prototype.resetPlayers = function(defensivePlay){
  for(var i = 0; i < this.offensivePlayers.length; i++){
      this.offensivePlayers[i].resetToStart();
      this.offensivePlayers[i].showRoute = false;
      this.offensivePlayers[i].showPreviousRoute = false;
      this.offensivePlayers[i].showPreviousRouteGuess = false;
  }
  for(var i = 0; i < defensivePlay.defensivePlayers.length; i++){
      defensivePlay.defensivePlayers[i].resetToStart();
  }
  if(this.runPlay !== null){
    this.runPlay.hasExchanged = false;
  }
};

Play.getCurrentBlockingAssignment = function(){

};

Play.prototype.setAllRoutes = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    this.eligibleReceivers[i].setRoute(this.eligibleReceivers[i].routeNum, this.oline[2]);
  }
};

Play.prototype.drawAllPlayers = function(field){
  for(var i = 0; i < this.offensivePlayers.length; i++){
      this.offensivePlayers[i].draw(field);
  }
};

Play.prototype.drawAllRoutes = function(field){
  for(var i = 0; i < this.offensivePlayers.length; i++){
      this.offensivePlayers[i].drawRoute(field);
  }
};

Play.prototype.drawRunAssignments = function(field){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    var player = this.offensivePlayers[i];
    if(player.runAssignment){
        player.runAssignment.draw(player, field);
    }
  }
};

Play.prototype.drawRunPlay = function(field){
  if(this.runPlay){
    this.runPlay.draw(field);
  }
};

Play.prototype.clearProgression = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
      var p = this.eligibleReceivers[i];
      if(p.rank > 0){
          p.unselect();
      }
      p.showRoute = false;
  }
};

Play.prototype.checkProgression = function(){
  var isCorrect = true;
  this.eligibleReceivers.forEach(function(player){
    if(player.rank !== player.progressionRank){
      isCorrect = false;
    }
  })
  if (isCorrect){
    this.test.score++;
    this.test.advanceToNextPlay(this.test.correctAnswerMessage, this.test.pk);
  }else{
    this.test.scoreboard.feedbackMessage = "Wrong Answer";
    this.test.incorrectGuesses++;
  }
  $.post( "/quiz/players/"+this.test.playerID+"/tests/"+this.test.id+"/update", {
    test: JSON.stringify(_.omit(this.test,'plays','defensivePlays', 'defensiveFormations', 'offensiveFormations')),
    play_id: this.id
  })
  this.test.newTest = false;
  return isCorrect;
};

Play.prototype.clearRouteDrawings = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    p.routeCoordinates = [[p.startX, p.startY]];
    p.routeNodes = [];
    p.showPreviousRoute = false;
    p.showPreviousRouteGuess = false;
  }
};

Play.prototype.clearPreviousRouteDisplays = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    p.showPreviousRoute = false;
    p.showPreviousRouteGuess = false;
  }
};

Play.prototype.findSelectedWR = function(){
  var selectedWR = this.eligibleReceivers.filter(function(wr) {
    return wr.clicked === true;
  })[0];
  return selectedWR;
};

Play.prototype.clearSelectedReceivers = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    this.eligibleReceivers[i].clicked = false;
  }
};

Play.prototype.mouseInReceiverOrNode = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    if (p.isMouseInside(field)){
      var receiverClicked = p;
    }
    for(var j = 0; j < p.routeNodes.length; j++){
      var n = p.routeNodes[j];
      if (n.isMouseInside(field)){
        var selectedNode = n;
      }
    }
  }
  return [receiverClicked, selectedNode];
};

Play.prototype.playerBeingTested = function(){
  var playerBeingTested = this.offensivePlayers.filter(function(player){
    return player.isBeingTested === true;
  })[0];
  return playerBeingTested;
};

Play.prototype.clearSelection = function(test, play) {
  if (test.showBigPlayers) {
    if (this.bigPlayer !== null && this.bigPlayer.clicked) {
      this.bigPlayer.unselect();
    } else if (this.bigDefender !== null && this.bigDefender.clicked) {
      this.bigDefender.unselect();
    }
  } else {
    for (var i = 0; i < play.defensivePlayers.length; i++) {
      var p = play.defensivePlayers[i];
      if (p.clicked) {
        p.unselect();
      }
    }
    for (var i = 0; i < this.offensivePlayers.length; i++) {
      var p = this.offensivePlayers[i];
      if (p.clicked) {
        p.unselect();
      }
    }
  }
};

Play.prototype.saveToDB = function(){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    var assignment = this.offensivePlayers[i].blockingAssignmentObject;
    if(assignment){
      //assignment.convertBlockedPlayersToIDs();
      this.offensivePlayers[i].blockingCoordinates = assignment.convertToCoordinates();
    }
  }
  var playJSON = JSON.stringify(this, ['name', 'formation', 'id', 'unit', 'offensivePlayers', 'pos', 'startX', 'startY', 'playerIndex', 'blocker', 'runner', 'progressionRank', 'blockingAssignmentUnitIndex', 'blockingAssignmentPlayerIndex', 'blockingAssignmentObject', 'blockedPlayerIDs', 'blockedZone', 'type', 'routeCoordinates', 'blockingCoordinates', 'runAssignment', 'routeToExchange', 'routeAfterExchange', 'defensiveFormationID'])
  $.post( "teams/broncos/plays/new", { play: playJSON});
};

Play.prototype.populatePositions = function(){
  var oline = this.positions.filter(function(player) {
    return player.pos ==="OL" || player.pos ==="LT" || player.pos ==="LG" || player.pos ==="C" || player.pos ==="RG" || player.pos ==="RT";
  });
  oline.forEach(function(player){this.oline.push(player)}.bind(this));
  var qb = this.positions.filter(function(player) {return player.pos ==="QB"});
  this.qb = qb
  var receiverPositions = ["A", "B", "F", "X", "Y", "Z", "H"]
  var eligibleReceivers = this.positions.filter(function(player) {
    return receiverPositions.indexOf(player.pos) >= 0;
  });
  this.eligibleReceivers = eligibleReceivers;
  this.offensivePlayers = this.positions;
};

Play.prototype.addPositionsFromID = function(positionArray){
  positionArray.forEach(function(position){
    if(this.positionIDs.includes(position.id)){
      this.positions.push(position);
    }
  }.bind(this))
}


var createPlayFromJSONSeed = function(jsonPlay){
  var play = new Play({});
  play.id = jsonPlay.pk;
  play.playName = jsonPlay.name;
  play.name = jsonPlay.name;
  play.positions = jsonPlay.positions;
  play.teamID = jsonPlay.team;
  play.formation = jsonPlay.formation;
  play.created_at = jsonPlay.created_at;
  play.updated_at = jsonPlay.updated_at;
  return play;
};

var createPlayFromJSON = function(jsonPlay){
  var play = new Play({});
  play.id = jsonPlay.pk;
  play.playName = jsonPlay.fields.name;
  play.name = jsonPlay.fields.name;
  play.teamID = jsonPlay.fields.team;
  play.formation = jsonPlay.fields.formation;
  play.positionIDs = jsonPlay.fields.positions;
  play.created_at = jsonPlay.fields.created_at;
  play.updated_at = jsonPlay.fields.updated_at;
  return play;
};

Play.prototype.drawBlockingAssignments = function(){
  this.offensivePlayers.forEach(function(player){
    if(player.blockingAssignment){
      strokeWeight(1);
      stroke(100);
      line(player.x,player.y, player.blockingAssignment.x, player.blockingAssignment.y);
    }
  })
};

Play.prototype.drawBlockingAssignmentObjects = function(){
  this.offensivePlayers.forEach(function(player){
    if(player.blockingAssignmentObject){
      player.blockingAssignmentObject.draw(player, field);
    }
  })
};

Play.prototype.updateBlockingAssignmentForDefense = function(defensivePlayers){
  this.offensivePlayers.forEach(function(player){
    if(player.blockingAssignmentObject && player.blockingCoordinates){
        player.blockingAssignmentObject.setForDefense(defensivePlayers, player.blockingCoordinates)
    }
  })
}
