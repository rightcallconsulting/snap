var makeJSONCall = true;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var currentGuess = [];
var currentNode = [];
var currentGuessNode = null;

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
      currentUserTested.position = "DE"; //remove when done testing
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
                var isRushing = false;
                for(var j = 0; j < play.defensivePlayers.length; j++){
                  var p = play.defensivePlayers[j];
                  if(p.pos === currentUserTested.position){
                      //check if he's in coverage
                      if(p.gapXPoint && p.gapYPoint){
                        isRushing = true;
                      }
                      break;
                    }
                  }
                  if(!isRushing){
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

function clearSelection(){
  currentGuess = [];
  currentNode = [];
  currentGuessNode = null;
}

function checkAnswer(x, y){
  var dx = abs(currentPlayerTested.gapXPoint - x);
  var dy = abs(currentPlayerTested.gapYPoint - y);
  var dist = Math.sqrt(dx*dx + dy*dy);
  var isCorrect = dist < 2;
  if(isCorrect){
    clearSelection();
    currentPlayerTested = null;
    test.registerAnswer(isCorrect);
  }else{
    clearSelection();
    test.registerAnswer(isCorrect);
    test.feedBackScreenStartTime = millis();
  }
}

function drawFeedbackScreen(){
  var x2 = currentPlayerTested.gapXPoint;
  var y2 = currentPlayerTested.gapYPoint;
  var x1 = currentPlayerTested.x;
  var y1 = currentPlayerTested.y;

  var pixelX1 = field.getTranslatedX(x1);
  var pixelX2 = field.getTranslatedX(x2);
  var pixelY1 = field.getTranslatedY(y1);
  var pixelY2 = field.getTranslatedY(y2);

  var node = new Node({
    x: x2,
    y: y2,
    siz: 1,
    fill: color(220,220,0)
  });

  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentDefensivePlay().drawAllPlayersWithOffense(field);
  stroke(220,220,0);
  line(pixelX1, pixelY1, pixelX2, pixelY2);
  noStroke();
  node.draw(field);
}

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var timeElapsed = millis() - test.demoStartTime;
  var play = test.getCurrentDefensivePlay();
  if(play){
    play.drawAllPlayersWithOffense(field);
    for(var i = 0; i < currentNode.length; i++){
      stroke(220,220,0);
      line(field.getTranslatedX(currentPlayerTested.x), field.getTranslatedY(currentPlayerTested.y), field.getTranslatedX(currentGuessNode.x), field.getTranslatedY(currentGuessNode.y));
      currentGuessNode.draw(field);
      noStroke();
    }

  }
}

function drawDemoScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  var play = test.getCurrentDefensivePlay();
  if(play){
    for(var i = 0; i < currentNode.length; i++){
      stroke(220,220,0);
      line(field.getTranslatedX(currentPlayerTested.x), field.getTranslatedY(currentPlayerTested.y), field.getTranslatedX(currentGuessNode.x), field.getTranslatedY(currentGuessNode.y));
      currentGuessNode.draw(field);
      noStroke();
    }
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
  }


};


pressPlayButton = function() {
  if (test.getCurrentDefensivePlay()){
    test.getCurrentPlay().setAllRoutes();
    scoreboard.feedbackMessage = "";
    test.getCurrentPlay().inProgress = true;
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
  if(bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
  }
  else if(!test.over){

    if(currentNode.length > 0 && currentNode[currentNode.length - 1].isMouseInside(field)){
      if(test.showDemo){
        demoDoubleClick = true;
      }else{
        checkAnswer(field.getYardX(mouseX), field.getYardY(mouseY));
        return;
      }
    }else{
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      currentGuess.push([x, y]);
      currentGuessNode = new Node({
        x: field.getYardX(mouseX),
        y: field.getYardY(mouseY),
        siz: 1,
        fill: color(220,220,0)
      });

    }
    currentNode.push(currentGuessNode);
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

  }
  else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    if(test.showDemo){
      drawDemoScreen();
    }else if(test.feedBackScreenStartTime){
      var elapsedTime = millis() - test.feedBackScreenStartTime;
      if(elapsedTime > 2000){
        test.feedBackScreenStartTime = 0;
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;
      }else{
        drawFeedbackScreen();
      }
    }else{
      drawOpening();
    }

  }
}
