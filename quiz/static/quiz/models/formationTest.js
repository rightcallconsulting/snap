var FormationTest = function(config){
    this.typeTest = config.typeTest || "";
    this.formations = config.formations || [];
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
    this.displayName = config.displayName || false;
};

FormationTest.prototype.getCurrentFormation = function(){
  return this.formations[this.questionNum];
};

FormationTest.prototype.getScoreString = function(){
  var questionsRemaining = this.formations.length - this.questionNum - 1;
  if (this.typeTest === "QBProgression"){
    return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
    this.questionNum + ", " + (questionsRemaining) +
    " remaining";
  }
  else if (this.typeTest === "WRRoute"){
    var scorePercentage = (100*this.score/(this.questionNum)) ? (100*this.score/(this.questionNum)).toFixed(0) + "%" : "N/A";
    if (this.questionNum >= this.plays.length){
      return "Q" + (this.questionNum) + "/" + "Q" + this.formations.length + ", " + scorePercentage;
    } else {
      return "Q" + (this.questionNum + 1) + "/" + "Q" + this.formations.length + ", " + scorePercentage;
    }
  } else{
  	return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
    this.questionNum + ", " + (questionsRemaining) +
    " remaining";
  }
};

FormationTest.prototype.restartQuiz = function(){
  //this.formations[0] ==> reset of some variety ???
  this.scoreboard.feedbackMessage = "";
  this.questionNum = 0;
  this.score = 0;
  this.incorrectGuesses = 0;
  this.skips = 0;
  this.questionsAnswered = 0;
  this.startTime = millis();
  this.endTime = 0;
  this.over = false;
  this.updateScoreboard();
  this.updateProgress();
};

FormationTest.prototype.updateMultipleChoiceLables = function(){
  $('#mc-answer-1').text(multipleChoiceAnswers[0].label);
  $('#mc-answer-2').text(multipleChoiceAnswers[1].label);
  $('#mc-answer-3').text(multipleChoiceAnswers[2].label);
}

FormationTest.prototype.updateScoreboard = function(){
  $('#score').text("Score: " + this.score);
  $('#skips').text(this.skips);
  $('#incorrect-guesses').text("Wrong: " +this.incorrectGuesses);
  $('#feedback-message').text(this.scoreboard.feedbackMessage);
}

FormationTest.prototype.updateProgress = function(){
  $('#progress').text("Q" + (this.questionNum+1) + "/Q" + this.formations.length);
  if(this.displayName && this.getCurrentFormation()){
    $('#play-name').text(this.getCurrentFormation().name);
  }
}

FormationTest.prototype.advanceToNextFormation = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  this.updateScoreboard();
  if(this.questionNum >= this.formations.length){
    this.endTime = millis();
    this.over = true;
  } else{
    //reset elements of formation?
    this.updateProgress();
  }
};

FormationTest.prototype.registerAnswer = function(isCorrect){
  if(isCorrect){
    this.score++;
    this.advanceToNextFormation("You got it.");
  }else{
    this.incorrectGuesses++;
    this.scoreboard.feedbackMessage = "Sorry, bro.";
  }
};

FormationTest.prototype.drawQuizSummary = function() {
  var elapsedSeconds = (this.endTime - this.startTime)/1000;
  if(elapsedSeconds > this.cutOff * this.formations.length){
    elapsedSeconds = this.cutOff * this.formations.length;
  }
  var timeDeduction = (elapsedSeconds - this.secondsPerQuestion * this.formations.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction).toFixed(2) + " out of " + this.formations.length;
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

FormationTest.prototype.isLastQuestion = function(){
  return this.questionNum === this.formations.length;
}
