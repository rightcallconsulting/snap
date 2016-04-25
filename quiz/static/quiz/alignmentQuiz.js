var setupComplete = false;
var testIDFromHTML = 33; //filler
var playerIDFromHTML = $('#player-id').data('player-id')
var test;
var maxFormations = 5;
var bigReset;
var currentPlayerTested = null;
var currentUserTested = null;
var answers = [];
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

  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: field.pixelsToYards(50),
    label: "Restart"
  })

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
    test = new FormationTest({
      formations: [],
      scoreboard: scoreboard,
      displayName: true
    });
    currentUserTested = createUserFromJSONSeed(json_seed.player)

    var formations = [];
    answers = [];

    for(var i = 0; i < json_seed.formations.length; i++){
      var formation = createFormationFromJSONSeed(json_seed.formations[i]);
      var positionsAsPlayers = [];
      for(var j = 0; j < formation.positions.length; j++){
        var position = formation.positions[j];
        var player = createPlayerFromJSONSeed(position);
        positionsAsPlayers.push(player);
      }
      formation.positions = positionsAsPlayers;
      formation.populatePositions();
      formations.push(formation);
    }


    var shuffled_formations = shuffle(formations);

    for(var i = 0; i < shuffled_formations.length; i++){
      var formation = shuffled_formations[i];
      for(var j = 0; j < formation.offensivePlayers.length; j++){
        var p = formation.offensivePlayers[j];
        if(p.pos === currentUserTested.position){
          answers.push([p.x, p.y]);

          var oldCopy = formation.offensivePlayers.slice();
          formation.offensivePlayers = formation.offensivePlayers.slice(0, j);
          formation.offensivePlayers = formation.offensivePlayers.concat(oldCopy.slice(j+1));
          break;
        }
      }
    }

    test.formations = shuffled_formations;
    multipleChoiceAnswers = [];
    test.restartQuiz();
    test.updateScoreboard();
    setupComplete = true;
  }
}

var sortByCreationDecreasing = function(a, b){
  var date1 = new Date(a.created_at);
  var date2 = new Date(b.created_at);
  return date2 - date1;
};

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

function checkAnswer(){
  var answer = answers[test.questionNum];
  var dx = Math.abs(answer[0] - currentPlayerTested.x);
  var dy = Math.abs(answer[1] - currentPlayerTested.y);
  var dist = Math.sqrt(dx*dx+dy*dy);

  var isCorrect = (dist < 3);
  //debugger;
  if(isCorrect){
    currentPlayerTested = null;
    test.registerAnswer(isCorrect);
  }else{
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
    test.feedbackScreenStartTime = millis();
    currentPlayerTested.x = answers[test.questionNum][0]
    currentPlayerTested.y = answers[test.questionNum][1]
    currentPlayerTested.fill = color(220, 220, 0);
  }
}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentFormation(), height, width);
  test.getCurrentFormation().drawAllPlayers(field);
  currentPlayerTested.draw(field);

};

function drawOpening(){
  field.drawBackground(null, height, width);
  test.getCurrentFormation().drawAllPlayers(field);
  if(currentPlayerTested){
    currentPlayerTested.draw(field);
  }
};

function drawDemoScreen(){
  noStroke();
  field.drawBackground(null, height, width);
  var answer = answers[test.questionNum];
  var timeElapsed = millis() - test.demoStartTime;
  var formation = test.getCurrentFormation();
  if(formation){
    formation.drawAllPlayers(field);
    var x1 = field.getTranslatedX(exitDemo.x);
    var y1 = field.getTranslatedY(exitDemo.y);
    var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
    var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
    noStroke();
    fill(220,0,0);
    exitDemo.draw(field);
    textSize(30);
    textAlign(LEFT);
    text("DEMO", x2 + 5, (y1 + y2) / 2);
    stroke(0);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    line(x1, y2, x2, y1);
    strokeWeight(1);
    if(timeElapsed < 2000){
      noStroke();
      textSize(22);
      textAlign(LEFT);
      fill(220,0,0);
      stroke(220, 0, 0);
      line(field.width / 2, 80, field.width/2, 20);
      triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
      noStroke();
      fill(220,0,0);
      text("Your play call is here", field.width / 2 + 20, 50);
      noStroke();
    }else{
      if(currentPlayerTested){
        currentPlayerTested.draw(field);
        noStroke();
        textSize(22);
        textAlign(CENTER);
        fill(220, 220, 0);
        if(demoDoubleClick){
          text("Great!  You're ready to start!\nClick anywhere to continue.", field.width / 2, (5 * field.height) / 6);
        }else{
          text("Click again to check answer", field.width / 2, (5 * field.height) / 6);
        }
      }else{
        noStroke();
        textSize(22);
        textAlign(CENTER);
        fill(220, 220, 0);
        text("Click on the spot you are suppose to line up.", field.width / 2, (5 * field.height) / 6);
        noStroke();
      }
    }
  }
};

function setupDemoScreen(){
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
  currentPlayerTested = null;
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  currentPlayerTested = null;
};

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return true;
  }
  if (bigReset.isMouseInside(field) && test.over){
    test.restartQuiz();
    return true;
  }else if(test.showDemo && exitDemo.isMouseInside(field) && currentPlayerTested || demoDoubleClick){
    exitDemoScreen();
  }else{
    var y = field.getYardY(mouseY);
    if(y > field.ballYardLine - 1){
      y = field.ballYardLine - 1;
    }
    if(currentPlayerTested){
      if(currentPlayerTested.isMouseInside(field)){
        if(test.showDemo){
          demoDoubleClick = true;
        }else{
          checkAnswer();
        }
      }else{
        currentPlayerTested.x = field.getYardX(mouseX);
        currentPlayerTested.y = y;
      }
    }else{
      currentPlayerTested = new Player({
        x: field.getYardX(mouseX),
        y: y,
        fill: color(0, 0, 220),
        pos: currentUserTested.position,
        num: currentUserTested.num,
      });
    }
  }
};
// in mouse clicked do stuff using test player
// when click on test player ... checking the answer
// when no test player, clicks to place 11th man
// when click and test player and not inside him...move the player


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
      if(this === currentPlayerTested){
        fill(255);
      }
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
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
  }
  else if(test.over){
    //debugger;
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(test.showDemo){
      drawDemoScreen();
    }else if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 2000){
        test.feedbackScreenStartTime = 0;
        test.advanceToNextFormation("");
        currentPlayerTested = null;
      }else{
        drawFeedbackScreen();
      }
    }else{
      drawOpening(field);
    }
  }
}
