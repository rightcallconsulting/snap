var Test = function(config){
    this.typeTest = config.typeTest || null;
    this.plays = config.plays || [];
    this.defensivePlays = config.defensivePlays || [];
    this.questionNum = 0;
    this.badGuessPenalty = config.badGuessPenalty || 0.1;
    this.speed = 1;
    this.startTime = config.startTime || 0;
    this.endTime = config.endTime || 0;
    this.score = config.score || 0;
    this.incorrectGuesses = config.incorrectGuesses || 0;
    this.skips = config.skips || 0;
    this.scoreboard = config.scoreboard || null;
    this.over = false;
    this.cutOff = config.cutOff || 50;
    this.correctAnswerMessage = config.correctAnswerMessage || "You got it, dude.";
    this.timeStarted = config.timeStarted || 0;
    this.timeEnded = config.timeEnded || 0;
    this.deadline = config.deadline || null;
    this.inProgress = config.inProgress || null;
    this.completed = config.completed || null;
    this.assigned = config.assigned || null;
    this.name = config.name || null;
};

Test.prototype.getCurrentPlay = function(){
  return this.plays[this.questionNum];
};

Test.prototype.getCurrentDefensivePlay = function(){
  return this.defensivePlays[this.questionNum];
};

Test.prototype.getScoreString = function(){
  var questionsRemaining = this.plays.length - this.questionNum - 1;
  if (this.typeTest === "QBProgression"){
    return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
    this.questionNum + ", " + (questionsRemaining) +
    " remaining";
  }
  else if (this.typeTest === "WRRoute"){
    var scorePercentage = (100*this.score/(this.questionNum)) ? (100*this.score/(this.questionNum)).toFixed(0) + "%" : "N/A";
    if (this.questionNum >= this.plays.length){
      return "Q" + (this.questionNum) + "/" + "Q" + this.plays.length + ", " + scorePercentage;
    } else {
      return "Q" + (this.questionNum + 1) + "/" + "Q" + this.plays.length + ", " + scorePercentage;
    }
  }
  else if (this.typeTest === "CBAssignment"){
    var scorePercentage = (100*this.score/(this.questionNum)) ? (100*this.score/(this.questionNum)).toFixed(0) + "%" : "N/A";
    if (this.questionNum >= this.plays.length){
      return "Q" + (this.questionNum) + "/" + "Q" + this.plays.length + ", " + scorePercentage;
    } else {
      return "Q" + (this.questionNum + 1) + "/" + "Q" + this.plays.length + ", " + scorePercentage;
    }
  }
  else if (this.typeTest === "OLAssignment"){
    var scorePercentage = (100*this.score/(this.questionNum)) ? (100*this.score/(this.questionNum)).toFixed(0) + "%" : "N/A";
    if (this.questionNum >= this.plays.length){
      return "Q" + (this.questionNum) + "/" + "Q" + this.plays.length + ", " + scorePercentage;
    } else {
      return "Q" + (this.questionNum + 1) + "/" + "Q" + this.plays.length + ", " + scorePercentage;
    }
  }
};

Test.prototype.getPercentage = function(){
  return 100*(this.score / (this.score + this.incorrectGuesses + this.skips))
};

Test.prototype.restartQuiz = function(defensivePlay){
  this.plays[0].clearProgression();
  this.scoreboard.feedbackMessage = "";
  this.questionNum = 0;
  this.score = 0;
  this.incorrectGuesses = 0;
  this.skips = 0;
  this.questionsAnswered = 0;
  this.startTime = 0;
  this.endTime = 0;
  this.getCurrentPlay().resetPlayers(defensivePlay);
  this.over = false;
  this.getCurrentDefensivePlay().bigPlayer = null;
  this.getCurrentPlay().bigPlayer = null;
  this.clearSelection();
};

Test.prototype.advanceToNextPlay = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  if(this.questionNum >= this.plays.length){
    this.endTime = minute() * 60 + second();
    this.over = true;
  } else{
    this.getCurrentPlay().clearProgression();
    this.getCurrentPlay().setAllRoutes();
  }
};

Test.prototype.drawQuizSummary = function() {
  var timeDeduction = ((this.endTime - this.startTime) - 10 * this.plays.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction).toFixed(0) + " out of " + this.plays.length;
  var guessesString = "You had " + this.incorrectGuesses.toFixed(0) + " incorrect guess";
  if(this.incorrectGuesses !== 1){
    guessesString += "es";
  }
  var timeString = "You took " + (this.endTime - this.startTime).toFixed(0) + " seconds";
  textAlign(CENTER);
  textSize(24);
  text(resultString, width/2, height/2-50);
  textSize(20);
  text(guessesString, width/2, height/2+10);
  text(timeString, width/2, height/2+70);
};

Test.prototype.isLastQuestion = function(){
  return test.questionNum === test.plays.length;
}

Test.prototype.clearSelection = function() {
    var dPlay = this.getCurrentDefensivePlay();
    var oPlay = this.getCurrentPlay();
    if (this.showBigPlayers) {
      if (this.getCurrentDefensivePlay().bigDefender && this.getCurrentDefensivePlay().bigDefender.clicked) {
        this.getCurrentDefensivePlay().bigDefender.unselect();
      } else if (this.getCurrentPlay().bigPlayer !== null && this.getCurrentPlay().bigPlayer.clicked) {
        this.getCurrentPlay().bigPlayer.unselect();
      }
    } else {
        if (dPlay){
          for (var i = 0; i < dPlay.defensivePlayers.length; i++) {
            var p = dPlay.defensivePlayers[i];
            if (p.clicked) {
              p.unselect();
            }
          }
        }
        if (oPlay){
        for (var i = 0; i < oPlay.offensivePlayers.length; i++) {
          var p = oPlay.offensivePlayers[i];
          if (p.clicked) {
            p.unselect();
          }
        }
      }
    }
  }

Test.prototype.checkBigSelection = function() {
    if(this.typeTest === "OLAssignment"){
      var answer = floor(this.questionNum / 2) + 1;
      var isCorrect = (this.getCurrentPlay().bigDefender !== null && this.getCurrentPlay().bigDefender.clickedRegion === answer);
    }
    else if(this.typeTest ==="CBAssignment"){
      var isCorrect = false;
      isCorrect = ((this.getCurrentPlay().bigPlayer !== null) && this.getCurrentPlay().bigPlayer.clicked);
    }
    if (isCorrect) {
      this.scoreboard.feedbackMessage = "You got it, dude";
      this.getCurrentPlay().bigPlayer = null;
      this.getCurrentPlay().bigDefender = null;
      this.getCurrentDefensivePlay().bigDefender = null;
      this.getCurrentDefensivePlay().bigPlayer = null;
      this.score++;
      this.questionNum ++;
      this.showBigPlayers = false;
      this.clearSelection();
      if(this.questionNum < this.plays.length){
        this.getCurrentDefensivePlay().draw(this.getCurrentPlay().oline[2].x, this.getCurrentPlay().oline[2].y, this);
        this.getCurrentDefensivePlay().defensivePlayers[10].CBAssignment = this.getCurrentPlay().eligibleReceivers[4];
      }
      if (this.questionNum  >= this.plays.length) {
        this.endTime = millis();
        this.over = true;
      }
    } else {
      this.scoreboard.feedbackMessage = "Wrong Answer";
      this.incorrectGuesses++;
      //TODO: Explain what was wrong (or print right answer?)
    }
  }
