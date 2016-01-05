var Play = function(config) {
    this.eligibleReceivers = config.eligibleReceivers || [];
    this.offensivePlayers = config.offensivePlayers || [];
    this.playName = config.playName || "";
    this.name = config.name || "";
    this.qb = config.qb || null;
    this.oline = config.oline || [];
    this.formation = config.formation || null;
    this.test = config.test || null;
    this.inProgress = false;
    this.newPlay = config.newPlay || false;
    this.bigPlayer = config.bigPlayer || null;
    this.id = config.id || null;
    this.teamID = config.teamID || null;
    this.formation = config.formation || null;
    this.positions = config.positions || [];
    this.positionIDs = config.positionIDs || [];
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
};

Play.prototype.setAllRoutes = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    this.eligibleReceivers[i].setRoute(this.eligibleReceivers[i].routeNum, this.formation.oline[2]);
  }
};

Play.prototype.drawAllPlayers = function(){
  for(var i = 0; i < this.offensivePlayers.length; i++){
      this.offensivePlayers[i].draw();
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
    this.test.advanceToNextPlay("You got it, dude", this.test.pk);
  }else{
    this.test.scoreboard.feedbackMessage = "Wrong Answer";
    this.test.incorrectGuesses++;
  }
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

Play.prototype.mouseInReceiverOrNode = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    if (p.isMouseInside()){
      var receiverClicked = true;
    }
    for(var j = 0; j < p.routeNodes.length; j++){
      var n = p.routeNodes[j];
      if (n.isMouseInside()){
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
  $.post( "teams/broncos/plays/new", { play: JSON.stringify(this)});
};

Play.prototype.populatePositions = function(){
  var oline = this.positions.filter(function(player) {return player.pos ==="OL"});
  oline.forEach(function(player){this.oline.push(player)}.bind(this));
  var qb = this.positions.filter(function(player) {return player.pos ==="QB"});
  this.qb = qb
  var eligibleReceivers = this.positions.filter(function(player) {
    return player.pos ==="WR" || player.pos ==="RB" || player.pos==="TE";
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
