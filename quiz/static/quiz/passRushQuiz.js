var setupComplete = false;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var originalPlayList;
var bigReset; var resetMissed; var nextQuiz;
var currentUserTested = null;
var currentPlayerTested = null;
var currentGuess = [];
var currentNode = [];
var currentGuessNode = null;
var exitDemo = null;
var demoDoubleClick = false;

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
      displayName: true,
    });

    var formations = [];
    var offensiveFormations = [];
    var defensive_plays = [];
    var plays = [];
    var positions = [];

    currentUserTested = createUserFromJSONSeed(json_seed.player)

    for(var i = 0; i < json_seed.defensive_plays.length; i++){
      var defensive_play = createDefensivePlayFromJSONSeed(json_seed.defensive_plays[i]);
      debugger;
      var positionsAsPlayers = [];
      for(var j = 0; j < defensive_play.positions.length; j++){
        var position = defensive_play.positions[j];
        var player = createPlayerFromJSONSeed(position);
        player.unit = "defense";
        positionsAsPlayers.push(player);
      }
      defensive_play.positions = positionsAsPlayers;
      defensive_play.populatePositions();
      debugger;
      positionsAsPlayers = [];
      for(var j = 0; j < defensive_play.offensiveFormationObject.positions.length; j++){
        var position = defensive_play.offensiveFormationObject.positions[j];
        var player = createPlayerFromJSONSeed(position);
        positionsAsPlayers.push(player);
      }
      defensive_play.offensiveFormationObject.positions = positionsAsPlayers;
      defensive_play.offensiveFormationObject.populatePositions();
      defensive_plays.push(defensive_play);
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

function clearSelection(){
  currentGuess = [];
  currentNode = [];
  currentGuessNode = null;
}

function checkAnswer(x, y){
  var dx = abs(currentPlayerTested.gapXPoint - x);
  var dy = abs(currentPlayerTested.gapYPoint - y);
  var dist = Math.sqrt(dx*dx + dy*dy);
  var isCorrect = dist < 2;
  if(isCorrect){
    clearSelection();
    currentPlayerTested = null;
    test.registerAnswer(isCorrect);
  }else{
    clearSelection();
    test.registerAnswer(isCorrect);
    test.feedbackScreenStartTime = millis();
  }
}

function drawFeedbackScreen(){
  var x2 = currentPlayerTested.gapXPoint;
  var y2 = currentPlayerTested.gapYPoint;
  var x1 = currentPlayerTested.x;
  var y1 = currentPlayerTested.y;

  var pixelX1 = field.getTranslatedX(x1);
  var pixelX2 = field.getTranslatedX(x2);
  var pixelY1 = field.getTranslatedY(y1);
  var pixelY2 = field.getTranslatedY(y2);

  var node = new Node({
    x: x2,
    y: y2,
    siz: 1,
    fill: color(255,238,88)
  });

  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentDefensivePlay().drawAllPlayersWithOffense(field);
  stroke(255,238,88);
  line(pixelX1, pixelY1, pixelX2, pixelY2);
  noStroke();
  node.draw(field);
}

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayersWithOffense(field);
    for(var i = 0; i < currentNode.length; i++){
      stroke(255,238,88);
      line(field.getTranslatedX(currentPlayerTested.x), field.getTranslatedY(currentPlayerTested.y), field.getTranslatedX(currentGuessNode.x), field.getTranslatedY(currentGuessNode.y));
      currentGuessNode.draw(field);
      noStroke();
    }

  }
}

function drawScene(field){
  field.drawBackground(null, height, width);
  var play = test.getCurrentDefensivePlay();
  var players = play.defensivePlayers;
  clearSelection();
  if(play){
    currentPlayerTested = null;
    play.drawAllPlayersWithOffense(field);
    for(var i = 0; i < players.length; i++){
      if(players[i].gapYPoint !== null){
        players[i].blitzGapScene();
      }else if(players[i].zoneYPoint !== 0){
        players[i].coverZoneScene();
      }else{
        players[i].coverManScene(play.offensiveFormationObject.eligibleReceivers[1]);
      }
    }
  }
};

