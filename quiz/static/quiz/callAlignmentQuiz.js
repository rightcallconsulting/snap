var setupComplete = false;
var testIDFromHTML = 33;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var playNames;
var maxPlays = 5;
var originalPlayList;
var bigReset; var resetMissed; var nextQuiz;
var currentUserTested = null; var currentPlayerTested = null;
var exitDemo = null; var demoDoubleClick = false;
var calls = ["LASSO", "RODEO", "LIGHTNING", "RAINBOW", "LUCY", "ROGER"];
var delayCall = 0;

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

    originalPlayList = defensive_plays.slice();
    var shuffled_plays = shuffle(defensive_plays);
    test.plays = shuffled_plays;
    test.defensivePlays = shuffled_plays;
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

function alignPlayer(player){
  var newX = getMouseCoords()[0][0];
  var newY = getMouseCoords()[0][1];
  noStroke();
  textSize(17);
  textAlign(CENTER, CENTER);
  text(player.pos, player.x, player.y);
}

function getMouseCoords(){
  currentPlayerTested.x = field.getYardX(mouseX);
  currentPlayerTested.y = field.getYardY(mouseY);
  return[currentPlayerTested.x, currentPlayerTested.y];
}

function checkAnswer(){
  var player = test.getCurrentPlay().offensiveFormationObject.eligibleReceivers[0];
  var xDist = abs(currentPlayerTested.x - player.x);
  if(xDist < 2){
    isCorrect = true;
  }else{
    isCorrect = false;
  }
  if(isCorrect){
    currentPlayerTested = null;
    test.score++;
    test.advanceToNextPlay(this.correctAnswerMessage);
    delayCall = millis();

  }else{
    test.missedPlays.push(test.getCurrentPlay());
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
    test.feedbackScreenStartTime = millis();
    delayCall = millis();
    currentPlayerTested.fill = color(255,238,88);
  }
}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentDefensivePlay();
  play.drawAllPlayersWithOffense(field);
  currentPlayerTested.draw(field);
};

function drawOpening(){
  field.drawBackground(null, height, width);
  var play = test.getCurrentDefensivePlay();
  play.drawAllPlayersWithOffense(field);
  createCall();
  if(currentPlayerTested){
    currentPlayerTested.draw(field);
  }

}

function createCall(){
  var elapsedTime = millis() - delayCall;
  var rightCall = calls[test.questionNum];
  if(test.questionNum < 1){
    if(elapsedTime > 2500 && elapsedTime < 4000){
      fill(255,238,88);
      textAlign(CENTER);
      textSize(26);
      text(rightCall, field.width/ 2, field.width / 8);
    }
  }else if(elapsedTime > 4000 && elapsedTime < 5500) {
    fill(255,238,88);
    textAlign(CENTER);
    textSize(26);
    text(rightCall, field.width/ 2, field.width / 8);
  }
}




function drawDemoScreen(){
  noStroke();
  field.drawBackground(null, height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentDefensivePlay();
  currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
  if(play){
    play.drawAllPlayersWithOffense(field);
    currentPlayerTested.draw(field);
    var x1 = field.getTranslatedX(exitDemo.x);
    var y1 = field.getTranslatedY(exitDemo.y);
    var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
    var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
    noStroke();
    fill(255,238,88);
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
    if(currentPlayerTested){
      var x = field.getTranslatedX(currentPlayerTested.x);
      var y = field.getTranslatedY(currentPlayerTested.y);
      var siz = field.yardsToPixels(currentPlayerTested.siz) * 1.5;
      textAlign(LEFT);
      textSize(22);
      noStroke();
      if(timeElapsed < 2000){
        noStroke();
        noFill();
        stroke(255,238,88);
        strokeWeight(2);
        ellipse(x, y, siz, siz);
        strokeWeight(1);
        fill(255,238,88);
        if(x < field.width / 3){
          textAlign(LEFT);
        }else if(x > 2 * (field.width) / 3){
          textAlign(RIGHT);
        }else{
          textAlign(CENTER);
        }
        fill(255,238,88);
        text("You are in yellow", x, y - 60);
        fill(0);
        noStroke();
      }else if(timeElapsed < 4000){
        fill(255,238,88);
        stroke(255,238,88);
        line(field.width / 2, 80, field.width/2, 20);
        triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
        noStroke();
        fill(255,238,88);
        text("Your play call is here", field.width / 2 + 20, 50);
      }else if(timeElapsed > 4000 && timeElapsed < 6000){
        fill(255,238,88);
        textAlign(CENTER);
        text("Your call will appear above for 1 second.", field.width / 2, (5 * field.height) / 6);

      }else if(timeElapsed > 6000 && timeElapsed < 7500){
        fill(255,238,88);
        textAlign(CENTER);
        textSize(26);
        text("LIGHTNING", field.width/ 2, field.width / 8);
      }else{
        if(currentPlayerTested){
          noStroke();
          textSize(22);
          textAlign(CENTER);
          fill(255,238,88);
          if(demoDoubleClick){
            text("Great!  You're ready to start!\nClick anywhere to continue.", field.width / 2, (5 * field.height) / 6);
          }else{
            text("Re-position yourself, based on the call, by\ndouble-clicking on your new alignment spot.", field.width / 2, (5 * field.height) / 6);
          }
        }
      }
    }
  }
};

function setupDemoScreen(){
  test.showDemo = true;
  demoDoubleClick = false;
  currentPlayerTested = null;
  test.demoStartTime = millis();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  delayCall = millis();
  if(currentPlayerTested){
    currentPlayerTested.x = currentPlayerTested.startX;
    currentPlayerTested.y = currentPlayerTested.startY;
  }
};

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return true;
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
  }else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
    resetMissed.draw(field);
    nextQuiz.draw(field);
  }else if(test.feedbackScreenStartTime){
    var timeElapsed = millis() - test.feedbackScreenStartTime;
    if(timeElapsed < 2000){
      drawOpening();
    }else{
      test.feedbackScreenStartTime = 0;
      test.advanceToNextPlay("");
      currentPlayerTested = null;
    }
  }else if(test.showDemo){
    drawDemoScreen();
  }else{
    if(currentPlayerTested === null){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }else if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 2000){
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;
      }else{
        drawFeedbackScreen();
      }
    }else{
      drawOpening(field);
    }
  }
}
