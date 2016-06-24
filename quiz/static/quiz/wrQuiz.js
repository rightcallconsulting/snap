var setupComplete = false;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var originalPlayList;
var bigReset; var resetMissed; var nextQuiz;
var exitDemo = null;
var demoDoubleClick = false;
var scene = false;

function setup() {
  var box = document.getElementById('display-box');
  var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
  var width = box.offsetWidth;
  var myCanvas = createCanvas(width, height);
  field.height = height;
  field.width = width;
  field.heightInYards = 54;
  field.ballYardLine = 75;
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  window.onresize=function(){
    var box = document.getElementById('display-box');
    var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
    var width = box.offsetWidth;
    resizeCanvas(width, height);
    field.height = height;
    field.width = width;
    resizeJSButtons();
  }
  multipleChoiceAnswers = [];
  var buttonWidth = field.heightInYards * field.width / field.height / 6;
  bigReset = new Button({
    x: field.getYardX(width*0.25) - buttonWidth / 2,
    y: field.getYardY(height*0.8),
    width: buttonWidth,
    label: "Retake All"
  })

  resetMissed = new Button({
    x: field.getYardX(width*0.5) - buttonWidth / 2,
    y: bigReset.y,
    width: bigReset.width,
    label: "Retake Missed"
  })

  nextQuiz = new Button({
    x: field.getYardX(width*0.75) - buttonWidth / 2,
    y: bigReset.y,
    width: bigReset.width,
    label: "Exit"
  })

  exitDemo = new Button({
    label: "",
    x: field.getYardX(width*0.1),
    y: field.getYardY(height*0.1),
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

    originalPlayList = plays.slice();
    test.plays = shuffle(plays);
    multipleChoiceAnswers = [];
    test.restartQuiz();
    test.updateScoreboard();
    setupComplete = true;
  }
}

function resizeJSButtons(){
  var buttonWidth = field.heightInYards * field.width / field.height / 6;
  bigReset.x =  field.getYardX(width*0.25) - buttonWidth/2;
  bigReset.y = field.getYardY(height*0.8);
  bigReset.width = buttonWidth;

  resetMissed.x =  field.getYardX(width*0.5) - buttonWidth/2;
  resetMissed.y = bigReset.y;
  resetMissed.width = bigReset.width;

  nextQuiz.x =  field.getYardX(width*0.75) - buttonWidth/2;
  nextQuiz.y = bigReset.y;
  nextQuiz.width = bigReset.width;

  exitDemo.x =  field.getYardX(width*0.1);
  exitDemo.y = field.getYardY(height*0.1);

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

function checkAnswer(guess){
  var isCorrect = test.getCurrentPlay().name === guess.label;
  registerAnswer(isCorrect);
};

function drawOpening(){
  field.drawBackground(null, height, width);
  test.getCurrentPlay().drawAllRoutes(field);
  test.getCurrentPlay().drawBlockingAssignmentObjects(field);
  test.getCurrentPlay().drawRunAssignments(field);
  test.getCurrentPlay().drawAllPlayers(field);
};

<<<<<<< Updated upstream
=======
function drawFeedbackScreen(){
  field.drawBackground(null, height, width);
  test.getCurrentPlay().drawAllRoutes(field);
  test.getCurrentPlay().drawBlockingAssignmentObjects(field);
  test.getCurrentPlay().drawRunAssignments(field);
  test.getCurrentPlay().drawAllPlayers(field);
};

>>>>>>> Stashed changes
function drawScene(field){
  scene = true;
  field.drawBackground(null, height, width);
  clearMultipleChoiceAnswers();
  var play = test.getCurrentPlay();
<<<<<<< Updated upstream
  if(play){
    play.drawAllRoutes(field);
    play.drawAllPlayers(field);
    var dist = test.getCurrentPlay().eligibleReceivers[2].breakPoints[0][1] - Math.abs(test.getCurrentPlay().eligibleReceivers[2].y);

    var receivers = play.eligibleReceivers;
    for(var i = 0; i < receivers.length; i++){
      receivers[i].runRoute();
      if(Math.abs(dist) <= 1){
        drawPauseScene();

      }
    }
    
  }
=======
  var receivers = play.eligibleReceivers;
  if(play){
    play.drawAllRoutes(field);
    play.drawAllPlayers(field);
    
    var dx = Math.abs(play.eligibleReceivers[2].breakPoints[0][0] - play.eligibleReceivers[2].x);
    var dy = Math.abs(play.eligibleReceivers[2].breakPoints[0][1] - play.eligibleReceivers[2].y);
    var dist = Math.sqrt(dx*dx + dy*dy);
    
    for(var i = 0; i < receivers.length; i++){
      if(Math.abs(dist) <= 0.5){
        drawPauseScene(field);
      }else{
        receivers[i].runRoute();
      }
    }

  }
  
>>>>>>> Stashed changes
};



function restartScene(){
  var play = test.getCurrentPlay();
  for (var i = 0; i < play.offensivePlayers.length; i++){
    play.offensivePlayers[i].resetToStart();
  }
};

function drawDemoScreen(){
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
    exitDemo.draw(field);
    textSize(22);
    textAlign(LEFT);
    text("DEMO", x2 + 5, (y1 + y2) / 2);
    stroke(0);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    line(x1, y2, x2, y1);
    strokeWeight(1);
    noStroke();

    var playButtonX = 85;
    var playButtonY = 400;

    fill(255,238,88);
    stroke(255,238,88);
    strokeWeight(2);
    line(playButtonX, playButtonY, playButtonX, playButtonY + 80);
    triangle(85, 480, 105, 460, 65, 460);

    textAlign(LEFT);
    textSize(18);
    strokeWeight(0);
    text("Click play button anytime to animate play.\nClick again to pause animation.", 100, 420);

    var x = field.getTranslatedX(49);
    var y = field.getTranslatedY(85);
    var x2 = field.getTranslatedX(66);
    var y2 = field.getTranslatedY(85);
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
    textSize(18);
    textAlign(RIGHT);
    strokeWeight(0);
    if(demoDoubleClick){
      text("Demo Complete!\nClick anywhere to exit.", x - 20, y - 115);
    }else if(clicked){
      text("Click again to check answer.", x - 20, y - 115);
    }else{
      text("Select the correct play by \ndouble clicking button.", x - 20, y - 115);
    }
    strokeWeight(1);
  }
};

function setupDemoScreen(){
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
  clearMultipleChoiceAnswers();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  clearMultipleChoiceAnswers();
};

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }
  if(bigReset.isMouseInside(field) && test.over) {
    test.plays = shuffle(originalPlayList.slice());
    test.restartQuiz();
    return true;
  }else if(resetMissed.isMouseInside(field) && test.over) {
    var newPlays = test.missedPlays.concat(test.skippedPlays);
    if(newPlays.length < 1){
      newPlays = originalPlayList.slice();
    }
    test.plays = shuffle(newPlays);
    test.restartQuiz();
    return true;
  }else if(nextQuiz.isMouseInside(field) && test.over) {
    //Advance to next quiz or exit to dashboard
    window.location.href = "/playbook";
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

<<<<<<< Updated upstream
drawPauseScene = function(){
  field.drawBackground(null, height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  test.getCurrentPlay().drawAllRoutes(field);
  //test.getCurrentPlay().drawBlockingAssignmentObjects(field);
  //test.getCurrentPlay().drawRunAssignments(field);

  
  for (var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
    

    fill(220, 220, 0);
    text("Click on your next breakPoint", 100, 100 );
  }
=======
drawPauseScene = function(field){
  field.drawBackground(null, height, width);
  test.getCurrentPlay().inProgress = false;
  test.scoreboard.fill = color(220, 100, 0);
  textSize(24);
  
  var play = test.getCurrentPlay();
  play.drawAllPlayers(field);
  play.drawAllRoutes(field);
  //test.getCurrentPlay().drawBlockingAssignmentObjects(field);
  test.getCurrentPlay().drawRunAssignments(field);
>>>>>>> Stashed changes
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
        clearMultipleChoiceAnswers();
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

};


if(!setupComplete){
    //WAIT - still executing JSON
  }else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
    nextQuiz.draw(field);
    resetMissed.draw(field);
  }else{
    if(multipleChoiceAnswers.length < 2 && test.getCurrentPlay()){
      var correctAnswer = test.getCurrentPlay().name;
      createMultipleChoiceAnswers(correctAnswer,3);
      test.updateProgress(false);
      test.updateMultipleChoiceLabels();
    }
    if(test.feedbackScreenStartTime){
      var timeElapsed = millis() - test.feedbackScreenStartTime;
      if(timeElapsed > 1000){
        clearMultipleChoiceAnswers();
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay("");
      }else{
<<<<<<< Updated upstream
        drawOpening(field);
=======
        drawFeedbackScreen(field);
>>>>>>> Stashed changes
      }
    }else{
      if(test.getCurrentPlay().inProgress){
        drawScene(field);

      }else{
        drawOpening(field);
      }
    }
  }
};
