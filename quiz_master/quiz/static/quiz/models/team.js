var Team = function(config){
  this.teamName = config.teamName || null;
  this.players = config.players || [];
  this.sortByTotalCorrect = config.sortByTotalCorrect || false;
  this.sortByTotalWrong = config.sortByTotalWrong || false;
  this.sortByTotalPercentage = config.sortByTotalPercentage || false;
};

Team.prototype.drawOverallSummary = function(xDist, yDist, sortButtons){
  this.drawSummaryHeader();
  textSize(12);
  this.sortPlayers();
  drawHeaders(xDist, yDist);
  this.players.forEach(function(player, index){
    player.displayAllResults(xDist, yDist+ 20*index, index);
    if (player === this.players[this.players.length - 1]){
      sortButtons.forEach(function(button, index2){
        button.x = xDist + 85*(index2);
        button.y = yDist + 20*(index+1);
        button.displayButton = true;
        button.draw();
      })
    }
  }.bind(this))
};

Team.prototype.drawPositionSummary = function(position, xDist, yDist, sortButtons){
  this.drawSummaryHeader();
  textSize(12);
  this.sortPlayers();
  drawHeaders(xDist, yDist);
  positionArray = this.players.filter(function(player) {
    return player.position === position;
  })
  positionArray.forEach(function(player, index){
    player.displayAllResults(xDist, yDist + 20*index, index);
    if (player === positionArray[positionArray.length - 1]){
      sortButtons.forEach(function(button, index2){
        button.x = xDist + 85*(index2);
        button.y = yDist + 20*(index+1);
        button.displayButton = true;
        button.draw();
      })
    }
  }.bind(this))

};

Team.prototype.sortPlayers = function(){
  if(this.sortByTotalCorrect){
    this.players.sort(function(a,b){
      return b.totalCorrect - a.totalCorrect;
    })
  } else if(this.sortByTotalWrong){
    this.players.sort(function(a,b){
      return b.totalWrong - a.totalWrong;
    })
  } else if(this.sortByTotalPercentage){
    this.players.sort(function(a,b){
      return b.totalPercentage - a.totalPercentage;
    })
  }
};

Team.prototype.drawAssignQuiz = function(xDist, yDist){
  this.drawSummaryHeader();
  text("Players", xDist, yDist - 15)
  this.players.forEach(function(player, index){
    player.drawPlayerButton(xDist, yDist + 40*index, index);
  })
};

Team.prototype.drawSummaryHeader = function() {
    fill(0, 0, 0);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(this.teamName, 200, 20);
    fill(255,255,255)
    textAlign(LEFT, LEFT);
};

var drawHeaders = function(xDist, yDist){
  strokeWeight(3);
  stroke(0,0,0)
  text("Player", xDist, yDist - 20);
  text("Right", xDist + 140, yDist - 20);
  text("Wrong", xDist + 175, yDist - 20);
  text("Skips", xDist + 215, yDist - 20);
  text("%", xDist + 250, yDist - 20);
  noStroke();
};

Team.prototype.playerButtonPressed = function(){
  var playerButtonClicked = null;
  this.players.forEach(function(player){
    if(player.button.isMouseInside()){
      playerButtonClicked = player;
    }
  })
  return playerButtonClicked
};

Team.prototype.hidePlayerButtons = function(){
  this.players.forEach(function(player){
    player.button.displayButton = false;
  })
};
