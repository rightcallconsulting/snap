var setupComplete = false;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var bigReset;
var exitDemo = null;
var demoDoubleClick = false;

function setup() {
  var myCanvas = createCanvas(550, 550);
  field.height = 550;
  field.width = 550;
  field.heightInYards = 54;
  field.ballYardLine = 75;
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  multipleChoiceAnswers = [];
  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: field.heightInYards / 6,
    label: "Restart"
  })

  exitDemo = new Button({
    label: "",
    x: 14,
    y: 94,
    height: 1.5,
    width: 1.5,
    clicked: false,
    fill: color(255, 255, 255)
  });

  if(json_seed){
    var scoreboard = new Scoreboard({

    });
    test = new PlayTest({
      formations: [],
      scoreboard: scoreboard,
      displayName: false
    });

    var plays = [];
    playNames = [];

    for(var i = 0; i < json_seed.length; i++){
      var play = createPlayFromJSONSeed(json_seed[i]);
      var positionsAsPlayers = [];
      for(var j = 0; j < play.positions.length; j++){
        var position = play.positions[j];
        var player = createPlayerFromJSONSeed(position);
        positionsAsPlayers.push(player);
      }
      play.positions = positionsAsPlayers;
      play.populatePositions();
      if(play.name && play.name !== ""){
          playNames.push(play.name);
      }
      plays.push(play);
    }

    test.plays = shuffle(plays);
    multipleChoiceAnswers = [];
    test.restartQuiz();
    test.updateScoreboard();
    setupComplete = true;
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function createMultipleChoiceAnswers(correctAnswer, numOptions){
  var correctIndex = Math.floor((Math.random() * numOptions));
  document.getElementById('correct-answer-index').innerHTML = str(correctIndex+1);
  multipleChoiceAnswers = [];
  var availableNames = playNames.slice();
  shuffle(availableNames);
  var i = 0;
  while(multipleChoiceAnswers.length < numOptions){
    var label = availableNames[i];
    if(multipleChoiceAnswers.length === correctIndex){
      label = correctAnswer;
    }else if(label === correctAnswer){
      i++;
      label = availableNames[i];
    }
    multipleChoiceAnswers.push(new MultipleChoiceAnswer({
      x: 50 + multipleChoiceAnswers.length * width / (numOptions+1),
      y: height - 60,
      width: width / (numOptions + 2),
      height: 50,
      label: label,
      clicked: false
    }));
    i++;
  }
}

function clearAnswers(){
  for(var i = 0; i < multipleChoiceAnswers.length; i++){
    var a = multipleChoiceAnswers[i];
    if(a.clicked){
      a.changeClickStatus();
    }
  }
}

function checkAnswer(guess){
  var isCorrect = test.getCurrentPlay().name === guess.label;
  registerAnswer(isCorrect);
}

function drawOpening(){
  field.drawBackground(null, height, width);
  test.getCurrentPlay().drawAllRoutes(field);
  test.getCurrentPlay().drawAllPlayers(field);
};

function drawDemoScreen(){
  noStroke();
  field.drawBackground(null, height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentPlay();
  if(play){
    play.drawAllRoutes(field);
    play.drawAllPlayers(field);
    var x1 = field.getTranslatedX(exitDemo.x);
    var y1 = field.getTranslatedY(exitDemo.y);
    var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
    var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
    noStroke();
    fill(220,0,0);
    exitDemo.draw(field);
    textSize(30);
    text("DEMO", field.width / 6, field.height / 6);
    stroke(0);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    line(x1, y2, x2, y1);
    strokeWeight(1);
    noStroke();
    textAlign(LEFT);
    textSize(22);
    noStroke();

    var x = field.getTranslatedX(43);
    var y = field.getTranslatedY(80);
    var x2 = field.getTranslatedX(53);
    var y2 = field.getTranslatedY(80);
    stroke(255,238,88);
    fill(255,238,88);
    strokeWeight(2);
    line(x, y, x2, y2);
    strokeWeight(1);
    triangle(x2, y2, x2 - 20, y2 + 20, x2 - 20, y2 - 20);

    var clicked = false;
    for(var i = 1; i <= multipleChoiceAnswers.length; i++){
      var answer = document.getElementById("mc-button-"+i);
      if(answer && answer.classList.contains('clicked')){
        clicked = true;
      }
    }
    textSize(20);
    textAlign(CENTER);
    if(demoDoubleClick){
        text("Demo Complete!\nClick anywhere to exit.", x - 70, y - 50);

    }else if(clicked){
      text("Click again to check answer.", x - 70, y - 50);
    }else{
      text("Select the correct play by \ndouble clicking button.", x - 70, y - 50);
    }
  }
};

function setupDemoScreen(){
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
  clearAnswers();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  clearAnswers();
};

mouseClicked = function() {
  if(!setupComplete){
    return false;
  }
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }
  if(bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else{
    if(test.showDemo){
      if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
        demoDoubleClick = true;
      }else{
        return;
      }
    }
  }
};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      test.restartQuiz();
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

function draw() {
  Player.prototype.draw = function(field){
    var x = field.getTranslatedX(this.x);
    var y = field.getTranslatedY(this.y);
    var siz = field.yardsToPixels(this.siz);
    if(this.unit === "offense"){
      noStroke();
      fill(this.fill);
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(this.fill);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  }
  if(!setupComplete){
    //WAIT - still executing JSON
  }
  else if(test.showDemo){
    drawDemoScreen();
  }else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else if(test.feedbackScreenStartTime){
    var timeElapsed = millis() - test.feedbackScreenStartTime;
    if(timeElapsed < 2000){
      drawOpening();
    }else{
      test.feedbackScreenStartTime = 0;
      test.advanceToNextPlay("");
      multipleChoiceAnswers = [];
    }
  }else{
    if(multipleChoiceAnswers.length < 2 && test.getCurrentPlay()){
      var correctAnswer = test.getCurrentPlay().name;
      createMultipleChoiceAnswers(correctAnswer,3);
      test.updateMultipleChoiceLabels();
    }
    drawOpening(field);
  }
};
