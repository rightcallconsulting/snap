var makeJSONCall = true;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var exitDemo = null;
var demoDoubleClick = false;
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

function clearSelection(){
  guessedAssignment = null;
};

function checkAnswer(){
  var isCorrect = currentPlayerTested.runAssignment.equals(guessedAssignment);
  if(isCorrect){
    clearSelection();
    test.score++;
    test.advanceToNextPlay(test.correctAnswerMessage);
    currentPlayerTested = null;
    guessedAssignment = null;
  }else{
    clearSelection();
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

function drawDemoScreen(){
  noStroke();
  field.drawBackground(null, height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentPlay();
  var defensivePlay = test.getCurrentDefensivePlay();
  if(play){
    if(defensivePlay){
      defensivePlay.drawAllPlayers(field);//WithOffense(field);
    }
    play.drawAllPlayers(field);
  }
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
    if(guessedAssignment){
     guessedAssignment.drawRouteToExchange(currentPlayerTested, field);
     guessedAssignment.drawRouteAfterExchange(currentPlayerTested, field);
   }
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
    if(x < field.width / 3){
      textAlign(LEFT);
    }else if(x > 2 * (field.width) / 3){
      textAlign(RIGHT);
    }else{
      textAlign(CENTER);
    }
    text("You are in yellow", x, y + 60);
    noStroke();
  }else if(timeElapsed < 4000){
    fill(255,238,88);
    stroke(255,238,88);
    line(field.width / 2, 80, field.width/2, 20);
    triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
    noStroke();
    text("Your play call is here", field.width / 2 + 20, 50);
  }else{
    stroke(255,238,88);
    fill(255,238,88);
    textAlign(CENTER);
    var clickedAssignment = null;
    if(guessedAssignment){
      clickedAssignment = guessedAssignment;
    }
    if(clickedAssignment){
      if(hasExchanged){
        if(demoDoubleClick){
          text("Great! You're ready to start!\nClick anywhere to continue.", field.width / 2, (5 * field.height) / 6);
        }else{
          text("Click on your route after handoff exchange.\nDouble click to check answer.", field.width / 2, (5 * field.height) / 6);
        }
      }else{
        text("Press the 'e' key to choose route after exchange.", field.width / 2, (5 * field.height) / 6);
      }
    }else{
      text("Click on the spot of handoff exchange.", field.width / 2, (5 * field.height) / 6);
    }
    noStroke();
  }
}
};

function setupDemoScreen(){
  clearSelection();
  test.showDemo = true;
  demoDoubleClick = false;
  test.demoStartTime = millis();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoDoubleClick = false;
  clearSelection();
};




mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return;
  }
  if(bigReset.isMouseInside(field) && test.over){
    test.restartQuiz();
    return true;
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else if(!test.over){
    var mouseYardX = field.getYardX(mouseX);
    var mouseYardY = field.getYardY(mouseY);
    if(guessedAssignment){
      var lastClick = guessedAssignment.getLastCoord();
      if(lastClick){
        var dist = Math.sqrt((lastClick[0] - mouseYardX) * (lastClick[0] - mouseYardX) + (lastClick[1] - mouseYardY) * (lastClick[1] - mouseYardY));
        if(dist < 1){
          if(test.showDemo){
            demoDoubleClick = true;
          }else{
            checkAnswer();
            return;
          }
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
  }
  if(key === 'e'){
    hasExchanged = !hasExchanged;
    if(test.showDemo){
      hasExchanged = true;
    }
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
        fill(255,238,88);
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
    }else if(test.feedbackScreenStartTime){
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
