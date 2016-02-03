var PlayTest = function(config){
    this.typeTest = config.typeTest || "";
    this.plays = config.plays || [];
    this.questionNum = 0;
    this.badGuessPenalty = config.badGuessPenalty || 0.1;
    this.secondsPerQuestion = config.secondsPerQuestion || 10;
    this.startTime = millis();
    this.endTime = 0;
    this.score = 0;
    this.incorrectGuesses = 0;
    this.skips = 0;
    this.scoreboard = config.scoreboard || null;
    this.over = false;
    this.cutOff = config.cutOff || 50;
    this.correctAnswerMessage = config.correctAnswerMessage || "You got it, dude.";
    this.incorrectAnswerMessage = config.incorrectAnswerMessage || "Sorry, Bro.";
    this.skippedAnswerMessage = config.correctAnswerMessage || "Aw, weak!";
};

PlayTest.prototype.getCurrentPlay = function(){
  return this.plays[this.questionNum];
};

PlayTest.prototype.getScoreString = function(){
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
  } else{
  	return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
    this.questionNum + ", " + (questionsRemaining) +
    " remaining";
  }
};

PlayTest.prototype.restartQuiz = function(){
  //this.plays[0] ==> reset of some variety ???
  this.scoreboard.feedbackMessage = "";
  this.questionNum = 0;
  this.score = 0;
  this.incorrectGuesses = 0;
  this.skips = 0;
  this.questionsAnswered = 0;
  this.startTime = millis();
  this.endTime = 0;
  this.over = false;
};

PlayTest.prototype.advanceToNextPlay = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  if(this.questionNum >= this.plays.length){
    this.endTime = millis();
    this.over = true;
  } else{
    //reset elements of play?
  }
};

PlayTest.prototype.registerAnswer = function(isCorrect){
  if(isCorrect){
    this.score++;
    this.advanceToNextPlay("You got it.");
  }else{
    this.incorrectGuesses++;
    this.scoreboard.feedbackMessage = "Sorry, bro.";
  }
};

PlayTest.prototype.drawQuizSummary = function() {
  var elapsedSeconds = (this.endTime - this.startTime)/1000;
  if(elapsedSeconds > this.cutOff * this.plays.length){
    elapsedSeconds = this.cutOff * this.plays.length;
  }
  var timeDeduction = (elapsedSeconds - this.secondsPerQuestion * this.plays.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction).toFixed(2) + " out of " + this.plays.length;
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

PlayTest.prototype.isLastQuestion = function(){
  return this.questionNum === this.plays.length;
}