var setupComplete = false;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var formationNames;
var maxFormations = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var correctZoneFill = null;
var playerIDFromHTML = $('#player-id').data('player-id');

function setup() {
  var myCanvas = createCanvas(550, 550);
  field.height = 550;
  field.heightInYards = 54;
  field.ballYardLine = 75;

  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');
  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: 5,
    label: "Restart"
  })

  var twoDeepZone = new CoverageMap({
    name: "Two Deep Zone"
  });

  twoDeepZone.fillTwoDeepZone(field);

  if(json_seed){

    var scoreboard = new Scoreboard({

    });

    test = new PlayTest({
      plays: [],
      scoreboard: scoreboard,
      coverageMap: twoDeepZone,
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
    }

    var shuffled_plays = shuffle(defensive_plays);
    test.plays = shuffled_plays;
    test.defensivePlays = shuffled_plays;
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

//guess is a CoverageZone number
function checkAnswer(guess){
  var assignment = currentPlayerTested.zoneAssignment;
  var isCorrect = guess.type === assignment;
  if(isCorrect){
    test.getCurrentCoverageMap().clearClicks();
    test.registerAnswer(isCorrect);
  }else{
    test.updateScoreboard();
    test.registerAnswer(isCorrect);
    test.feedbackScreenStartTime = millis();
    var correctZone = test.getCurrentCoverageMap().getZoneFromIndex(currentPlayerTested.zoneAssignment)
    correctZoneFill = correctZone.fill;
    correctZone.fill = color(220, 220, 0);
  }
}


function drawFeedBackScreen(){
  //var elapsedTime = millis() - test.feedbackScreenStartTime;
  field.drawBackground(null, height, width);
  var play = test.getCurrentPlay();
  play.offensiveFormationObject.drawAllPlayers(field);
  var map = test.getCurrentCoverageMap();

  //debugger;
  if(map){
    stroke(0);
    map.draw(field);
  }

}

function drawOpening(){
  field.drawBackground(null, height, width);
  var play = test.getCurrentPlay();
  play.offensiveFormationObject.drawAllPlayers(field);
  var map = test.getCurrentCoverageMap();
  if(map){
    stroke(0);
    strokeWeight(1);
    map.draw(field);
  }
}

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return;
  }
  if (bigReset.isMouseInside(field) && test.over){
    test.restartQuiz();
  }
  else{
    var mouseYardX = field.getYardX(mouseX);
    var mouseYardY = field.getYardY(mouseY);
    var coverageMap = test.getCurrentCoverageMap();
    var clickedZone = coverageMap.getClickedZone(mouseYardX, mouseYardY);
    if(clickedZone.clicked){
      checkAnswer(clickedZone);
    }else{
      coverageMap.clearClicks();
      clickedZone.clicked = true;
    }
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
      fill(this.red, this.green, this.blue);
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(this.red, this.green, this.blue);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  };

  if(!setupComplete){
    //WAIT - still executing JSON
    background(93, 148, 81);
  }
  else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 1000){
        var map = test.getCurrentCoverageMap();
        map.clearClicks();
        test.feedbackScreenStartTime = 0;
        var correctZone = map.getZoneFromIndex(currentPlayerTested.zoneAssignment);
        if(correctZoneFill){
          correctZone.fill = correctZoneFill;
          correctZoneFill = null;
        }
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;

      }else{
        drawFeedBackScreen();
      }
    }else{
      if(!currentPlayerTested){
        currentPlayerTested = new Player({
          zoneAssignment: CoverageMap.LEFT_OUT
        });
      }
      drawOpening();
    }

  }
}
