var setupComplete = false;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var originalPlayList = [];
var playNames;
var maxPlays = 5;
var bigReset; var resetMissed;
var currentUserTested = null;
var currentPlayerTested = null;
var currentRouteGuess = [];
var currentRouteNodes = [];
var demoDoubleClick = false;
var exitDemo = null;

function setup() {
  var myCanvas = createCanvas(550, 550);
  field.height = 550;
  field.width = 550;
  field.heightInYards = 54;
  field.ballYardLine = 75;
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: 5,
    label: "Retake All"
  });

  resetMissed = new Button({
    x: bigReset.x + bigReset.width * 1.5,
    y: bigReset.y,
    width: bigReset.width,
    label: "Retake Missed"
  });

  exitDemo = new Button({
    label: "",
    x: field.getYardX(25),
    y: field.getYardY(25),
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
    currentUserTested = createUserFromJSONSeed(json_seed.player)

    var plays = [];

    for(var i = 0; i < json_seed.plays.length; i++){
      var play = createPlayFromJSONSeed(json_seed.plays[i]);
      var positionsAsPlayers = [];
      for(var j = 0; j < play.positions.length; j++){
        var position = play.positions[j];
        var player = createPlayerFromJSONSeed(position);
        positionsAsPlayers.push(player);
      }
      play.positions = positionsAsPlayers;
      play.populatePositions();
      plays.push(play);
    }

    originalPlayList = plays.slice();
    test.plays = shuffle(plays);
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

function clearSelection(){
  currentRouteGuess = [];
  currentRouteNodes = [];
  nodeObject = null;
}

function checkAnswer(){
  var isCorrect = true;
  if(currentRouteGuess.length !== currentPlayerTested.breakPoints.length){
    isCorrect = false;
  }

  for(var i = 0; isCorrect && i < currentRouteGuess.length; i++){
    var dx = abs(currentRouteGuess[i][0] - currentPlayerTested.breakPoints[i][0]);
    var dy = abs(currentRouteGuess[i][1] - currentPlayerTested.breakPoints[i][1]);
    var dist = Math.sqrt(dx*dx + dy*dy);
    if(dist > 2){
      isCorrect = false;
    }
  }

  if(isCorrect){
    clearSelection();
    currentPlayerTested = null;
    test.registerAnswer(isCorrect);
  }else{
    clearSelection();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.missedPlays.push(test.getCurrentPlay());
    test.updateScoreboard();
    test.feedbackScreenStartTime = millis();
  }

}

function drawCurrentRoute(){
  var x1 = field.getTranslatedX(currentPlayerTested.startX);
  var y1 = field.getTranslatedY(currentPlayerTested.startY);
  if(currentRouteGuess.length > 0){
    var x2 = field.getTranslatedX(currentRouteGuess[0][0]);
    var y2 = field.getTranslatedY(currentRouteGuess[0][1]);
    stroke(0, 0, 255);
    line(x1,y1,x2,y2);
    noStroke();
    fill(0, 0, 255)
  }
  for(var i = 0; i < currentRouteGuess.length - 1; i++){
    x1 = field.getTranslatedX(currentRouteGuess[i][0]);
    y1 = field.getTranslatedY(currentRouteGuess[i][1]);
    var x2 = field.getTranslatedX(currentRouteGuess[i+1][0]);
    var y2 = field.getTranslatedY(currentRouteGuess[i+1][1]);
    stroke(0, 0, 255);
    line(x1, y1, x2, y2);
    noStroke();
    fill(0, 0, 255)
  }

}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  test.getCurrentPlay().drawAllRoutes(field);
}

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
    var player = test.getCurrentPlay().eligibleReceivers[i];
    if(player !== currentPlayerTested){
      player.drawBreakPoints(field);
    }
  }
  drawCurrentRoute();
  for(var i = 0; i < currentRouteNodes.length; i++){
    stroke(220, 220, 0);
    currentRouteNodes[i].draw(field);
    noStroke();
  }

}

