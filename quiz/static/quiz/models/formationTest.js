var FormationTest = function(config){
    this.typeTest = config.typeTest || "";
    this.formations = config.formations || [];
    this.questionNum = 0;
    this.badGuessPenalty = config.badGuessPenalty || 0.1;
    this.startTime = millis();
    this.endTime = 0;
    this.score = 0;
    this.incorrectGuesses = 0;
    this.skips = 0;
    this.scoreboard = config.scoreboard || null;
    this.over = false;
    this.cutOff = config.cutOff || 50;
    this.correctAnswerMessage = config.correctAnswerMessage || "You got it, dude.";
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
};

FormationTest.prototype.advanceToNextFormation = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  if(this.questionNum >= this.formations.length){
    this.endTime = millis();
    this.over = true;
  } else{
    //reset elements of formation?
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
  var timeDeduction = ((this.endTime - this.startTime)/1000 - 10 * this.formations.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction) + " out of " + this.formations.length;
  var guessesString = "You had " + this.incorrectGuesses + " incorrect guess";
  if(this.incorrectGuesses !== 1){
    guessesString += "es";
  }
  var timeString = "You took " + int((this.endTime - this.startTime)/1000) + " seconds";
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
