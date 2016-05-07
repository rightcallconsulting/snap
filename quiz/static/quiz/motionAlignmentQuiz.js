var setupComplete = false;
var testIDFromHTML = 33;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var exitDemo = null;
var demoDoubleClick = false;
var motionPlayer = null;

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
  }

  exitDemo = new Button({
    label: "",
    x: 14,
    y: 94,
    height: 1.5,
    width: 1.5,
    clicked: false,
    fill: color(255, 255, 255)
  });

  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: 5,
    label: "Restart"
  })

  if(json_seed){

    var scoreboard = new Scoreboard({

    });
    test = new PlayTest({
      plays: [],
      scoreboard: scoreboard,
      displayName: true
    });
    var formations = [];
    var offensiveFormations = [];
    var defensive_plays = [];
    var plays = [];
    var positions = [];
    playNames = ["LEFT", "RIGHT", "BALANCED"];

    currentUserTested = createUserFromJSONSeed(json_seed.player)

    for(var i = 0; i < json_seed.defensive_formations.length; i++){
      var defensive_play = createDefensivePlayFromJSONSeed(json_seed.defensive_formations[i]);
      var positionsAsPlayers = [];
      for(var j = 0; j < defensive_play.positions.length; j++){
        var position = defensive_play.positions[j];
        var player = createPlayerFromJSONSeed(position);
        player.unit = "defense";
        positionsAsPlayers.push(player);
      }
      defensive_play.positions = positionsAsPlayers;
      defensive_play.populatePositions();
      positionsAsPlayers = [];
      for(var j = 0; j < defensive_play.offensiveFormationObject.positions.length; j++){
        var position = defensive_play.offensiveFormationObject.positions[j];
        var player = createPlayerFromJSONSeed(position);
        positionsAsPlayers.push(player);
      }
      defensive_play.offensiveFormationObject.positions = positionsAsPlayers;
      defensive_play.offensiveFormationObject.populatePositions();
      defensive_plays.push(defensive_play);
      playNames.push(defensive_play.name);
    }

    var shuffled_plays = shuffle(defensive_plays);
    test.plays = shuffled_plays;
    test.defensivePlays = shuffled_plays;
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

function createMotion(player){
  var play = test.getCurrentDefensivePlay().offensiveFormationObject;
  var i = 1;
  while(i < play.eligibleReceivers.length && (player.position !== "WR" || player.startY > play.oline[2].startY - 2)){
    player = play.eligibleReceivers[i];
    i++;
  }
  motionPlayer = player;
  var dx = -20;
  if(player.startX < play.oline[2].startX){
    dx = -dx;
  }
  player.motionCoords.push([player.startX + dx, player.startY]);
}

function alignPlayer(player){
  var newX = getMouseCoords()[0][0];
  var newY = getMouseCoords()[0][1];
  noStroke();
  textSize(17);
  textAlign(CENTER, CENTER);
  text(player.pos, player.x, player.y);
}

function clearAnswers(){


}

function getMouseCoords(){
  currentPlayerTested.x = field.getYardX(mouseX);
  currentPlayerTested.y = field.getYardY(mouseY);
  return[currentPlayerTested.x, currentPlayerTested.y];
};

function checkAnswer(){
    var xDist = abs(currentPlayerTested.x - motionPlayer.x);
    if(xDist < 2){
      isCorrect = true;
    }else{
      isCorrect = false;
    }

  if(isCorrect){
    currentPlayerTested = null;
    test.registerAnswer(isCorrect);
  }else{
    clearAnswers();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
    test.feedbackScreenStartTime = millis();
  }
}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayersWithOffense(field);
  }
};

function drawOpening(){
  field.drawBackground(null, height, width);
  var play = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayersWithOffense(field);
  }
  createMotion(test.getCurrentDefensivePlay().offensiveFormationObject.eligibleReceivers[0]); 
}

function drawDemoScreen(){
  noStroke();
  field.drawBackground(null, height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayersWithOffense(field);
    var x1 = field.getTranslatedX(exitDemo.x);
    var y1 = field.getTranslatedY(exitDemo.y);
    var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
    var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
    noStroke();
    fill(255,238,88);
    exitDemo.draw(field);
    textSize(22);
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
    var y = field.getTranslatedY(83);
    var x2 = field.getTranslatedX(53);
    var y2 = field.getTranslatedY(83);
    stroke(255,238,88);
    fill(255,238,88);
    strokeWeight(2);
    line(x, y, x2, y2);
    strokeWeight(1);
    triangle(x2, y2, x2 - 20, y2 + 20, x2 - 20, y2 - 20);
    var clicked = false;
    textSize(20);
    textAlign(CENTER);
    if(demoDoubleClick){
      text("Demo Complete!\nClick anywhere to exit.", x - 70, y - 110);
    }else if(clicked){
      text("Click again to check answer.", x - 70, y - 110);
    }else{
      text("Select the correct play by \ndouble clicking button.", x - 70, y - 110);
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
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }
  if(bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else{
    var xDist = abs(currentPlayerTested.x - field.getYardX(mouseX));
    var yDist = abs(currentPlayerTested.y - field.getYardY(mouseY));
    fullDist = sqrt(xDist * xDist + yDist * yDist);
    if(fullDist > 1){
      alignPlayer(currentPlayerTested);
    }else{
      if(test.showDemo){
        if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
          demoDoubleClick = true;
        }else{
          return;
        }
      }else{
        checkAnswer();
      }
    }
    
  }
};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      test.restartQuiz();
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
      this.runMotion();
      fill(this.fill);
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(0,0,0);
      if(this === currentPlayerTested){
        fill(255,238,88);
      }
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  };

  if(!setupComplete){
    //WAIT - still executing JSON
  }else if(test.showDemo){
    drawDemoScreen();
  }
  else if(test.over){
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
      currentPlayerTested = null;
    }
  }else{
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    drawOpening();
  }
}
