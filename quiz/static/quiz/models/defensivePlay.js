var DefensivePlay = function(config) {
    this.defensivePlayers = config.defensivePlayers || [];
    this.playName = config.playName || "";
    this.formation = config.formation || null;
    this.dlAssignments = config.dlAssignments || [];
    this.lbAssignments = config.lbAssignments || [];
    this.dbAssignments = config.dbAssignments || [];
    this.dlPositions = config.dlPositions || [];
    this.dbPositions = config.dbPositions || [];
    this.lbPositions = config.lbPositions || [];
    this.dlNames = config.dlNames || [];
    this.bigPlayer = config.bigPlayer || null;

};

// Unit index is 0 for DL, 1 for LBs, 2 for safeties, 3 for DBs

DefensivePlay.prototype.draw = function(ballX, ballY, test){
  for(var i = 0; i < 4; i++){
      var dl = new Player ({
          x: ballX - 60 + 40 * i,
          y: ballY - 30,
          fill: color(0, 0, 0),
          pos: this.dlPositions[i],
          name: this.dlNames[i],
          unit: "defense",
          index: i,
          unitIndex: 0
      });
      if(test) dl.gap = this.dlAssignments[test.getCurrentPlayNumber()][i]
      this.defensivePlayers.push(dl);
  }

  for(var i = 0; i < 3; i++){
      var lb = new Player ({
          x: ballX - 80 + 75 * i,
          y: ballY - 75,
          fill: color(0, 0, 0),
          pos: this.lbPositions[i],
          unit: "defense",
          index: i,
          unitIndex: 1

      });
      if(test) lb.gap = this.lbAssignments[test.getCurrentPlayNumber()][i]
      this.defensivePlayers.push(lb);
  }

  for(var i = 0; i < 2; i++){
      var safety = new Player ({
          x: ballX - 100 + 200 * i,
          y: ballY - 125,
          fill: color(0, 0, 0),
          pos: this.dbPositions[i+1],
          unit: "defense",
          index: i,
          unitIndex: 2
      });
      if(test) safety.gap = this.dbAssignments[test.getCurrentPlayNumber()][i+1]
      this.defensivePlayers.push(safety);
  }

  for(var i = 0; i < 2; i++){
      var corner = new Player ({
          x: ballX - 135 + 270 * i,
          y: ballY - 35,
          fill: color(0, 0, 0),
          pos: this.dbPositions[i*3],
          unit: "defense",
          index: i,
          unitIndex: 3

      });
      if(test) corner.gap = this.dbAssignments[test.getCurrentPlayNumber()][i*3]
      this.defensivePlayers.push(corner);
  }

};

DefensivePlay.prototype.drawAllPlayers = function(){
  noStroke();
  for(var i = 0; i < this.defensivePlayers.length; i++){
      this.defensivePlayers[i].draw();
  }
};

DefensivePlay.prototype.clearSelections = function(){
    for(var i = 0; i < this.defensivePlayers.length; i++){
        var p = this.defensivePlayers[i];
        p.unselect();
    }
};

DefensivePlay.prototype.findSelectedDL = function(){
  var selectedDL = this.defensivePlayers.filter(function(dl) {
    return dl.clicked === true;
  })[0];
  return selectedDL;
};

DefensivePlay.prototype.mouseInDL = function(formation){
  var selectedWR = formation.findSelectedWR();
  if(!selectedWR || selectedWR.blocker){
    var selectedDL = this.defensivePlayers.filter(function(dl) {
      return dl.isMouseInside() === true;
    })[0];
    if (selectedDL) selectedDL.select();
  }
  return selectedDL;
};

DefensivePlay.prototype.playerBeingTested = function(){
  var playerBeingTested = this.defensivePlayers.filter(function(player){
    return player.isBeingTested === true;
  })[0];
  return playerBeingTested;
};
