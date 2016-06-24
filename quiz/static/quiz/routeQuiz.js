var setupComplete = false;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var originalPlayList = [];
var playNames;
var maxPlays = 5;
var bigReset; var resetMissed; var nextQuiz;
var currentUserTested = null;
var currentPlayerTested = null;
var currentRouteGuess = [];
var currentRouteNodes = [];
var demoDoubleClick = false;
var exitDemo = null;

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
      formations: [],
      scoreboard: scoreboard,
      displayName: true
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
    stroke(255,238,88);
    line(x1,y1,x2,y2);
    noStroke();
    fill(0, 0, 255)
    var yardsX = (abs(currentRouteGuess[0][0] - currentPlayerTested.startX))
    var yardsY = (abs(currentRouteGuess[0][1] - currentPlayerTested.startY))
    var yards = int(sqrt(yardsX * yardsX + yardsY * yardsY));
    if(currentRouteGuess.length > 1){
      text(yards, x2 + 15, y2 + 15);
    }
  }
  for(var i = 0; i < currentRouteGuess.length - 1; i++){
    x1 = field.getTranslatedX(currentRouteGuess[i][0]);
    y1 = field.getTranslatedY(currentRouteGuess[i][1]);
    var x2 = field.getTranslatedX(currentRouteGuess[i+1][0]);
    var y2 = field.getTranslatedY(currentRouteGuess[i+1][1]);
    stroke(255,238,88);
    line(x1, y1, x2, y2);
    noStroke();
    fill(0, 0, 255)
    var yardsX = (abs(currentRouteGuess[i+1][0] - currentRouteGuess[i][0]))
    var yardsY = (abs(currentRouteGuess[i+1][1] - currentRouteGuess[i][1]))
    var yards = int(sqrt(yardsX * yardsX + yardsY * yardsY));
    if(yards > 0 && i < currentRouteGuess.length - 2){
        text(yards, x2 + 15, y2 + 15);
    }

  }

  for(var i = 0; i < currentRouteNodes.length; i++){
    var node = currentRouteNodes[i];
    stroke(255,238,88);
    if(i === currentRouteNodes.length - 1){
      var prevX = currentPlayerTested.startX;
      var prevY = currentPlayerTested.startY;
      if(i > 0){
        prevX = currentRouteNodes[i-1].x;
        prevY = currentRouteNodes[i-1].y;
      }
      node.drawArrow(field, prevX, prevY);
    }else{
      node.draw(field);
    }
    noStroke();
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
      player.drawRoute(field);
    }
  }
  noStroke();
  drawCurrentRoute();
  if(currentRouteNodes){
    for(var i = 0; i < currentRouteNodes.length; i++){
      stroke(255,238,88);
      currentRouteNodes[i].draw(field);
      noStroke();
    }
  }
}

function drawScene(field){
  field.drawBackground(null, height, width);
  var play = test.getCurrentPlay();
  if(play){
    play.drawAllRoutes(field);
    play.drawAllPlayers(field);
    currentPlayerTested.breakPoints = currentRouteGuess;
    for(var i = 0; i < play.offensivePlayers.length; i++){
      play.offensivePlayers[i].runRoute();
    }
  }
};

function restartScene(){
  var play = test.getCurrentPlay();
  clearSelection();
  for (var i = 0; i < play.offensivePlayers.length; i++){
    play.offensivePlayers[i].resetToStart();
  }
};


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
      noStroke();
      textAlign(LEFT);
      textSize(22);
      noStroke();
      if(timeElapsed < 2000){
        noStroke();
        noFill();
        strokeWeight(2);
        stroke(255,238,88);

        var x = field.getTranslatedX(currentPlayerTested.startX);
        var y = field.getTranslatedY(currentPlayerTested.startY);
        var siz = field.yardsToPixels(currentPlayerTested.siz) * 1.5;
        ellipse(x, y, siz, siz);
        strokeWeight(1);
        textAlign(CENTER);
        textSize(22);
        fill(255,238,88);
        text("You are in yellow", x, y - 110);
        noStroke();
      }else if(timeElapsed < 4000){
        noStroke();
        stroke(255,238,88);
        fill(255,238,88);
        line(field.width / 2, 80, field.width/2, 20);
        triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
        noStroke();
        textAlign(LEFT);
        textSize(22);
        fill(255,238,88);
        text("Your play call is here", field.width / 2 + 20, 50);
        noStroke();
      }else {
        noStroke();
        fill(255,238,88);
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
  test.getCurrentPlay().inProgress = false;
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
    test.plays = shuffle(originalPlayList.slice());
    test.restartQuiz();
    return true;
  }else if(resetMissed.isMouseInside(field) && test.over) {
    clearSelection();
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
    if(currentRouteNodes.length > 0 && currentRouteNodes[currentRouteNodes.length - 1].isMouseInside(field)){
      if(test.showDemo){
        demoDoubleClick = true;
      }else{
        checkAnswer(field.getYardX(mouseX), field.getYardY(mouseY));
        return;
      }
    }else if(!currentPlayerTested.isMouseInside(field)){
      if(test.getCurrentPlay().inProgress){
        return;
      }
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      currentRouteGuess.push([x, y]);
      var nodeObject = new Node({
        x: x,
        y: y,
        siz: 1,
        fill: color(255,238,88)
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
      clearSelection();
      test.plays = shuffle(originalPlayList.slice());
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
      var play = test.getCurrentPlay();
      noStroke();
      fill(this.fill);
      if(this === currentPlayerTested){
        fill(255,238,88);
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
    nextQuiz.draw(field);
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
      if(test.getCurrentPlay().inProgress){
        drawScene(field);
      }else{
        drawOpening(field);
      }
    }

  }
}
