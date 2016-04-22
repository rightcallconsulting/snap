var makeJSONCall = true;
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
var oldFill = null;

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
    x: field.getYardX(25),
    y: field.getYardY(25),
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
              for(var i = 0; i < defensivePlays.length; i++){
                var play = defensivePlays[i];
                var inCoverage = false;
                for(var j = 0; j < play.defensivePlayers.length; j++){
                  var p = play.defensivePlayers[j];
                  if(p.pos === currentUserTested.position){
                      //check if he's in coverage
                      if(p.CBAssignment){
                        inCoverage = true;
                      }
                      break;
                    }
                  }
                  if(!inCoverage){
                    defensivePlays = defensivePlays.slice(0, i).concat(defensivePlays.slice(i+1));
                    i--;
                  }
                }

                test.plays = defensivePlays;
                test.defensivePlays = defensivePlays;
                test.restartQuiz();
                test.updateScoreboard();
                test.updateProgress();
                makeJSONCall = false;
              })
})
})
})

});

}
}

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

function clearSelections(){
  var play = test.getCurrentDefensivePlay();
  if(play){
    for(var i = 0; i < play.offensiveFormationObject.eligibleReceivers.length; i++){
      var p = play.offensiveFormationObject.eligibleReceivers[i];
      p.clicked = false;
    }
  }
}

function checkAnswer(guess){

  var p = test.getCurrentDefensivePlay().defensivePlayers.filter(function(player){return player.pos === currentUserTested.position})[0];
  var isCorrect = guess === p.coverageAssignment[0];
  if(isCorrect){
    clearSelections();
    currentPlayerTested = null;
    test.registerAnswer(isCorrect);
  }else{
    clearSelections();
    var assignment = currentPlayerTested.coverageAssignment[0];
    oldFill = assignment.fill;
    assignment.fill = color(220, 220, 0);
    test.feedbackScreenStartTime = millis();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
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
    textAlign(LEFT);
    text("DEMO", x2 + 5, (y1 + y2) / 2);
    stroke(0);
    strokeWeight(2);
    line(x1, y1, x2, y2);
    line(x1, y2, x2, y1);
    strokeWeight(1);
    noStroke();

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
        stroke(220,0,0);
        strokeWeight(2);
        ellipse(x, y, siz, siz);
        strokeWeight(1);
        fill(220, 0, 0);
        text("You are in blue", x + siz/2 + 5, y - 20);
        fill(0);
        //text("Click demo button to exit", 20, 50);
        noStroke();
      }else if(timeElapsed < 4000){
        fill(220,0,0);
        stroke(220, 0, 0);
        line(field.width / 2, 80, field.width/2, 20);
        triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
        noStroke();
        fill(220,0,0);
        text("Your play call is here", field.width / 2 + 20, 50);
      }else{
        stroke(220, 220, 0);
        fill(220, 220, 0);
        var clickedReceiver = null;
        for(var i = 0; i < play.offensiveFormationObject.eligibleReceivers.length; i++){
          var receiver = play.offensiveFormationObject.eligibleReceivers[i];
          if(receiver.clicked){
            clickedReceiver = receiver;
          }
        }
        if(clickedReceiver === null){
          for(var i = 0; i < play.offensiveFormationObject.eligibleReceivers.length; i++){
            var receiver = play.offensiveFormationObject.eligibleReceivers[i];
            var x = field.getTranslatedX(receiver.startX);
            var y = field.getTranslatedY(receiver.startY);
            var siz = field.yardsToPixels(receiver.siz);
            y -= siz / 2;
            line(x, y - 80, x, y - 15);
            triangle(x - 15, y - 15, x + 15, y - 15, x, y);
          }
        }
        stroke(0);
        if(clickedReceiver){
          textAlign(CENTER);
          if(demoDoubleClick){
            text("Great!  You're ready to start!\nClick anywhere to continue.", field.width / 2, (5 * field.height) / 6);
          }else{
            text("Click again to check answer", field.width / 2, (5 * field.height) / 6);
          }

          fill(0);
          //text("Click demo button to exit", 20, 50);
        }else{
          textAlign(CENTER);
          text("Click on the player you are assigned to cover", field.width / 2, (5 * field.height) / 6);
          fill(0);
          noStroke();
          //text("Click demo button to exit", 20, 50);
        }
      }
      noStroke();
    }
  }
}

function setupDemoScreen(){
  clearSelections();
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  clearSelections();
};

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return true;
  }
  if(bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
    return true;
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else if(!test.over){
    var play = test.getCurrentDefensivePlay();
    for(var i = 0; i < play.offensiveFormationObject.eligibleReceivers.length; i++){
      var answer = play.offensiveFormationObject.eligibleReceivers[i];
      if(answer.clicked){
        if(answer.isMouseInside(field)){
          if(test.showDemo){
            demoDoubleClick = true;
          }else{
            checkAnswer(answer);
            return;
          }
        }else{
          clearSelections();
          answer.clicked = true;
        }
      }else{
        if(answer.isMouseInside(field)){
          clearSelections();
          answer.clicked = true;
          return;
        }
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
        fill(220, 220, 0);
        stroke(220, 220, 0);
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
        fill(0, 0, 220);
      }
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  };
  if(makeJSONCall){
    //WAIT - still executing JSON
    background(93, 148, 81);
  }
  else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
      currentPlayerTested.coverageAssignment = [test.getCurrentPlay().offensiveFormationObject.eligibleReceivers[1]];
    }
    if(test.showDemo){
      drawDemoScreen();
    }
    else if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 2000){
        var assignment = currentPlayerTested.coverageAssignment[0];
        assignment.fill = oldFill;
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;
      }else{
        debugger;
        drawFeedbackScreen(field);
      }
    }else{
      drawOpening(field);
    }
  }
}
