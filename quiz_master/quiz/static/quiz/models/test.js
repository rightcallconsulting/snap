var Test = function(config){
    this.pythonTest = config.pythonTest || null;
    this.playerID = config.playerID || null;
    this.id = config.id || null;
    this.typeTest = config.typeTest || null;
    this.plays = config.plays || [];
    this.defensivePlays = config.defensivePlays || [];
    this.questionsPerPlay = config.questionsPerPlay || 1;
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
    this.incorrectAnswerMessage = config.incorrectAnswerMessage || "Sorry, bro.";
    this.timeStarted = config.timeStarted || 0;
    this.timeEnded = config.timeEnded || 0;
    this.deadline = config.deadline || null;
    this.inProgress = config.inProgress || null;
    this.completed = config.completed || null;
    this.assigned = config.assigned || null;
    this.name = config.name || null;
};

Test.prototype.getCurrentPlayNumber = function(){
  return floor(this.questionNum/this.questionsPerPlay);
};

Test.prototype.getCurrentPlay = function(){
  return this.plays[this.getCurrentPlayNumber()];
};

Test.prototype.getCurrentDefensivePlay = function(){
  return this.defensivePlays[this.getCurrentPlayNumber()];
};

Test.prototype.getScoreString = function(){
  var questionsRemaining = this.plays.length * this.questionsPerPlay - this.questionNum - 1;
  var scorePercentage = this.getPercentage();
  if (this.typeTest === "QBProgression"){
    return "Q" + (this.questionNum + 1) + "/" + "Q" + this.plays.length * this.questionsPerPlay + ", " + scorePercentage;
  }
  else if (this.typeTest === "WRRoute"){
    return "Q" + (this.questionNum + 1) + "/" + "Q" + this.plays.length * this.questionsPerPlay + ", " + scorePercentage;
  }
  else if (this.typeTest === "CBAssignment"){
    return "Q" + (this.questionNum) + "/" + "Q" + this.plays.length * this.questionsPerPlay + ", " + scorePercentage;
  }
  else if (this.typeTest === "OLAssignment"){
    return "Q" + (this.questionNum+1) + "/" + "Q" + this.plays.length*this.questionsPerPlay + ", " + scorePercentage;
  }
  else if(this.typeTest === "Option"){
    return "N/A";
  }
};

Test.prototype.getPercentage = function(){
  if(this.questionNum === 0){
    return "N/A";
  }
  return (100*((this.score - this.incorrectGuesses*this.badGuessPenalty) / (this.questionNum))).toFixed().toString() + "%";
};

Test.prototype.restartQuiz = function(defensivePlay){
  this.plays[0].clearProgression();
  this.scoreboard.feedbackMessage = "";
  this.questionNum = 0;
  this.score = 0;
  this.incorrectGuesses = 0;
  this.skips = 0;
  this.questionsAnswered = 0;
  this.startTime = millis();
  this.endTime = 0;
  this.getCurrentPlay().resetPlayers(defensivePlay);
  this.over = false;
  if(this.defensivePlays.length > 0){
    this.getCurrentDefensivePlay().bigPlayer = null;
  }
  this.getCurrentPlay().bigPlayer = null;
  this.clearSelection();
};

Test.prototype.registerAnswer = function(isCorrect){
  if(isCorrect){
    this.score++;
    this.advanceToNextPlay(this.correctAnswerMessage);
  }else{
    this.incorrectGuesses++;
    this.scoreboard.feedbackMessage = this.incorrectAnswerMessage;
  }
}

Test.prototype.advanceToNextPlay = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  if(this.getCurrentPlayNumber() >= this.plays.length){
    this.endTime = millis();
    this.over = true;
  } else{
    this.getCurrentPlay().clearProgression();
    this.getCurrentPlay().setAllRoutes();
  }
  //$.post( "players/"+this.playerID+"/tests/"+this.id+"/update", { test: JSON.stringify(_.omit(this,'plays'))});
  Player.rank = 1;
};

Test.prototype.drawQuizSummary = function() {
  var elapsedSeconds = (this.endTime - this.startTime)/1000;
  var timeDeduction = (elapsedSeconds - 10 * this.plays.length * this.questionsPerPlay)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction).toFixed(2) + " out of " + this.plays.length*this.questionsPerPlay;
  var guessesString = "You had " + this.incorrectGuesses.toFixed(0) + " incorrect guess";
  if(this.incorrectGuesses !== 1){
    guessesString += "es";
  }
  var timeString = "You took " + elapsedSeconds.toFixed(0) + " seconds";
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
      if(answer > 2){
        answer = 2;
      }
      var isCorrect = (this.getCurrentPlay().bigDefender !== null && this.getCurrentPlay().bigDefender.clickedRegion === answer);
    }
    else if(this.typeTest ==="CBAssignment"){
      var isCorrect = false;
      isCorrect = ((this.getCurrentPlay().bigPlayer !== null) && this.getCurrentPlay().bigPlayer.clicked);
    }
    if (isCorrect) {
      //this.scoreboard.feedbackMessage = "You got it, dude";
      this.getCurrentPlay().bigPlayer = null;
      this.getCurrentPlay().bigDefender = null;
      this.getCurrentDefensivePlay().bigDefender = null;
      this.getCurrentDefensivePlay().bigPlayer = null;
      this.showBigPlayers = false;
      this.clearSelection();
      this.registerAnswer(isCorrect);
      if(this.getCurrentPlayNumber() < this.plays.length){
        this.getCurrentDefensivePlay().draw(this.getCurrentPlay().oline[2].x, this.getCurrentPlay().oline[2].y, this);
        this.getCurrentDefensivePlay().defensivePlayers[10].CBAssignment = this.getCurrentPlay().eligibleReceivers[4];
      }
    } else {
      this.registerAnswer(isCorrect);
      //TODO: Explain what was wrong (or print right answer?)
    }
  }

  Test.prototype.establishOLPlayerTested = function(user, hardCodePosition) {
    // Positions on o-line in the database go from right to left for indexing
    if(hardCodePosition){
      var position = hardCodePosition;
    }
    else{
      var position = user.position;
    }

    if(position === "LT"){
      return this.getCurrentPlay().oline[4];
    }
    else if(position === "LG"){
      return this.getCurrentPlay().oline[3];
    }
    else if(position === "C"){
      return this.getCurrentPlay().oline[2];
    }
    else if(position === "RG"){
      return this.getCurrentPlay().oline[1];
    }
    else if(position === "RT"){
      return this.getCurrentPlay().oline[0];
    }
  }

  var createTestFromJSON = function(jsonTest){
    var test = new Test({
      typeTest: jsonTest.fields.type_of_test,
      playerID: jsonTest.fields.player,
      score: jsonTest.fields.score,
      incorrectGuesses: jsonTest.fields.incorrect_guesses,
      skips: jsonTest.fields.skips,
      id: jsonTest.pk
    });
    return test
  };
