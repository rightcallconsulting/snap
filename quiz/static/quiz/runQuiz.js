var makeJSONCall = true;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var guessedAssignment = null;
var hasExchanged = false;


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
    width: 6,
    height: 4,
    label: "Restart"
  })

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
      currentUserTested.position = "RB"; //remove when done testing
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
              /*for(var i = 0; i < plays.length; i++){
                var play = plays[i];
                var blocking = false;
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
                }*/
                while(defensivePlays.length > plays.length){
                  defensivePlays.pop();
                }
                while(defensivePlays.length < plays.length){
                  defensivePlays.push(defensivePlays[0]);
                }
                test.plays = plays;
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
    for(var i = 0; i < play.defensivePlayers.length; i++){
      var p = play.defensivePlayers[i];
      p.clicked = false;
    }
  }
}

function checkAnswer(){
  var isCorrect = currentPlayerTested.runAssignment.equals(guessedAssignment);
  if(isCorrect){
    clearSelections();
    test.score++;
    test.advanceToNextPlay(test.correctAnswerMessage);
    currentPlayerTested = null;
    guessedAssignment = null;
  }else{
    clearSelections();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
    test.feedbackScreenStartTime = millis();
  }
}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentPlay();
  var defensivePlay = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayers(field);//WithOffense(field);
  }
  if(defensivePlay){
    defensivePlay.drawAllPlayers(field);//WithOffense(field);
  }
  if(currentPlayerTested){
    currentPlayerTested.runAssignment.draw(currentPlayerTested, field);
  }
};

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentPlay();
  var defensivePlay = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayers(field);//WithOffense(field);
  }
  if(defensivePlay){
    defensivePlay.drawAllPlayers(field);//WithOffense(field);
  }
  if(currentPlayerTested && guessedAssignment){
    guessedAssignment.draw(currentPlayerTested, field);
  }
  
};

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return;
  }
  if(bigReset.isMouseInside(field) && test.over){
    test.restartQuiz();
  }else if(!test.over){
    var mouseYardX = field.getYardX(mouseX);
    var mouseYardY = field.getYardY(mouseY);
    if(guessedAssignment){
      var lastClick = guessedAssignment.getLastCoord();
      if(lastClick){
        var dist = Math.sqrt((lastClick[0] - mouseYardX) * (lastClick[0] - mouseYardX) + (lastClick[1] - mouseYardY) * (lastClick[1] - mouseYardY));
        if(dist < 1){
          checkAnswer();
          return;
        }
      }
      if(hasExchanged){
        guessedAssignment.addRouteAfterExchangeCoords(mouseYardX, mouseYardY);
      }else{
        guessedAssignment.addRouteToExchangeCoords(mouseYardX, mouseYardY);
      }
    }else{
      guessedAssignment = new RunAssignment({
        type: "Handoff",
        routeToExchange: [[mouseYardX, mouseYardY]],
        routeAfterExchange: []
      });
    }
  }
};

keyTyped = function(){
  if(test.over){
    if(key === 'r'){
      test.restartQuiz();
    }
  }else if(key === 'e'){
    hasExchanged = !hasExchanged;
  }
};

keyPressed = function(){
  if (keyCode === BACKSPACE){
    if(guessedAssignment){
      if(hasExchanged){
        guessedAssignment.removeAfterExchange();
      }else{
        guessedAssignment.removeBeforeExchange();
      }
    }
    return false;
  }
  return true;
}

function draw() {
  Player.prototype.draw = function(field){
    var x = field.getTranslatedX(this.x);
    var y = field.getTranslatedY(this.y);
    var siz = field.yardsToPixels(this.siz);
    if(this.unit === "defense"){
      if(this.clicked){ 
      }
      noStroke();
      fill(0, 0, 0);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
    else {
      noStroke();
      fill(this.fill);
      if(this === currentPlayerTested){
        fill(220,220, 0);
      }
      ellipse(x, y, siz, siz);
      fill(0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
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
      currentPlayerTested = test.getCurrentPlay().getPlayerFromPosition(currentUserTested.position);
      var correctRunAssignment = new RunAssignment({
        type: "Handoff",
        routeToExchange: [[currentPlayerTested.startX - 6, currentPlayerTested.startY + 3]],
        routeAfterExchange: [[currentPlayerTested.startX + 15, currentPlayerTested.startY + 15]]
      })
      currentPlayerTested.runAssignment = correctRunAssignment;
    }
    if(test.showDemo){
      drawDemoScreen();
    }
    if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 2000){
        test.feedbackScreenStartTime = 0;
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;
        guessedAssignment = null;

      }else{
        drawFeedbackScreen(field);
      }
    }else{
      drawOpening(field);
    }
  }
}
