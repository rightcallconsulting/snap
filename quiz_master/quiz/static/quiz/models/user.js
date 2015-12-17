var User = function(config){
    this.name = config.name || null;
    this.position = config.position || null;
    this.score = 0;
    this.incorrectGuesses = 0;
    this.skips = 0;
    this.questionsAnswered = 0;
    this.tests = config.tests || [];
    this.OLtests = config.OLtests || [];
    this.CBtests = config.CBtests || [];
    this.QBtests = config.QBtests || [];
    this.WRtests = config.WRtests || [];
    this.totalCorrect = null;
    this.totalWrong = null;
    this.init = function(){
      this.createPlayerButton();
    };
    this.init();
};

User.prototype.createPlayerButton = function(){
  var button = new Button({
      width: 110,
      label: this.name,
      clicked: false,
      displayButton: true,
      player: this
  });
  this.button = button;
};

User.prototype.getOverallScore = function(){
  var numCorrect = 0;
  var numWrong = 0;
  var numSkips = 0;
  this.tests.forEach(function(test){
    numCorrect += test.score;
    numWrong += test.incorrectGuesses;
    numSkips += test.skips;
  })
  this.setTotalCorrect(numCorrect)
  this.setTotalWrong(numWrong)
  this.setTotalSkips(numSkips)
  this.totalPercentage = 100*(this.totalCorrect / (this.totalCorrect + this.totalWrong + this.totalSkips))
};

User.prototype.setTotalCorrect = function(num){
  if(this.totalCorrect !== num){
    this.totalCorrect = num;
  }
};

User.prototype.setTotalWrong = function(num){
  if(this.totalWrong !== num){
    this.totalWrong = num;
  }
};

User.prototype.setTotalSkips = function(num){
  if(this.totalSkips !== num){
    this.totalSkips = num;
  }
};

User.prototype.displayAllResults = function(xDist, yDist, index){
  textSize(12);
  text(index + 1 + "." + this.name, xDist, yDist);
  text(this.totalCorrect, xDist + 150, yDist);
  text(this.totalWrong, xDist + 185, yDist);
  text(this.totalSkips, xDist + 225, yDist);
  text(Math.round(this.totalPercentage)+"%", xDist + 250, yDist);
};

User.prototype.drawPlayerButton = function(xDist, yDist, index){
  this.button.x = xDist;
  this.button.y = yDist;
  this.button.draw()
  textSize(12);
};

User.prototype.drawQuizAssignment = function(xDist, yDist){
  this.drawSummaryHeader();
  this.drawQuizOptions();
  this.drawCompletedQuizzes(xDist, yDist);
  this.drawAssignedQuizzes(xDist, yDist);

};

User.prototype.drawSummaryHeader = function() {
    fill(0, 0, 0);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(this.name, 200, 20);
    fill(255,255,255)
    textAlign(LEFT, LEFT);
};

User.prototype.drawCompletedQuizzes = function(xDist, yDist) {
  var completedTests = this.tests.filter(function(test){
    return test.completed === true;
  })
  completedTests.forEach(function(test, index){
    if (test === completedTests[0]){
      textSize(12);
      text("Completed Tests", xDist, yDist - 15);
    }
    var button = new Button({
        x: xDist,
        y: yDist + 50*index,
        width: 80,
        label: test.name,
        clicked: false,
        displayButton: true,
        player: this,
        test: test
    });
    button.draw();
    text(Math.round(test.getPercentage())+ "%", button.x + 90,button.y + 5)
  })
};

User.prototype.drawAssignedQuizzes = function(xDist, yDist) {
  var xDist = xDist + 140;
  var assignedTests = this.tests.filter(function(test){
    return test.assigned === true;
  })
  assignedTests.forEach(function(test, index){
    if (test === assignedTests[0]){
      fill(255, 255, 255);
      textSize(12);
      text("Assigned Tests", xDist, yDist - 22);
    }
    var button = new Button({
        x: xDist,
        y: yDist + 50*index,
        width: 80,
        label: test.name,
        clicked: false,
        displayButton: true,
        player: this,
        test: test
    });
    button.draw();
  })
};

User.prototype.drawAssignNewQuiz = function() {

};

User.prototype.drawQuizOptions = function() {
  if(this.position === "QB"){

  }

};

User.prototype.drawQuizResults = function() {
  if(this.position === "QB"){

  }

};