function drawDemoScreen(){
  field.drawBackground(null, height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentPlay();
  if(play){
    play.drawAllPlayers(field);
    var x1 = field.getTranslatedX(exitDemo.x);
    var y1 = field.getTranslatedY(exitDemo.y);
    var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
    var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
    fill(220, 0, 0);
    exitDemo.draw(field);
    textSize(30);
    textAlign(LEFT);
    text("DEMO", x2 + 5, (y1 + y2) / 2);
    stroke(0);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    line(x1, y2, x2, y1);
    strokeWeight(1);
    noStroke();

    if(currentPlayerTested){
      noStroke();
      textAlign(LEFT);
      textSize(22);
      noStroke();
      if(timeElapsed < 2000){
        noStroke();
        noFill();
        strokeWeight(2);
        stroke(220, 0, 0);

        var x = field.getTranslatedX(currentPlayerTested.startX);
        var y = field.getTranslatedY(currentPlayerTested.startY);
        var siz = field.yardsToPixels(currentPlayerTested.siz) * 1.5;

        ellipse(x, y, siz, siz);
        strokeWeight(1);
        textAlign(CENTER);
        textSize(22);
        fill(220, 0, 0);
        text("You are in blue", x - 40, y - 80);
        noStroke();
      }else if(timeElapsed < 4000){
        noStroke();
        stroke(220, 0, 0);
        fill(220, 0, 0);
        line(field.width / 2, 80, field.width/2, 20);
        triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
        noStroke();
        textAlign(LEFT);
        textSize(22);
        fill(220, 0, 0);
        text("Your play call is here", field.width / 2 + 20, 50);
        noStroke();
      }else {
        noStroke();
        fill(220, 220, 0);
        textSize(22);
        textAlign(CENTER);
        if(demoDoubleClick){
          text("Demo complete!\n Click anywhere to begin quiz", field.width / 2, (5 * field.height) / 6);
        }else if(currentRouteNodes.length > 0){
          text("Click on your next breakpoint.\nDouble click to complete demo.", field.width / 2, (5 * field.height) / 6);
        }else{
          text("Draw your route by clicking on\n your first breakpoint", field.width / 2, (5 * field.height) / 6);
        }

      }
      noStroke();
      drawCurrentRoute();
      for(var i = 0; i < currentRouteNodes.length; i++){
        stroke(220, 220, 0);
        currentRouteNodes[i].draw(field);
        noStroke();
      }
    }
  }
};


function setupDemoScreen(){
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
  currentRouteGuess = [];
  currentRouteNodes = [];
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  currentRouteGuess = [];
  currentRouteNodes = [];
};

function skipPlay(){
  clearSelection();
  test.skips++;
  currentPlayerTested = null;
  test.skippedPlays.push(test.getCurrentPlay());
  test.advanceToNextPlay(test.skippedAnswerMessage);
}


mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return true;
  }
  if(bigReset.isMouseInside(field) && test.over) {
    clearSelection();
    test.plays = originalPlayList.slice();
    test.restartQuiz();
    return true;
  }else if(resetMissed.isMouseInside(field) && test.over) {
    clearSelection();
    var newPlays = test.missedPlays.concat(test.skippedPlays);
    test.plays = newPlays;
    test.restartQuiz();
    return true;
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else if(!test.over){
    if(currentRouteNodes.length > 0 && currentRouteNodes[currentRouteNodes.length - 1].isMouseInside(field)){
      if(test.showDemo){
        demoDoubleClick = true;
      }else{
        checkAnswer(field.getYardX(mouseX), field.getYardY(mouseY));
        return;
      }
    }else if(!currentPlayerTested.isMouseInside(field)){
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      currentRouteGuess.push([x, y]);
      var nodeObject = new Node({
        x: x,
        y: y,
        siz: 1,
        fill: color(0, 0, 220)
      });
      currentRouteNodes.push(nodeObject);
    }
  }

};

keyPressed = function(){
  if(keyCode === BACKSPACE){
    if(currentRouteGuess.length > 0){
      currentRouteGuess.pop();
      currentRouteNodes.pop();
    }
    return false;
  }

};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      test.restartQuiz();
    }
  }
  if(test.showDemo){
    if(key === 'e'){
      exitDemoScreen();
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
      if(this === currentPlayerTested){
        fill(0, 0, 255);
      }
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(0, 0, 0);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  }
  if(!setupComplete){
    //WAIT - still executing JSON
  }
  else if(test.over){
    //debugger;
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
    resetMissed.draw(field);
  }else{
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    if(test.showDemo){
      drawDemoScreen();
    }else if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 1000){
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay("");
        currentPlayerTested = null;
      }else{
        drawFeedbackScreen(field);
      }
    }else{
      drawOpening();
    }

  }
}
