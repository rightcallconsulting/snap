var setupComplete = false;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var originalPlayList = [];
var playNames;
var maxPlays = 5;
var bigReset; var resetMissed; var nextQuiz;
var currentUserTested = null;
var demoDoubleClick = false;
var exitDemo = null;
var answers = [];

function setup() {
  var box = document.getElementById('display-box');
  var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
  var width = box.offsWidth;
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
    setCorrectAnswers();

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

function setCorrectAnswers(){
  answers = [];
  for(var i = 0; i < test.plays.length; i++){
    var play = test.plays[i];
    var answer = [];
    for(var j = 0; j < play.eligibleReceivers.length; j++){
      var player = play.eligibleReceivers[j];
      answer.push(player.breakPoints.slice());
      player.routeCoordinates = [];
    }
    answers.push(answer);
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
  if(!test.over){
    for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
      var player = test.getCurrentPlay().eligibleReceivers[i];
      player.routeCoordinates = [];
      player.routeNodes = [];
    }
  }
}

function checkAnswer(){
  var isCorrect = true;
  var answer = answers[test.getCurrentPlayNumber()];
  for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
    var player = test.getCurrentPlay().eligibleReceivers[i];
    var correctRoute = answer[i];
    if(player.routeCoordinates.length !== correctRoute.length){
      isCorrect = false;
      break;
    }

    for(var j = 0; j < player.routeCoordinates.length; j++){
      var x1 = player.routeCoordinates[j][0];
      var y1 = player.routeCoordinates[j][1];
      var x2 = correctRoute[j][0];
      var y2 = correctRoute[j][1];
      var xDiff = abs(x2 - x1);
      var yDiff = abs(y2 - y1);
      var diff = sqrt(xDiff*xDiff + yDiff*yDiff);
      if(diff > 1.5){
        isCorrect = false;
        break;
      }
    }
    if(!isCorrect){
      break;
    }
  }

  if(isCorrect){
    clearSelection();
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

function drawCurrentRoute(player){
  player.drawRouteCoordinates(field);
}

function drawCorrectRoutes(){

  for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
    var player = test.getCurrentPlay().eligibleReceivers[i];
    var correctRoute = answers[test.getCurrentPlayNumber()][i];
    player.routeCoordinates = correctRoute;
    drawCurrentRoute(player)
  }
  
}

function drawCurrentRoutes(){

  for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
    drawCurrentRoute(test.getCurrentPlay().eligibleReceivers[i]);  
  }
  
}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  drawCorrectRoutes();
  //test.getCurrentPlay().drawAllRoutes(field);
}

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  drawCurrentRoutes();
  
  noStroke();
  
}

function drawScene(field){
  field.drawBackground(null, height, width);
  var play = test.getCurrentPlay();
  if(play){
    play.drawAllRoutes(field);
    play.drawAllPlayers(field);
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

    /*if(currentPlayerTested){
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
      drawCurrentRoutes();
    }*/
  }
};


function setupDemoScreen(){
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  test.getCurrentPlay().inProgress = false;
};

function skipPlay(){
  clearSelection();
  test.skips++;
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
    setCorrectAnswers();
    test.restartQuiz();
    return true;
  }else if(resetMissed.isMouseInside(field) && test.over) {
    clearSelection();
    var newPlays = test.missedPlays.concat(test.skippedPlays);
    if(newPlays.length < 1){
      newPlays = originalPlayList.slice();
    }
    test.plays = shuffle(newPlays);
    setCorrectAnswers();
    test.restartQuiz();
    return true;
  }else if(nextQuiz.isMouseInside(field) && test.over) {
    //Advance to next quiz or exit to dashboard
    window.location.href = "/playbook";
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else if(!test.over){
    var receiverClicked = test.getCurrentPlay().mouseInReceiverOrNode(field)[0];
    var receiverSelected = test.getCurrentPlay().findSelectedWR();
    var nodeClicked = null;
    if(false){//currentRouteNodes.length > 0 && currentRouteNodes[currentRouteNodes.length - 1].isMouseInside(field)){
      if(test.showDemo){
        demoDoubleClick = true;
      }else{
        checkAnswer();
        return;
      }
    }else if(receiverClicked){
      if(receiverClicked.clicked){
        receiverClicked = false;
      }else{
        test.getCurrentPlay().clearSelectedReceivers();
        receiverClicked.clicked = true;  
      }
      

    }else if(receiverSelected){
      if(test.getCurrentPlay().inProgress){
        return;
      }
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      receiverSelected.routeCoordinates.push([x, y]);
      
      var nodeObject = new Node({
        x: x,
        y: y,
        siz: 1,
        fill: color(255,238,88)
      });
      receiverSelected.routeNodes.push(nodeObject);
    }
  }

};

keyPressed = function(){
  if(keyCode === BACKSPACE && !test.over){
    var selectedWR = test.getCurrentPlay().findSelectedWR();
    if(selectedWR && selectedWR.routeCoordinates.length > 0){
      selectedWR.routeCoordinates.pop();
      selectedWR.routeNodes.pop();
    }
    return false;
  }

};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      clearSelection();
      test.plays = shuffle(originalPlayList.slice());
      setCorrectAnswers();
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
      if(this.clicked){
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
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
    resetMissed.draw(field);
    nextQuiz.draw(field);
  }else{
    if(test.showDemo){
      drawDemoScreen();
    }else if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 1000){
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay("");
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
