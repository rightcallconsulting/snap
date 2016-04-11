var makeJSONCall = true;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var playNames;
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var currentRouteGuess = [];
var currentRouteNodes = [];


function setup() {
  var myCanvas = createCanvas(400, 400);
  field.height = 400;
  field.heightInYards = 40;
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

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
      currentUserTested.position = "WR"; //remove when done testing
    })

    $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        var newFormation = createFormationFromJSON(formationObject);
        //var p = newFormation.getPlayerFromPosition(currentUserTested.position);
        //debugger;
        if(newFormation){
          offensiveFormations.push(newFormation);
        }
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
            plays = plays.filter(function(play){return play.getPlayerFromPosition(currentUserTested.position)});

            test.plays = plays;

            test.restartQuiz();
            test.updateScoreboard();
            test.updateProgress();
            makeJSONCall = false;
          })
        })
      })
})



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

function clearSelection(){
  currentRouteGuess = [];
  currentRouteNodes = [];
  nodeObject = null;
}

function checkAnswer(){
  var isCorrect = true;
  if(currentRouteGuess.length !== currentPlayerTested.breakPoints.length){
    isCorrect = false;
  }


  for(var i = 0; isCorrect && i < currentRouteGuess.length; i++){
    var dx = abs(currentRouteGuess[i][0] - currentPlayerTested.breakPoints[i][0]);
    var dy = abs(currentRouteGuess[i][1] - currentPlayerTested.breakPoints[i][1]);
    var dist = Math.sqrt(dx*dx + dy*dy);
    if(dist > 2){
      isCorrect = false;
    }
  }

  if(isCorrect){
    clearSelection();
    currentPlayerTested = null;
    test.score++;
    test.advanceToNextPlay(test.correctAnswerMessage);
    currentPlayerTested = null;
  }else{
    clearSelection();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
    test.feedBackScreenStartTime = millis();
  }
}

function drawCurrentRoute(){
  var x1 = field.getTranslatedX(currentPlayerTested.startX);
  var y1 = field.getTranslatedY(currentPlayerTested.startY);
  if(currentRouteGuess.length > 0){
    var x2 = field.getTranslatedX(currentRouteGuess[0][0]);
    var y2 = field.getTranslatedY(currentRouteGuess[0][1]);
    stroke(0, 0, 255);
    line(x1,y1,x2,y2);
    noStroke();
    fill(0, 0, 255)
  }
  for(var i = 0; i < currentRouteGuess.length - 1; i++){
    x1 = field.getTranslatedX(currentRouteGuess[i][0]);
    y1 = field.getTranslatedY(currentRouteGuess[i][1]);
    var x2 = field.getTranslatedX(currentRouteGuess[i+1][0]);
    var y2 = field.getTranslatedY(currentRouteGuess[i+1][1]);
    stroke(0, 0, 255);
    line(x1, y1, x2, y2);
    noStroke();
    fill(0, 0, 255)
  }

}

function drawFeedbackScreen(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  test.getCurrentPlay().drawAllRoutes(field);
}

function drawOpening(){
  field.drawBackground(test.getCurrentPlay(), height, width);
  test.getCurrentPlay().drawAllPlayers(field);
  for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
    var player = test.getCurrentPlay().eligibleReceivers[i];
    if(player !== currentPlayerTested){
      player.drawBreakPoints(field);
    }
  }
  drawCurrentRoute();
  for(var i = 0; i < currentRouteNodes.length; i++){
    stroke(220, 220, 0);
    currentRouteNodes[i].draw(field);
    noStroke();
  }

}

function drawDemoScreen(){

  field.drawBackground(null, height, width);
  var play = test.getCurrentPlay();
  if(play){
    play.drawAllPlayers(field);
    fill(220,0,0);
    textSize(22);
    text("DEMO", 50, 20);

    if(currentPlayerTested){
      var x = field.getTranslatedX(currentPlayerTested.startX);
      var y = field.getTranslatedY(currentPlayerTested.startY);
      var siz = field.yardsToPixels(currentPlayerTested.siz) * 1.5;
      noFill();
      stroke(220,0,0);
      strokeWeight(2);
      ellipse(x, y, siz, siz);

      fill(220,0,0);
      line(field.width / 2, 80, field.width/2, 20);
      triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
      strokeWeight(1);
      textAlign(LEFT);
      textSize(18);

      text("Your play call is here", field.width / 2 + 10, 50);
      text("You are in blue", x + siz/2 + 5, y);
    }



  }
};


mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return true;
  }
  if (bigReset.isMouseInside(field) && test.over) {
    clearSelection();
    currentPlayerTested = null;
    test.restartQuiz();
    return true;
  }else if(!test.over){
    if(currentRouteNodes.length > 0 && currentRouteNodes[currentRouteNodes.length - 1].isMouseInside(field)){
      checkAnswer(field.getYardX(mouseX), field.getYardY(mouseY));
      return;
    }else{
      var x = field.getYardX(mouseX);
      var y = field.getYardY(mouseY);
      currentRouteGuess.push([x, y]);
      var nodeObject = new Node({
        x: x,
        y: y,
        siz: 1,
        fill: color(0, 0, 220)
      });
      currentRouteNodes.push(nodeObject);
    }
  }

};

keyPressed = function(){
  if(keyCode === BACKSPACE){
    if(currentRouteGuess.length > 0){
      currentRouteGuess.pop();
      currentRouteNodes.pop();
    }
    return false;
  }

};

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
      if(this === currentPlayerTested){
        fill(0, 0, 255);

      }
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(this.fill);
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, x, y);
    }
  };
  if(makeJSONCall){
    //WAIT - still executing JSON
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
    if(test.showDemo){
      drawDemoScreen();
    }else if(test.feedBackScreenStartTime){
      var elapsedTime = millis() - test.feedBackScreenStartTime;
      if(elapsedTime > 1000){
        test.feedBackScreenStartTime = 0;
        test.advanceToNextPlay(test.incorrectAnswerMessage);
        currentPlayerTested = null;
      }else{
        drawFeedbackScreen(field);
      }
    }else{
      drawOpening();
    }

  }
}