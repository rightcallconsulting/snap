var Formation = function(config){
  this.eligibleReceivers = config.eligibleReceivers || [];
  this.offensivePlayers = config.offensivePlayers || [];
  this.wideReceivers = config.wideReceivers || [];
  this.runningBacks = config.runningBacks || [];
  this.tightEnds = config.tightEnds || [];
  this.name = config.name || "";
  this.playName = config.playName || "";
  this.qb = config.qb || [];
  this.oline = config.oline || [];
  this.changeablePlayers = config.changeablePlayers || [];
  this.optionsToCreate = config.optionsToCreate || [];
  this.feedbackMessage = "";
  this.id = config.id || null;
  this.updated_at = config.updated_at || null;
  this.created_at = config.created_at || null;
  this.positions = config.positions || [];
  this.unit = config.unit || "offense";
  this.dline = config.dline || [];
  this.linebackers = config.linebackers || [];
  this.cornerbacks = config.cornerbacks || [];
  this.safeties = config.safeties || [];
  this.defensivePlayers = config.defensivePlayers || [];
  this.offensiveFormationID = config.offensiveFormationID || 0;
};

//POSITIVE = STRONG RIGHT, NEGATIVE = STRONG LEFT, 0 = EVEN
Formation.prototype.getPassStrength = function(){
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

Formation.prototype.createOLineAndQB = function(ballY){
  var olPositions = ["LT", "LG", "C", "RG", "RT"];
  for (var i = -2; i < 3; i++) {
      var xPos = Field.WIDTH / 2 + i*3.5;
      var yPos = ballY-1.5;
      if (i !== 0) {
          yPos -= 0.5;
      }
      var tmp = new Player({
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
      this.oline.push(tmp);
      this.offensivePlayers.push(tmp);
  }
  currentPlayer = this.oline[3];
  var tmp = new Player ({
      x: this.oline[2].x,
      y: this.oline[2].y-3.5,
      num: 12,
      fill: color(212, 130, 130),
      red: 212,
      blue: 130,
      green: 130,
      pos: "QB"
  });
  this.qb.push(tmp);
  this.offensivePlayers.push(tmp);
};

Formation.prototype.createSkillPlayers = function(){
	var rb1 = new Player ({
      x: this.qb[0].x,
      y: this.qb[0].y + 60,
      num: 22,
      pos: "RB",
      fill: color(255, 0, 0),
      progressionRank: 3,
      routeNum: 2
  });

  var te1 = new Player ({
      x: this.oline[0].x - 30,
      y: this.oline[0].y,
      num: 80,
      pos: "TE",
      fill: color(255, 0, 0),
      progressionRank: 2,
      routeNum: 3
  });
  var te2 = new Player({
     x: this.oline[4].x + 40,
     y: this.oline[4].y + 30,
     num: 17,
     pos: "TE",
     fill: color(255, 0, 0),
     progressionRank: 4,
     routeNum: 4
  });
  var wr1 = new Player({
     x: this.oline[0].x - 80,
     y: this.oline[4].y + 30,
     num: 88,
     pos: "WR",
     fill: color(255, 0, 0),
     progressionRank: 1,
     routeNum: 0
  });
  var wr2 = new Player({
     x: this.oline[4].x + 80,
     y: this.oline[4].y,
     num: 84,
     pos: "WR",
     fill: color(255, 0, 0),
     progressionRank: 5,
     routeNum: 1
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

//pos is a str for now, but could be an int code later
Formation.prototype.getPlayerFromPosition = function(pos){
  var players = this.offensivePlayers.filter(function(player) {return player.pos === pos});
  if(players.length === 0){
    return null;
  }
  return players[0];
};

Formation.prototype.establishZoneHotSpots = function(){
  var centerYardX = this.getPlayerFromPosition("C").startX;
  var centerYardY = this.getPlayerFromPosition("C").startY;

};

Formation.prototype.drawOLQB = function(){
  this.oline.forEach(function(ol){
    ol.draw();
  })
  this.qb.forEach(function(qb){
    qb.draw();
  })
};

Formation.prototype.drawAllPlayers = function(field){
  this.offensivePlayers.forEach(function(player){
    player.draw(field);
  })
  this.changeablePlayers.forEach(function(player){
    player.draw(field);
  })
  if(this.unit === "defense"){
    this.defensivePlayers.forEach(function(player){
      player.draw(field);
    })
  }

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
    this.changeablePlayers = [this.qb[0]];
  }
};

Formation.prototype.createPlayer = function(player){
  if(player.unit === "defense"){
    if (this.defensivePlayers.length < 11){
      this.defensivePlayers.push(player);
      this.changeablePlayers.push(player);
      this.establishingNewPlayer = player;
      if(player.pos === "DL" || player.pos === "DE"){
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
    }
  }
  else{
    if (this.offensivePlayers.length < 11){
      this.offensivePlayers.push(player);
      this.eligibleReceivers.push(player);
      this.changeablePlayers.push(player);
      this.establishingNewPlayer = player;
      if(player.pos === "WR"){
        this.wideReceivers.push(player);
        player.playerIndex = this.wideReceivers.length;
      }
      else if(player.pos === "TE"){
        this.tightEnds.push(player);
        player.playerIndex = this.tightEnds.length;
      }
      else if(player.pos === "RB"){
        this.runningBacks.push(player);
        player.playerIndex = this.runningBacks.length;
      }
    }
  }
};

Formation.prototype.mouseInReceiverOrNode = function(field){
  var receiverClicked = null; var selectedNode = null;
  for(var i = 0; i < this.eligibleReceivers.length; i++){
    var p = this.eligibleReceivers[i];
    if (p.isMouseInside(field)){
      receiverClicked = p;
    }
    for(var j = 0; j < p.routeNodes.length; j++){
      var n = p.routeNodes[j];
      if (n.isMouseInside(field)){
        selectedNode = n;
      }
    }
    for(var k = 0; k < p.runNodes.length; k++){
      var n = p.runNodes[k];
      if (n.isMouseInside(field)){
        selectedNode = n;
      }
    }
  }
  return [receiverClicked, selectedNode];
};

Formation.prototype.mouseInQB = function(){
  for(var i = 0; i < this.qb.length; i++){
    var p = this.eligibleReceivers[i];
    if (p.isMouseInside()){
      var receiverClicked = p;
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

Formation.prototype.mouseInDefensivePlayer = function(field){
  for(var i = 0; i < this.defensivePlayers.length; i++){
    var p = this.defensivePlayers[i];
    if (p.isMouseInside(field)){
      var defensivePlayer = p;
    }

  }
  return defensivePlayer
};

Formation.prototype.mouseInOptionsToCreate = function(field) {
  var optionClicked = null;
  for(var i = 0; i < this.optionsToCreate.length; i++){
    var p = this.optionsToCreate[i];
    if (p.isMouseInside(field)){
      optionClicked = p;
    }
  }
  return optionClicked;
};

Formation.prototype.validFormation = function(){
  if(this.unit === "defense"){
    return this.defensivePlayers.length === 11;
  }
  else{
    if(this.offensivePlayers.length !== 11){
      return false;
    }
    var ballY = this.oline[2].startY;
    var playersOnLine = 0;
    for(var i = 0; i < this.offensivePlayers.length; i++){
      var py = this.offensivePlayers[i].startY;
      if(py <= ballY && py >= ballY - 1){
        playersOnLine++;
      }
    }
    if(playersOnLine !== 7){
      return false;
    }
    return true;
  }
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
  for(var i = 0; i < this.oline.length; i++){
    this.oline[i].blockingAssignment = null;
    this.oline[i].unselect();
  }
};

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
  var selectedOL = this.oline.filter(function(ol) {
    return ol.clicked === true;
  })[0];
  return selectedOL;
};

Formation.prototype.mouseInOL = function(field){
  var selectedOL = this.oline.filter(function(ol) {
    return ol.isMouseInside(field) === true;
  })[0];
  if (selectedOL) selectedOL.select();
  return selectedOL;
};

Formation.prototype.populatePositions = function(){
  var oline = this.positions.filter(function(player) {
    return player.pos ==="OL" || player.pos ==="LT" || player.pos ==="LG" || player.pos ==="C" || player.pos ==="RG" || player.pos ==="RT";
  });
  oline.forEach(function(player){this.oline.push(player)}.bind(this));
  var qb = this.positions.filter(function(player) {return player.pos ==="QB"});
  this.qb = qb
  var eligibleReceivers = this.positions.filter(function(player) {
    return player.pos ==="WR" || player.pos ==="RB" || player.pos==="TE";
  });
  this.wideReceivers = this.positions.filter(function(player) {return player.pos ==="WR"});
  this.runningBacks = this.positions.filter(function(player) {return player.pos ==="RB"});
  this.tightEnds = this.positions.filter(function(player) {return player.pos ==="TE"});
  this.eligibleReceivers = eligibleReceivers;
  this.offensivePlayers = this.positions;
};

Formation.prototype.saveToDB = function(){
  $.post( "teams/broncos/formations/new", { formation: JSON.stringify(this)});
};

var createFormationButtons = function(formationArray){
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


Formation.prototype.populatePositions = function(){
  if(this.unit === "defense"){
    this.positions.forEach(function(player){
      if(player.pos === "DL" || player.pos === "DE"){
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
    this.defensivePlayers = this.positions;
  }
  else{
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
  }

};

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



var formationButtons = [];
var formations = [];
