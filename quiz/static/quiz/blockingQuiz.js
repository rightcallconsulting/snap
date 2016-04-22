var makeJSONCall = true;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var guessedAssignment = null;
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
    width: 6,
    height: 4,
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
      currentUserTested.position = "LG"; //remove when done testing
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
  var isCorrect = currentPlayerTested.blockingAssignment.equals(guessedAssignment);
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
    currentPlayerTested.blockingAssignment.draw(currentPlayerTested, field);
  }
};

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentPlay();
  var defensivePlay = test.getCurrentDefensivePlay();
  if(play){
    if(defensivePlay){
      defensivePlay.drawAllPlayers(field);
    }
    play.drawAllPlayers(field);//WithOffense(field);
  }
  if(currentPlayerTested && guessedAssignment){
    guessedAssignment.draw(currentPlayerTested, field);
  }
}


function drawDemoScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentPlay();
  var defensivePlay = test.getCurrentDefensivePlay();
  var timeElapsed = millis() - test.demoStartTime;
  if(play){
    if(defensivePlay){
      defensivePlay.drawAllPlayers(field);
    }
    play.drawAllPlayers(field);
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
      textSize(18);
      noStroke();
      if(timeElapsed < 2000){
        noStroke();
        noFill();
        stroke(220,0,0);
        strokeWeight(2);
        ellipse(x, y, siz, siz);
        noStroke();
        strokeWeight(1);
        fill(220, 220, 0);
        textSize(22);
        text("You are in yellow", x - 100, y - 90);
        fill(0);
        
        //text("Click demo button to exit", 20, 50);
        noStroke();
      }else if(timeElapsed < 4000){
        fill(220,0,0);
        stroke(220, 0, 0);
        line(field.width / 2, 80, field.width/2, 20);
        triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
        noStroke();
        fill(0);
        textSize(22);
        //text("Click demo button to exit", 20, 50);
        fill(220,0,0);
        text("Your play call is here", field.width / 2 + 10, 50);
      }else{
        stroke(220, 220, 0);
        fill(220, 220, 0);
        var clickedDefender = null;
        for(var i = 0; i < defensivePlay.defensivePlayers.length; i++){
          var defender = defensivePlay.defensivePlayers[i];
          if(defender.clicked){
            clickedDefender = defender;
          }
          var x = field.getTranslatedX(defender.startX);
          var y = field.getTranslatedY(defender.startY);
          var siz = field.yardsToPixels(defender.siz);
          y -= siz / 2;
          line(x, y - 80, x, y - 15);
          triangle(x - 15, y - 15, x + 15, y - 15, x, y);
        }
        stroke(0);
        textAlign(CENTER);
        textSize(22);
        if(clickedDefender){
         
          if(demoDoubleClick){
            text("Great!  You're ready to start!\nClick anywhere to continue.", field.width / 2, (5 * field.height) / 6);
          }else{
            text("Click again to check answer", field.width / 2, (5 * field.height) / 6);
          }

          fill(0);
          //text("Click demo button to exit", 20, 50);
        }else{
          
          text("Click on the player you are assigned to cover", field.width / 2, (5 * field.height) / 6);
          noStroke();
          //text("Click demo button to exit", 20, 50);
        }
      }

    }
  }

}

keyPressed = function(){
  if (keyCode === BACKSPACE){
    if(guessedAssignment){
      guessedAssignment.removeLastBlockedPlayer();
    }
    return false;
  }
  return true;
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
  }else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick){
    exitDemoScreen();
  }else if(!test.over){
    var play = test.getCurrentDefensivePlay();
    var clickedPlayer = null;
    for(var i = 0; i < play.defensivePlayers.length; i++){
      var answer = play.defensivePlayers[i];
      if(answer.clicked){
        if(answer.isMouseInside(field)){
          if(test.showDemo){
            demoDoubleClick = true;
          }else{
            checkAnswer(answer);
          }
        }else{
          clearSelections();
          answer.clicked = true;
          clickedPlayer = answer;
        }
      }else{
        if(answer.isMouseInside(field)){
          clearSelections();
          answer.clicked = true;
          return;
        }
      }
    }
    if(clickedPlayer){
      if(guessedAssignment){
        var i = guessedAssignment.blockedPlayers.indexOf(clickedPlayer);
        if(i < 0){
          guessedAssignment.addBlockedPlayer(clickedPlayer);
        }else if(i === guessedAssignment.blockedPlayers.length - 1){
          checkAnswer();
        }else{
          guessedAssignment.removeBlockedPlayer(i);
        }
      }else{
        guessedAssignment = new BlockingAssignment({
          blockedPlayers: [clickedPlayer]
        });
      }
    }else{
      if(guessedAssignment){
        guessedAssignment.clearBlockedPlayers();
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
    if(this.unit === "defense"){
      if(this.clicked){
        stroke(0, 255, 255);
        line(field.getTranslatedX(this.x), field.getTranslatedY(this.y), field.getTranslatedX(currentPlayerTested.x), field.getTranslatedY(currentPlayerTested.y));
        noStroke();

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
      var correctBlockingAssignment = new BlockingAssignment({
        name: "",
        blockedPlayers: [test.getCurrentDefensivePlay().defensivePlayers[0]]
      })
      currentPlayerTested.blockingAssignment = correctBlockingAssignment;
    }
    if(test.showDemo){
      drawDemoScreen();
    }
    else if(test.feedbackScreenStartTime){
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