function restartScene(){
  var play = test.getCurrentDefensivePlay();
  if(!play.inProgress){
    for(var i = 0; i < play.defensivePlayers.length; i++){
      test.getCurrentDefensivePlay().defensivePlayers[i].resetToStart();
      currentPlayerTested = null;
    }

  }else{
    drawScene(field);
  }
};



function drawDemoScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentDefensivePlay();
  if(play){
    for(var i = 0; i < currentNode.length; i++){
      stroke(255,238,88);
      line(field.getTranslatedX(currentPlayerTested.x), field.getTranslatedY(currentPlayerTested.y), field.getTranslatedX(currentGuessNode.x), field.getTranslatedY(currentGuessNode.y));
      currentGuessNode.draw(field);
      noStroke();
    }
    play.drawAllPlayersWithOffense(field);
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

    fill(255,238,88);
    textSize(14);
    textAlign(LEFT);
    text("Click play button anytime to animate play.\nClick again to pause animation.", 20, 480);

    if(currentPlayerTested){
      var x = field.getTranslatedX(currentPlayerTested.startX);
      var y = field.getTranslatedY(currentPlayerTested.startY);
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
        textSize(22);
        textAlign(CENTER);
        text("You are in yellow", x, y - 60);
        noStroke();
      }else if(timeElapsed < 4000){
        fill(255,238,88);
        stroke(255,238,88);
        line(field.width / 2, 80, field.width/2, 20);
        triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
        noStroke();
        fill(255,238,88);
        textSize(22);
        textAlign(LEFT);
        text("Your play call is here", field.width / 2 + 20, 50);
      }else{
        stroke(255,238,88);
        fill(255,238,88);
        var clickedNode = null;
        if(currentGuessNode){
          clickedNode = currentGuessNode;
        }
        if(clickedNode){
          fill(255,238,88);
          textAlign(CENTER);
          textSize(22);
          if(demoDoubleClick){
            text("Great!  You're ready to start!\nClick anywhere to continue.", field.width / 2, (5 * field.height) / 6);
          }else{
            text("Click again to check answer", field.width / 2, (5 * field.height) / 6);
          }
        }else{
          fill(255,238,88);
          textAlign(CENTER);
          textSize(22);
          text("Click on the spot you are rushing", field.width / 2, (5 * field.height) / 6);
          noStroke();
          //text("Click demo button to exit", 20, 50);
        }
      }
    }
    noStroke();
  }
};


// pressPlayButton = function() {
//   if (test.getCurrentDefensivePlay()){
//     test.getCurrentPlay().setAllRoutes();
//     scoreboard.feedbackMessage = "";
//     test.getCurrentPlay().inProgress = true;
//   }
// };

function setupDemoScreen(){
  clearSelection();
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
  test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
  test.updateScoreboard();

};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  clearSelection();
};

mouseClicked = function() {
  debugger;
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return;
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
  }else if(!test.over){
    if(currentNode.length > 0 && currentNode[currentNode.length - 1].isMouseInside(field)){
      if(test.showDemo){
        demoDoubleClick = true;
      }else{
        checkAnswer(field.getYardX(mouseX), field.getYardY(mouseY));
        return;
      }
    }else{
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      currentGuess.push([x, y]);
      currentGuessNode = new Node({
        x: field.getYardX(mouseX),
        y: field.getYardY(mouseY),
        siz: 1,
        fill: color(255,238,88)
      });
    }
    currentNode.push(currentGuessNode);
  }
};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      test.restartQuiz();
    }
  }else{

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
      if(this.clicked){
        fill(255,238,88);
        stroke(255,238,88);
        line(field.getTranslatedX(this.x), field.getTranslatedY(this.y), field.getTranslatedX(currentPlayerTested.x), field.getTranslatedY(currentPlayerTested.y));
        noStroke();
      }
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
  }
  if(!setupComplete){
    //WAIT - still executing JSON

  }
  else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
    nextQuiz.draw(field);
    resetMissed.draw(field);
  }else{
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    if(test.showDemo){
      drawDemoScreen();
    }else if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 2000){
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;

      }else{
        drawFeedbackScreen(field);
      }
    }else{
      if(test.getCurrentDefensivePlay().inProgress){
        drawScene(field);
      }else{
        drawOpening(field);
      }
    }

  }
}
