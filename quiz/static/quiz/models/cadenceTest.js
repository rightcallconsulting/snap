var CadenceTest = function(config){
    this.typeTest = config.typeTest || "";
    this.cadences = config.cadences || [];
    this.questionNum = 0;
    this.falseStartPenalty = config.falseStartPenalty || 0.5;
    this.timePenalty = config.timePenalty || 0.0005;
    this.millisLate = 0; //part 1 of score
    this.falseStarts = 0; //part 2 of score
    this.scoreboard = config.scoreboard || null;
    this.over = false;
    this.cutOff = config.cutOff || 1000;
    this.correctAnswerMessage = config.correctAnswerMessage || "Correct!";
    this.incorrectAnswerMessage = config.incorrectAnswerMessage || "Wrong Answer";
    this.skippedAnswerMessage = config.skippedAnswerMessage || "Skipped";
};

CadenceTest.prototype.getCurrentCadence = function(){
	if(this.questionNum < 0 || this.questionNum >= this.cadences.length){
		return null;
	}
  return this.cadences[this.questionNum];
};

CadenceTest.prototype.getTotalScore = function(){
	return (this.questionNum - this.millisLate * this.timePenalty - this.falseStarts * this.falseStartPenalty).toFixed(2);
};

CadenceTest.prototype.getScoreString = function(){
  var questionsRemaining = this.cadences.length - this.questionNum - 1;
  var score = this.getTotalScore();
  return "Q" + this.questionNum + ", " + score + "/" + this.questionNum + ", " + questionsRemaining + " to go";
};

CadenceTest.prototype.restartQuiz = function(){
  //this.formations[0] ==> reset of some variety ???
  this.scoreboard.feedbackMessage = "";
  this.questionNum = 0;
  this.millisLate = 0;
  this.falseStarts = 0;
  this.over = false;
};

CadenceTest.prototype.registerAnswer = function(ellapsedMillis){
  if(ellapsedMillis < 0){
  	this.falseStarts++;
  	this.scoreboard.feedbackMessage = "False start! Try again.";
  }else{
  	if(ellapsedMillis > this.cutOff){
  		ellapsedMillis = this.cutOff;
  	}
  	this.millisLate += ellapsedMillis;
  	this.questionNum++;
  	this.scoreboard.feedbackMessage = "You took " + (ellapsedMillis/1000).toFixed(2) + " seconds";
  }
  if(this.questionNum >= this.cadences.length){
    this.over = true;
  } else{
    this.cadences[this.questionNum].pauseCadence();
    this.cadences[this.questionNum].restartCadence();
  }

  //this.scoreboard.feedbackMessage = message;
};

CadenceTest.prototype.drawQuizSummary = function() {
	var totalScore = this.getTotalScore();
  var resultString = "You scored " + totalScore + " out of " + this.cadences.length;
  var falseStartString = "You had " + this.falseStarts + " false start";
  if(this.falseStarts !== 1){
    falseStartString += "s";
  }
  var timeString = "You took " + ((this.millisLate / 1000) / this.cadences.length).toFixed(2) + " seconds per play";
  textAlign(CENTER);
  textSize(24);
  text(resultString, width/2, height/2-50);
  textSize(20);
  text(falseStartString, width/2, height/2+10);
  text(timeString, width/2, height/2+70);
};

CadenceTest.prototype.isLastQuestion = function(){
  return this.questionNum === this.cadences.length;
}
