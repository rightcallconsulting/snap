var PlayTest = function(config){
  this.typeTest = config.typeTest || "";
  this.plays = config.plays || [];
  this.defensivePlays = config.defensivePlays || [];
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
  this.showDemo = config.showDemo || false;
  this.demoStartTime = config.demoStartTime || 0;
};

PlayTest.prototype.getCurrentPlayerTested = function(currentUserTested){
  var play = this.getCurrentDefensivePlay();
  if(play){
    var player = play.defensivePlayers.filter(function(player) {return player.pos === currentUserTested.position})[0];
    if(player){
      return player;
    }
    var player = play.offensiveFormationObject.offensivePlayers.filter(function(player) {return player.pos === currentUserTested.position})[0];
    if(player){
      return player;
    }
  }
  play = this.getCurrentPlay();
  if(play){
    return play.offensivePlayers.filter(function(player) {return player.pos === currentUserTested.position})[0];
  }
  return null;
};

PlayTest.prototype.getCurrentPlay = function(){
  return this.plays[this.questionNum];
};

PlayTest.prototype.getCurrentDefensivePlay = function(){
  return this.defensivePlays[this.questionNum];
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
  for(var i = 0; i < this.plays.length; i++){
    var offense = this.plays[i].offensivePlayers;
    if(!offense){
      offense = this.plays[i].offensiveFormationObject.offensivePlayers;
    }
    if(!offense){
      return;
    }
    for(var j = 0; j < offense.length; j++){
      offense[j].resetToStart();
    }
  }
};

PlayTest.prototype.updateMultipleChoiceLabels = function(){
  document.getElementById("multiple-choice-answer-cell").classList.remove('hidden');
  document.getElementById("mc-answer-1").innerHTML = multipleChoiceAnswers[0].getHTMLButton(1);
  document.getElementById("mc-answer-2").innerHTML = multipleChoiceAnswers[1].getHTMLButton(2);
  document.getElementById("mc-answer-3").innerHTML = multipleChoiceAnswers[2].getHTMLButton(3);
  document.getElementById("mc-button-1").onclick = function(){clickButton(1)};
  document.getElementById("mc-button-2").onclick = function(){clickButton(2)};
  document.getElementById("mc-button-3").onclick = function(){clickButton(3)};
}

PlayTest.prototype.updateScoreboard = function(){
  $('#score').text("Score: " + this.score);
  $('#skips').text(this.skips);
  var skip_button_skips = $('#skip-button-skips');
  if(skip_button_skips){
    skip_button_skips.text(this.skips);
  }
  $('#incorrect-guesses').text("Wrong: " +this.incorrectGuesses);
  $('#feedback-message').text(this.scoreboard.feedbackMessage);
}

PlayTest.prototype.updateProgress = function(){
  $('#progress').text("Q" + (this.questionNum+1) + "/Q" + this.plays.length);
  if(this.displayName && this.getCurrentPlay()){
    var name = this.getCurrentPlay().name;
    if(!name){
      name = this.getCurrentPlay().playName;
    }
    $('#play-name').text(name);
  }
}

PlayTest.prototype.skipQuestion = function(){
  this.skips++;
  this.advanceToNextPlay(this.skippedAnswerMessage);
}

PlayTest.prototype.advanceToNextPlay = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  this.updateScoreboard();
  if(this.questionNum >= this.plays.length){
    this.endTime = millis();
    this.over = true;
  } else{
    this.updateProgress();
    //this.updateMultipleChoiceLabels();
    //reset elements of play?
  }
};

PlayTest.prototype.registerAnswer = function(isCorrect){
  if(isCorrect){
    this.score++;
    this.advanceToNextPlay(test.correctAnswerMessage);
  }else{
    this.incorrectGuesses++;
    this.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    this.updateScoreboard();
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
