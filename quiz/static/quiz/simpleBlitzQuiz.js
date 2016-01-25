function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');
}

function draw() {
  //Create Scoreboard

  var selectedGap = -1;
  var playerBeingTested = null;
  var scoreboard = new Scoreboard({

  });

  var formationNames = ["Mike Pinch", "Will Slam", "Sam Plug"]; 

  var multipleChoiceAnswers = [];

  var field = new Field({
    heightInYards: 45,
    widthInYards: 45,
    yardLine: 75,
    widthOffset: -3
  });

  var test = new Test({
    formations: [offensiveFormation, offensiveFormation, offensiveFormation],
    scoreboard: scoreboard
  });

  Test.prototype.getCurrentDefense = function(){
    return this.defensivePlays[0];
  };

  ///////this draws the offense///////
  var offensiveFormation = new Formation({
   name: formationNames[0]
 })
  offensiveFormation.createOLineAndQB();
  offensiveFormation.createSkillPlayers();
  ///////////////////////////////////

  var defensePlay = new DefensivePlay({
    defensivePlayers: [],
    dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
    lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
    dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
    dlPositions: ["DE", "NT", "DT", "RE"],
    lbPositions: ["W", "M", "S"],
    dbPositions: ["CB", "SS", "F/S", "CB"],
    dlNames: ["Gronk", "Davis", "Smith", "Evans"]
  });

  var createDefense = function(){
    for(var i = 0; i < defensePlay.dlPositions.length; i++){
      var dl = new DefensivePlayer ({
        x: 140 + (40 * i),
        y: 170,
        fill: color(255),
        unit: "defense",
        pos: defensePlay.dlPositions[i],
        index: i,
        num: i + 90,
        clicked: false
      });

      defensePlay.defensivePlayers.push(dl);
    }
    
    for(var i = 0; i < defensePlay.lbPositions.length; i++){
      var lb = new DefensivePlayer ({
        x: 120 + (75 * i),
        y: 125,
        fill: color(255),
        pos: defensePlay.lbPositions[i],
        unit: "defense",
        index: 4+i,
        num: 50 + i,
        clicked: false
      });

      defensePlay.defensivePlayers.push(lb);
    }
    
    for(var i = 0; i < 2; i++){
      var safety = new DefensivePlayer ({
        x: 100 + (200 * i),
        y: 75,
        fill: color(255),
        pos: defensePlay.dbPositions[i+1],
        unit: "defense",
        index: 4+i,
        num: i + 30,
        clicked: false
      });

      defensePlay.defensivePlayers.push(safety);
    }

    
    for(var i = 0; i < 2; i++){
      var corner = new DefensivePlayer ({
        x: 65 + (270 * i),
        y: 165,
        fill: color(255),
        pos: defensePlay.dbPositions[i*3],
        unit: "defense",
        index: 4+i,
        num: 20 + i,
        clicked: false
      });
      defensePlay.defensivePlayers.push(corner);
    } 
  };

  createDefense(200, 200);

  Scoreboard.prototype.draw = function(test, user) {
    fill(0, 0, 0);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text("", this.x, this.y);
  };

  var user = new User({});

  Player.prototype.draw = function() {
    if(this.unit === "offense"){
      noStroke();
      if(this.rank > 0){
        fill(255, 255, 0);
      }else{
        fill(this.fill);
      }
      ellipse(this.x, this.y, this.siz, this.siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      if(this.rank > 0){
        text(this.rank, this.x, this.y);
      }else{
        text(this.num, this.x, this.y);
      }
      if (this.showRoute && this.breakPoints.length > 0 && !playButton.clicked){
        this.displayRoute(this.breakPoints);
      }
    }
    else {
      fill(this.fill);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, this.x, this.y);
    }
  };

  Player.prototype.select = function() {
      //this.fill = color(255, 234, 0);
      this.rank = Player.rank;
      Player.rank++;
      this.clicked = true;
    };

    Player.prototype.unselect = function() {
      this.clicked = false;
      currentPlay = test.getCurrentPlay();
      if(currentPlay && this.rank > 0 && this.rank < Player.rank - 1){
      //decrement the later guys' ranks
      for(var i = 0; i < currentPlay.eligibleReceivers.length; i++){
        var p = currentPlay.eligibleReceivers[i];
        if(p.rank > this.rank){
          p.rank--;
        }
      }
    }
    this.rank = 0;
    Player.rank--;
  };

  DefensivePlayer.prototype.getTestedPlayer = function(){
   if (this.isBeingTested) {
    fill(255, 0, 250);
  } else {
    fill(0);
  }
  textSize(17);
  textAlign(CENTER, CENTER);
  text(this.pos, this.x, this.y);
};

var check = new Button({
  x: 20,
  y: 20,
  width: 50,
  label: "Check",
  clicked: false,
  displayButton: true
});

var clear = new Button({
  x: 80,
  y: 20,
  width: 50,
  label: "Clear",
  clicked: false,
  displayButton: true
});

var bigReset = new Button({
  x: width / 2 - 40,
  y: height * 4 / 5,
  width: 80,
  label: "Restart Quiz",
  clicked: false
});

var shuffle = function(o){
 for(var n = 0; n < 100; n++){
   for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
 }
return o;
};
var createMultipleChoiceAnswers = function(){
  multipleChoiceAnswers = [];
  var availableNames = formationNames.slice(0,3);
  shuffle(availableNames);
  for(var i = 0; i < availableNames.length; i++){
   multipleChoiceAnswers.push(new MultipleChoiceAnswer({
    x: 50 + i * width / (availableNames.length + 1),
    y: (3 * (height / 4)) + 20,
    width: width / (availableNames.length + 2),
    height: 50,
    label: availableNames[i],
    clicked: false
  }));
 }
};

var clearAnswers = function(){
  for(var i = 0; i < multipleChoiceAnswers.length; i++){
   var a = multipleChoiceAnswers[i];
   if(a.clicked){
    a.changeClickStatus();
  }
}
};

var checkAnswer = function(guess){
		//logic
		var isCorrect = offensiveFormation.name === guess.label;
		if(isCorrect){
			test.advanceToNextFormation("You got it, dude");
      test.score++;
      createMultipleChoiceAnswers();
      if(test.over){
       bigReset.displayButton = true;
       check.displayButton = false;
       clear.displayButton = false;
     }
   }else{
     clearAnswers();
     test.scoreboard.feedbackMessage = "Wrong Answer";
     test.incorrectGuesses++;
   }
 };
 
  // intro scene
  var drawOpening = function() {
    field.drawBackground("", height, width);

    scoreboard.draw(test, user);
    offensiveFormation.drawAllPlayers();
    defensePlay.draw(200, 200, test);
    defensePlay.drawAllPlayers();

    for(var i = 0; i < multipleChoiceAnswers.length; i++){
     multipleChoiceAnswers[i].draw();
   }

   check.draw();
   clear.draw();
   fill(0, 0, 0);
   textSize(20);
   text(test.scoreboard.feedbackMessage, 160, 360);

   defensePlay.draw(200, 200, test);
   defensePlay.drawAllPlayers();

   defensePlay.defensivePlayers[5].isBeingTested = true;
   defensePlay.defensivePlayers[5].getTestedPlayer();

 };


 mouseClicked = function() {
  test.scoreboard.feedbackMessage = "";
  if (check.isMouseInside()){
    var selectedAnswer = null;
    for(var i = 0; i < multipleChoiceAnswers.length; i++){
     if(multipleChoiceAnswers[i].clicked){
      selectedAnswer = multipleChoiceAnswers[i];
    }
  }
  if(selectedAnswer !== null){
   checkAnswer(selectedAnswer);
 }
}else if (clear.isMouseInside()){
  clearAnswers();
  test.scoreboard.feedbackMessage = "";
}else if (bigReset.isMouseInside() && test.over) {
  test.restartQuiz();
  check.displayButton = true;
  clear.displayButton = true;
}
else{
 for(var i = 0; i < multipleChoiceAnswers.length; i++){
  var answer = multipleChoiceAnswers[i];
  if(answer.clicked){
   if(answer.isMouseInside()){
    checkAnswer(answer);
  }else{
    answer.changeClickStatus();
  }
}else{
 if(answer.isMouseInside()){
  answer.changeClickStatus();
}
}
}
}
};
keyPressed = function(){

};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      test.restartQuiz();
      check.displayButton = true;
      clear.displayButton = true;
    }
  }else{
    var offset = key.charCodeAt(0) - "1".charCodeAt(0);
    if(offset >= 0 && offset < multipleChoiceAnswers.length){
      var answer = multipleChoiceAnswers[offset];
      if(answer.clicked){
        checkAnswer(answer);
      }else{
        clearAnswers();
        answer.changeClickStatus();
      }
    }
  }
};

draw = function() {
 if(multipleChoiceAnswers.length < 2){
  createMultipleChoiceAnswers();
}
if(test.over){
  background(93, 148, 81);
  noStroke();
  test.drawQuizSummary();
  bigReset.draw();
}else{
 drawOpening();
}
};
}
