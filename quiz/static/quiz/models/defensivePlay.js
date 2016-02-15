var DefensivePlay = function(config) {
  this.defensivePlayers = config.defensivePlayers || [];
  this.playName = config.playName || "";
  this.formation = config.formation || null;
  this.offensiveFormationID = config.offensiveFormationID || null;
  this.dlAssignments = config.dlAssignments || [];
  this.lbAssignments = config.lbAssignments || [];
  this.dbAssignments = config.dbAssignments || [];
  this.dlPositions = config.dlPositions || [];
  this.dbPositions = config.dbPositions || [];
  this.lbPositions = config.lbPositions || [];
  this.dlNames = config.dlNames || [];
  this.bigPlayer = config.bigPlayer || null;
  this.dline = config.dline || [];
  this.linebackers = config.linebackers || [];
  this.cornerbacks = config.cornerbacks || [];
  this.safeties = config.safeties || [];
  this.defensivePlayers = config.defensivePlayers || [];
  this.offensiveFormationID = config.offensiveFormationID || 0;
  this.positions = config.positions || [];
  this.id = config.id || null;
};

// Unit index is 0 for DL, 1 for LBs, 2 for safeties, 3 for DBs

DefensivePlay.prototype.draw = function(field, test){
  var ballX = Field.WIDTH / 2;
  var ballY = field.ballYardLine;
  for(var i = 0; i < 4; i++){
    var dl = new Player ({
      x: ballX - 7 + 5 * i,
      y: ballY + 1.5,
      siz: 2.5,
      fill: color(255),
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
      x: ballX - 9 + 9 * i,
      y: ballY + 6,
      siz: 2.5,
      fill: color(255),
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
      x: ballX - 7 + 14 * i,
      y: ballY + 12,
      siz: 2.5,
      fill: color(255),
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
      x: ballX - 15 + 30 * i,
      y: ballY + 3,
      siz: 2.5,
      fill: color(255),
      pos: this.dbPositions[i*3],
      unit: "defense",
      index: i,
      unitIndex: 3

    });
    if(test) corner.gap = this.dbAssignments[test.getCurrentPlayNumber()][i*3]
      this.defensivePlayers.push(corner);
  }

};

DefensivePlay.prototype.getPlayer = function(unitIndex, playerIndex){
  if(unitIndex === 0){
    if(this.dline.length > playerIndex){
      return this.dline[playerIndex];
    }
  }else if(unitIndex === 1){
    if(this.linebackers.length > playerIndex){
      return this.dline[playerIndex];
    }
  }else if(unitIndex === 2){
    if(this.cornerbacks.length > playerIndex){
      return this.cornerbacks[playerIndex];
    }
  }else if(unitIndex === 3){
    if(this.safeties.length > playerIndex){
      return this.safeties[playerIndex];
    }
  }
  return null;
}

DefensivePlay.prototype.drawAllPlayers = function(field){
  for(var i = 0; i < this.defensivePlayers.length; i++){
    this.defensivePlayers[i].draw(field);
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

DefensivePlay.prototype.mouseInDL = function(formation, field){
  var selectedWR = formation.findSelectedWR();
  var selectedDL = null;
  if(!selectedWR || selectedWR.blocker){
    selectedDL = this.defensivePlayers.filter(function(dl) {
      return dl.isMouseInside(field) === true;
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

var createDefensivePlayFromJSON = function(jsonPlay){
  var formation = new Formation({
    id: jsonPlay.pk,
    name: jsonPlay.fields.name,
    playName: jsonPlay.fields.name,
    offensiveFormationID: jsonPlay.fields.offensiveFormationID,
    teamID: jsonPlay.fields.team,
    unit: jsonPlay.fields.unit
  });
  return formation;
};
