var ConceptTest = function(config){
    this.typeTest = config.typeTest || "";
    this.concepts = config.concepts || [];
    this.questionNum = 0;
    this.badGuessPenalty = config.badGuessPenalty || 0.1;
    this.secondsPerQuestion = config.secondsPerQuestion || 10;
    this.startTime = millis();
    this.endTime = 0;
    this.score = 0;
    this.incorrectGuesses = 0;
    this.skips = 0;
    this.correctConcepts = config.correctConcepts || [];
    this.missedConcepts = config.missedConcepts || [];
    this.skippedConcepts = config.skippedConcepts || [];
    this.scoreboard = config.scoreboard || null;
    this.over = false;
    this.cutOff = config.cutOff || 50;
    this.correctAnswerMessage = config.correctAnswerMessage || "Correct!";
    this.incorrectAnswerMessage = config.incorrectAnswerMessage || "Wrong Answer";
    this.skippedAnswerMessage = config.skippedAnswerMessage || "Skipped";
    this.displayName = config.displayName || false;
    this.coverageMap = config.coverageMap || null;
    this.feedbackScreenStartTime = config.feedbackScreenStartTime || false;
    this.showDemo = config.showDemo || false;
    this.demoStartTime = config.demoStartTime || 0;
};

ConceptTest.prototype.getCurrentConcept = function(){
  return this.concepts[this.questionNum];
};

ConceptTest.prototype.getScoreString = function(){
  var questionsRemaining = this.concepts.length - this.questionNum - 1;
  if (this.typeTest === "QBProgression"){
    return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
    this.questionNum + ", " + (questionsRemaining) +
    " remaining";
  }
  else if (this.typeTest === "WRRoute"){
    var scorePercentage = (100*this.score/(this.questionNum)) ? (100*this.score/(this.questionNum)).toFixed(0) + "%" : "N/A";
    if (this.questionNum >= this.plays.length){
      return "Q" + (this.questionNum) + "/" + "Q" + this.concepts.length + ", " + scorePercentage;
    } else {
      return "Q" + (this.questionNum + 1) + "/" + "Q" + this.concepts.length + ", " + scorePercentage;
    }
  } else{
  	return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
    this.questionNum + ", " + (questionsRemaining) +
    " remaining";
  }
};
ConceptTest.prototype.getCurrentCoverageMap = function(){
  return this.coverageMap;
};

ConceptTest.prototype.getCurrentPlayerTested = function(currentUserTested){
  var play = this.getCurrentConcept();

  var player = play.defensivePlayers.filter(function(player) {return player.pos === currentUserTested.position})[0];
  return player;
};


ConceptTest.prototype.restartQuiz = function(){
  //this.concepts[0] ==> reset of some variety ???
  this.scoreboard.feedbackMessage = "";
  this.feedbackScreenStartTime = 0;
  this.showDemo = false;
  this.demoStartTime = 0;
  this.questionNum = 0;
  this.score = 0;
  this.incorrectGuesses = 0;
  this.skips = 0;
  this.correctConcepts = [];
  this.missedConcepts = [];
  this.skippedConcepts = [];
  this.questionsAnswered = 0;
  this.startTime = millis();
  this.endTime = 0;
  this.over = false;
  this.updateScoreboard();
  this.updateProgress();
};

ConceptTest.prototype.updateMultipleChoiceLabels = function(){
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

ConceptTest.prototype.updateScoreboard = function(){
  $('#correct').text(this.score);
  $('#incorrect-guesses').text(this.incorrectGuesses);
  $('#skips').text(this.skips);
  var skip_button_skips = $('#skip-button-skips');
  if(skip_button_skips){
    skip_button_skips.text(this.skips);
  }

  $('#feedback-message').text(this.scoreboard.feedbackMessage);
}

ConceptTest.prototype.updateProgress = function(){
  $('#progress').text("Q" + (this.questionNum+1) + "/Q" + this.concepts.length);
  if(this.displayName && this.getCurrentConcept()){
    $('#play-name').text(this.getCurrentConcept().name);
  }
}

ConceptTest.prototype.advanceToNextConcept = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  this.updateScoreboard();
  if(this.questionNum >= this.concepts.length){
    this.endTime = millis();
    this.over = true;
  } else{
    //reset elements of concept?
    this.updateProgress();
  }
};

ConceptTest.prototype.skipQuestion = function(){
  this.skips++;
  this.skippedConcepts.push(this.getCurrentConcept())
  this.advanceToNextConcept(this.skippedAnswerMessage);
}

ConceptTest.prototype.registerAnswer = function(isCorrect){
  if(isCorrect){
    this.score++;
    this.correctConcepts.push(this.getCurrentConcept());
    this.advanceToNextConcept(test.correctAnswerMessage);
  }else{
    this.missedConcepts.push(this.getCurrentConcept());
    this.incorrectGuesses++;
    this.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    this.updateScoreboard();
  }
};

ConceptTest.prototype.drawQuizSummary = function() {
  background(93, 148, 81);
  var elapsedSeconds = (this.endTime - this.startTime)/1000;
  if(elapsedSeconds > this.cutOff * this.concepts.length){
    elapsedSeconds = this.cutOff * this.concepts.length;
  }
  var timeDeduction = (elapsedSeconds - this.secondsPerQuestion * this.concepts.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction).toFixed(2) + " out of " + this.concepts.length;
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

ConceptTest.prototype.isLastQuestion = function(){
  return this.questionNum === this.concepts.length;
}
