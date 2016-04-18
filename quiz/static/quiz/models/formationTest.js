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
    this.correctAnswerMessage = config.correctAnswerMessage || "Correct!";
    this.incorrectAnswerMessage = config.incorrectAnswerMessage || "Wrong Answer";
    this.skippedAnswerMessage = config.skippedAnswerMessage || "Skipped";
    this.displayName = config.displayName || false;
    this.coverageMap = config.coverageMap || null;
    this.feedBackScreenStartTime = config.feedBackScreenStartTime || false;
    this.showDemo = config.showDemo || false;
    this.demoStartTime = config.demoStartTime || 0;
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
FormationTest.prototype.getCurrentCoverageMap = function(){
  return this.coverageMap;
};

FormationTest.prototype.getCurrentPlayerTested = function(currentUserTested){
  var play = this.getCurrentFormation();

  var player = play.defensivePlayers.filter(function(player) {return player.pos === currentUserTested.position})[0];
  return player;
};


FormationTest.prototype.restartQuiz = function(){
  //this.formations[0] ==> reset of some variety ???
  this.scoreboard.feedbackMessage = "";
  this.feedBackScreenStartTime = 0;
  this.showDemo = false;
  this.demoStartTime = 0;
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

FormationTest.prototype.updateMultipleChoiceLabels = function(){
  document.getElementById("multiple-choice-answer-cell").classList.remove('hidden');
  document.getElementById("mc-answer-1").innerHTML = multipleChoiceAnswers[0].getHTMLButton(1);
  document.getElementById("mc-answer-2").innerHTML = multipleChoiceAnswers[1].getHTMLButton(2);
  document.getElementById("mc-answer-3").innerHTML = multipleChoiceAnswers[2].getHTMLButton(3);
  document.getElementById("mc-button-1").onclick = function(e){
    if(!clickButton(1)){
      e.preventDefault();
      e.stopPropagation();
    }else{
      //debugger;
    }
  };
  document.getElementById("mc-button-2").onclick = function(e){
    if(!clickButton(2)){
      e.preventDefault();
      e.stopPropagation();
    }
  };
  document.getElementById("mc-button-3").onclick = function(e){
    if(!clickButton(3)){
      e.preventDefault();
      e.stopPropagation();
    }
  };
}

FormationTest.prototype.updateScoreboard = function(){
  $('#score').text("Score: " + this.score);
  $('#skips').text(this.skips);
  var skip_button_skips = $('#skip-button-skips');
  if(skip_button_skips){
    skip_button_skips.text(this.skips);
  }
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

FormationTest.prototype.skipQuestion = function(){
  this.skips++;
  this.advanceToNextFormation(this.skippedAnswerMessage);
}

FormationTest.prototype.registerAnswer = function(isCorrect){
  if(isCorrect){
    this.score++;
    this.advanceToNextFormation(test.correctAnswerMessage);
  }else{
    this.incorrectGuesses++;
    this.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    this.updateScoreboard();
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
