var Play = function(config) {
    this.eligibleReceivers = config.eligibleReceivers || [];
    this.offensivePlayers = config.offensivePlayers || [];
    this.playName = config.playName || "";
    this.name = config.name || "";
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
      this.offensivePlayers[i].drawBreakPoints(field);
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
    this.test.advanceToNextPlay("You got it, dude", this.test.pk);
  }else{
    this.test.scoreboard.feedbackMessage = "Wrong Answer";
    this.test.incorrectGuesses++;
  }
  $.post( "/quiz/players/"+this.test.playerID+"/tests/"+this.test.id+"/update", {
    test: JSON.stringify(_.omit(this.test,'plays','defensivePlays', 'defensiveFormations', 'offensiveFormations')),
    play_id: this.id
  })
  this.test.newTest = false;
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
    if (p.isMouseInside(field)){
      var receiverClicked = true;
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
  $.post( "teams/broncos/plays/new", { play: JSON.stringify(this)});
};

Play.prototype.populatePositions = function(){
  var oline = this.positions.filter(function(player) {
    return player.pos ==="OL" || player.pos ==="LT" || player.pos ==="LG" || player.pos ==="C" || player.pos ==="RG" || player.pos ==="RT";
  });
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
