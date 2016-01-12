var Route = function(config){
  this.startingPoint = config.startingPoint || [width/2, height/2]; //(x,y) at start
  this.breakPoints = config.breakPoints || [];
  this.routeName = config.routeName || "";
};

Route.prototype.getStartingPoint = function(){
  return this.startingPoint;
}

Route.prototype.getName = function(){
  return this.routeName;
}

Route.prototype.getBreakpoints = function(){
  return this.breakPoints;
}

Route.prototype.draw = function(){
  this.displayRoute();
}

Route.getDestination = function(distance, theta, x, y){
    var xDist = distance*Math.cos(theta);
    var yDist = -1*distance*Math.sin(theta);
    return [x + xDist, y + yDist];
};

Route.prototype.displayRoute = function(){
  fill(255, 255, 255);
  strokeWeight(2);
  stroke(100);
  line(this.startingPoint[0], this.startingPoint[1], this.breakPoints[0][0], this.breakPoints[0][1]);
  for (var i = 0; i < this.breakPoints.length - 1; i++) {
    line(this.breakPoints[i][0], this.breakPoints[i][1], this.breakPoints[i+1][0], this.breakPoints[i+1][1]);
  }
  strokeWeight(1);
  noStroke();
};

var RouteTest = function(config){
    this.typeTest = config.typeTest || "";
    this.receiver = config.receiver || null;
    this.routes = config.routes || [];
    this.questionNum = 0;
    this.badGuessPenalty = config.badGuessPenalty || 0.1;
    this.startTime = millis();
    this.endTime = 0;
    this.score = 0;
    this.incorrectGuesses = 0;
    this.skips = 0;
    this.scoreboard = config.scoreboard || null;
    this.over = false;
    this.cutOff = config.cutOff || 100;
    this.correctAnswerMessage = config.correctAnswerMessage || "You got it, dude.";
};

RouteTest.prototype.getCurrentRoute = function(){
  return this.routes[this.questionNum];
};

RouteTest.prototype.getScoreString = function(){
  var questionsRemaining = this.routes.length - this.questionNum - 1;

  return "Q" + (this.questionNum + 1) + ", " + this.score + "/" +
  this.questionNum + ", " + (questionsRemaining) +
    " remaining";
};

RouteTest.prototype.restartQuiz = function(){
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

RouteTest.prototype.advanceToNextRoute = function(message){
  this.scoreboard.feedbackMessage = message;
  this.questionNum++;
  if(this.questionNum >= this.routes.length){
    this.endTime = millis();
    this.over = true;
  } else{
    //reset elements of formation?
  }
};

RouteTest.prototype.drawQuizSummary = function() {
  var secondsElapsed = ((this.endTime - this.startTime)/1000);
  if(secondsElapsed > this.cutOff){
    secondsElapsed = this.cutOff;
  }
  var timeDeduction = (secondsElapsed.toFixed() - 10 * this.routes.length)*0.01;
  if(timeDeduction < 0.0){
    timeDeduction = 0.0;
  }
  var resultString = "You scored " + (this.score - this.incorrectGuesses*this.badGuessPenalty - timeDeduction) + " out of " + this.routes.length;
  var guessesString = "You had " + this.incorrectGuesses + " incorrect guess";
  if(this.incorrectGuesses !== 1){
    guessesString += "es";
  }
  var timeString = "You took " + secondsElapsed.toFixed() + " seconds";
  textAlign(CENTER);
  textSize(24);
  text(resultString, width/2, height/2-50);
  textSize(20);
  text(guessesString, width/2, height/2+10);
  text(timeString, width/2, height/2+70);
};

RouteTest.prototype.isLastQuestion = function(){
  return this.questionNum === this.routes.length;
}
