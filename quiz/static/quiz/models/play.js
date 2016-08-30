//***************************************************************************//
//																			 //
// play.js - Right Call Consulting. All Rights Reserved. 2016		     	 //
//																			 //
//***************************************************************************//
//																			 //
// A play object represents one offensive or defensive play. Each instance   //
// of a play object is associated with one offensive formation and one       //
// defensive formation. The object maintains an array of all of the players  //
// in the concept and their positions on the field.				 			 //
//																			 //
//***************************************************************************//

var Play = function(config) {
	this.name = config.name || "";
	this.unit = config.unit || "offense";
	this.formation = config.formation || null;
	this.offensivePlayers = config.offensivePlayers || [];
	this.defensivePlayers = config.defensivePlayers || [];
	this.quarterback = config.quarterback || [];
	this.eligibleReceivers = config.eligibleReceivers || [];
	this.offensiveLinemen = config.offensiveLinemen || [];


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

// deepCopy returns a new Concept object that is exactly the same as this.
Concept.prototype.deepCopy = function() {
	var result = new Concept({
		id: this.id,
		name: this.name,
		team: this.team,
		unit: this.unit,
		feedbackMessage: this.feedbackMessage
	});

	if (this.quarterback != null) {
		result.quarterback = this.quarterback.deepCopy();
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
		for (var j = 0; j < conceptJsonDictionary.offensivePlayers[i].blockingAssignmentArray.length ; ++j) {
			var primaryAssignment = conceptJsonDictionary.offensivePlayers[i].blockingAssignmentArray[j];

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
