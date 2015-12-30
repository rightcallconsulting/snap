var Formation = function(config){
  this.eligibleReceivers = config.eligibleReceivers || [];
  this.offensivePlayers = config.offensivePlayers || [];
  this.name = config.name || "";
  this.playName = config.playName || "";
  this.qb = config.qb || [];
  this.oline = config.oline || [];
  this.changeablePlayers = config.changeablePlayers || [];
  this.optionsToCreate = config.optionsToCreate || [];
  this.feedbackMessage = "";
};

Formation.prototype.createOLineAndQB = function(siz, distance){
  if(distance){
    var xdist = distance;
  } else {
    xdist = 28;
  }
  for (var i = -2; i < 3; i++) {
      var xPos = 200 + i*xdist;
      var yPos;
      if (i === 0) {
          yPos = 220;
      } else {
          yPos = 225;
      }
      var tmp = new Player({
          x: xPos,
          y: yPos,
          num: 70+i,
          // fill: color(143, 29, 29)
          red: 143,
          blue: 29,
          green: 29,
          pos: "OL"
      });
      if(siz){tmp.siz = siz}
      this.oline.push(tmp);
      this.offensivePlayers.push(tmp);
  }
  currentPlayer = this.oline[3];
  var tmp = new Player ({
      x: this.oline[2].x,
      y: this.oline[2].y + xdist,
      num: 12,
      fill: color(212, 130, 130),
      red: 212,
      blue: 130,
      green: 130,
      pos: "QB"
  });
  if(siz){tmp.siz = siz}
  this.qb.push(tmp);
  this.offensivePlayers.push(tmp);
};

Formation.prototype.createSkillPlayers = function(){
	var rb1 = new Player ({
      x: this.qb[0].x,
      y: this.qb[0].y + 60,
      num: 22,
      fill: color(255, 0, 0),
      progressionRank: 3,
      routeNum: 2
  });

  var te1 = new Player ({
      x: this.oline[0].x - 30,
      y: this.oline[0].y,
      num: 80,
      fill: color(255, 0, 0),
      progressionRank: 2,
      routeNum: 3
  });
  var te2 = new Player({
     x: this.oline[4].x + 40,
     y: this.oline[4].y + 30,
     num: 17,
     fill: color(255, 0, 0),
     progressionRank: 4,
     routeNum: 4
  });
  var wr1 = new Player({
     x: this.oline[0].x - 80,
     y: this.oline[4].y + 30,
     num: 88,
     fill: color(255, 0, 0),
     progressionRank: 1,
     routeNum: 0
  });
  var wr2 = new Player({
     x: this.oline[4].x + 80,
     y: this.oline[4].y,
     num: 84,
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

Formation.prototype.drawOLQB = function(){
  this.oline.forEach(function(ol){
    ol.draw();
  })
  this.qb.forEach(function(qb){
    qb.draw();
  })
};

Formation.prototype.drawAllPlayers = function(){
  this.offensivePlayers.forEach(function(player){
    player.draw();
  })
  this.changeablePlayers.forEach(function(player){
    player.draw();
  })

};

Formation.prototype.drawOptionsToCreate = function() {
  this.optionsToCreate.forEach(function(player){
    player.draw();
  })
};

Formation.prototype.findSelectedWR = function(){
  var selectedWR = this.eligibleReceivers.filter(function(wr) {
    return wr.clicked === true;
  })[0];
  return selectedWR;
};

Formation.prototype.removeAllPlayers = function(){
  this.eligibleReceivers.forEach(function(player){
      index = this.offensivePlayers.indexOf(player);
      this.offensivePlayers.splice(index, 1);
  }.bind(this))
  this.eligibleReceivers = [];
  this.changeablePlayers = [this.qb[0]];
};

Formation.prototype.createPlayer = function(player){
  if (this.offensivePlayers.length < 11){
    this.offensivePlayers.push(player);
    this.eligibleReceivers.push(player);
    this.changeablePlayers.push(player);
    this.establishingNewPlayer = player;
  }
};

Formation.prototype.mouseInReceiverOrNode = function(){
  for(var i = 0; i < this.eligibleReceivers.length; i++){
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

Formation.prototype.mouseInOptionsToCreate = function() {
  for(var i = 0; i < this.optionsToCreate.length; i++){
    var p = this.optionsToCreate[i];
    if (p.isMouseInside()){
      var optionClicked = p;
    }
  }
  return optionClicked;
};

Formation.prototype.validPlay = function(){
  return this.offensivePlayers.length === 11;
}

Formation.prototype.deletePlayer = function(player){
  index = this.eligibleReceivers.indexOf(player);
  this.eligibleReceivers.splice(index, 1);
  index = this.changeablePlayers.indexOf(player);
  this.changeablePlayers.splice(index, 1);
  index = this.offensivePlayers.indexOf(player);
  this.offensivePlayers.splice(index, 1);
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

Formation.prototype.drawBlockingAssignments = function(){
  this.offensivePlayers.forEach(function(player){
    if(player.blockingAssignment){
      strokeWeight(1);
      stroke(100);
      line(player.x,player.y, player.blockingAssignment.x, player.blockingAssignment.y);
    }
  })
};

Formation.prototype.findSelectedOL = function(){
  var selectedOL = this.oline.filter(function(ol) {
    return ol.clicked === true;
  })[0];
  return selectedOL;
};

Formation.prototype.mouseInOL = function(){
  var selectedOL = this.oline.filter(function(ol) {
    return ol.isMouseInside() === true;
  })[0];
  if (selectedOL) selectedOL.select();
  return selectedOL;
};

Formation.prototype.saveToDB = function(){
  $.post( "teams/broncos/formations/new", { formation: JSON.stringify(this)});
};

var createFormationButtons = function(formationArray){
  for(var i = 0; i < formationArray.length; i++){
    var tmpButton = new Button({
        x: 10 + (100 * i),
        y: 420,
        width: 80,
        label: formationArray[i].playName,
        displayButton: true,
        clicked: false
    });
    formationButtons.push(tmpButton);
  }
};

var isFormationClicked = function(formationButtonArray){
  var formationClicked;
  formationButtonArray.forEach(function(button){
    if (button.isMouseInside()){
      formationClicked = button;
    }
  })
  return formationClicked;
};

var formationButtons = [];
var formations = [];