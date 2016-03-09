var makeJSONCall = true;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;

function setup() {
  var myCanvas = createCanvas(400, 400);
  field.height = 400;
  field.heightInYards = 40;
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
  var p = test.getCurrentDefensivePlay().defensivePlayers.filter(function(player){return player.pos === currentUserTested.position})[0]
  var isCorrect = guess === p.CBAssignment;
  if(isCorrect){
    clearSelections();
    test.score++;
    test.advanceToNextPlay(test.correctAnswerMessage);
    currentPlayerTested = null;
  }else{
    clearSelections();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
  }
}

function drawOpening(){
  field.drawBackground(null, height, width);
  var play = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayersWithOffense(field);
  }

}

pressPlayButton = function() {
  if (test.getCurrentDefensivePlay()){
    test.getCurrentPlay().setAllRoutes();
    scoreboard.feedbackMessage = "";
    test.getCurrentPlay().inProgress = true;
  }
};

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }
  if (bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
  }
  else if(!test.over){
    var play = test.getCurrentDefensivePlay();
    for(var i = 0; i < play.offensiveFormationObject.eligibleReceivers.length; i++){
      var answer = play.offensiveFormationObject.eligibleReceivers[i];
      if(answer.clicked){
        if(answer.isMouseInside(field)){
          checkAnswer(answer);
          return;
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
    //debugger;
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    drawOpening();
  }
}
