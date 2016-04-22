var makeJSONCall = true;
var testIDFromHTML = 33;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
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
  width: 5,
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

 if(makeJSONCall){
  var scoreboard = new Scoreboard({

  });
  test = new PlayTest({
    plays: [],
    scoreboard: scoreboard,
    displayName: true
  });

  var formations = [];
  var offensiveFormations = [];
  var defensivePlays = [];
  var plays = [];
  var positions = [];
  playNames = [];
  $.getJSON('/quiz/players/'+ playerIDFromHTML, function(data2, jqXHR){
    currentUserTested = createUserFromJSON(data2[0]);
      currentUserTested.position = "M"; //remove when done testing
    })
  $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
    data.forEach(function(formationObject){
      var newFormation = createFormationFromJSON(formationObject);
      offensiveFormations.push(newFormation);
    })
    $.getJSON('/quiz/teams/1/defensive_formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        var newFormation = createFormationFromJSON(formationObject);
        formations.push(newFormation);
      })
      $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
        data.forEach(function(position){
          var newPlayer = createPlayerFromJSON(position);
          var formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
          var offensiveFormation = offensiveFormations.filter(function(formation){return formation.id == position.fields.formation})[0]

          if(formation){
            formation.positions.push(newPlayer);
          }
          if(offensiveFormation){
            offensiveFormation.positions.push(newPlayer);
          }
        })
        offensiveFormations.forEach(function(formation){
          formation.populatePositions();
        })
        formations.forEach(function(formation){
          formation.populatePositions();
          var defensivePlay = formation.createDefensivePlay();
          defensivePlay.establishOffensiveFormationFromArray(offensiveFormations);
          defensivePlays.push(defensivePlay);
          if(playNames.indexOf(defensivePlay.playName) < 0){
            playNames.push(defensivePlay.playName);
          }
        })
        $.getJSON('/quiz/teams/1/plays', function(data3, jqXHR){
          data3.forEach(function(play){
            var testIDArray = play.fields.tests;
            var play = createPlayFromJSON(play);
            plays.push(play);
          })
          $.getJSON('/quiz/teams/1/plays/players', function(data4, jqXHR){
            data4.forEach(function(position){
              var player = createPlayerFromJSON(position);
              positions.push(player);
            })
            plays.forEach(function(play){
              play.addPositionsFromID(positions);
              play.populatePositions();
            })
            playNames.push("Cover 3");
            playNames.push("Cover 4");
            playNames.push("Mike Laser");
            test.plays = defensivePlays;
            test.defensivePlays = defensivePlays;
            multipleChoiceAnswers = [];
            test.restartQuiz();
            test.updateProgress();
            test.updateScoreboard();
            makeJSONCall = false;
          })
        })
})
})
});
}
}

/*var sortByCreationDecreasing = function(a, b){
  var date1 = new Date(a.created_at);
  var date2 = new Date(b.created_at);
  return date2 - date1;
};*/

var sortByPlayName = function(a, b){
  var name1 = a.playName;
  var name2 = b.playName;
  if(name1.length < 1){
    return 1;
  }else if(name2.length < 1){
    return -1;
  }else if(name1 < name2){
    return -1;
  }else{
    return 1;
  }
}

function shuffle(o) {
  for(var n = 0; n < 100; n++){
    for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  }
return o;
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
      y: height / 3,
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
  var passStrength = test.getCurrentPlay().offensiveFormationObject.getPassStrength();
  var isCorrect = false;
  if((passStrength < 0 && guess === 0) || (passStrength > 0 && guess === 1) || (passStrength === 0 && guess === 2)){
    isCorrect = true;
  }if(isCorrect){
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
    var y = field.getTranslatedY(83);
    var x2 = field.getTranslatedX(53);
    var y2 = field.getTranslatedY(83);
    stroke(0, 0, 220);
    fill(0, 0, 220);
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
        checkAnswer(offset);
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
      fill(0,0,0);
      if(this === currentPlayerTested){
        fill(0, 0, 220);
      }
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  };

  if(makeJSONCall){
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
      multipleChoiceAnswers = [];
    }
  }else{
    if(multipleChoiceAnswers.length < 2 && test.getCurrentPlay()){
      var correctAnswer = test.getCurrentPlay().name;
      test.updateProgress(false);
      createMultipleChoiceAnswers(correctAnswer, 3);
      test.updateMultipleChoiceLabels();
    }
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    drawOpening();
  }
}
