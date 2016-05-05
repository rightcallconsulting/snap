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
var dbCalls = [];


function setup(){
  var myCanvas = createCanvas(400, 400);
  field.height = 400;
  field.heightInYards = 40;

  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  var zMo = new DefensiveCall({
    name: "Z-MO"
  });

  var yMo = new DefensiveCall({
    name: "Y-MO"
  });

  var sMo = new DefensiveCall({
    name: "S-MO"
  });

  dbCalls.push(zMo);
  dbCalls.push(yMo);
  dbCalls.push(sMo);

  multipleChoiceAnswers = [];
  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: 5,
    label: "Restart"
  });

  if(makeJSONCall){
    var scoreboard = new Scoreboard({

    });

    test = new PlayTest({
      plays: [],
      scoreboard: scoreboard,
      displayName: true,
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
            defensivePlay.dbCall = dbCalls[Math.floor((Math.random() * dbCalls.length))];
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

                //next 2 lines for testing only
                
                var player = play.eligibleReceivers[0];
                var i = 1;
                while(i < play.eligibleReceivers.length && (player.pos !== "WR" || player.startY > play.oline[2].startY - 2)){
                  player = play.eligibleReceivers[i];
                  i++;
                }
                var dx = -30;
                if(player.startX < play.oline[2].startX){
                  dx = -dx;
                }
                player.motionCoords.push([player.startX + dx, player.startY]);
                
              })
              playNames.push("Cover 3");
              playNames.push("Cover 4");
              playNames.push("Mike Laser");

              var numQuestions = Math.min(5, plays.length);
              numQuestions = Math.min(numQuestions, defensivePlays.length);
              test.plays = plays.slice(0, numQuestions);
              test.defensivePlays = defensivePlays.slice(0, numQuestions);
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

var DefensiveCall = function(config){
  debugger;
  this.name = config.name || "";
};

function shuffle(o) {
  for(var n = 0; n < 100; n++){
    for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  }
return o;
}


function createMultipleChoiceAnswers(numOptions){
  multipleChoiceAnswers = [];
  var correctIndex = Math.floor((Math.random() * numOptions));
  var correctAnswer = test.getCurrentDefensivePlay().getDbCall().name;
  document.getElementById('correct-answer-index').innerHTML = str(correctIndex+1);
  var availableNames = ["Z-MO", "Y-MO", "S-MO"];
  var i = 0;
  while(multipleChoiceAnswers.length < numOptions){
    var label = availableNames[i];
    if(i === correctIndex){
      label = correctAnswer;
    }
    multipleChoiceAnswers.push(new MultipleChoiceAnswer({
      x: 50 + multipleChoiceAnswers.length * width / (numOptions+1),
      y: height - 60,
      width: width / (numOptions + 2),
      height: 50,
      label: label,
      clicked: false
    }));
    i++;
  }
}

function drawOpening(){
  field.drawBackground(null, height, width);
  var defensivePlay = test.getCurrentDefensivePlay();
  var play = test.getCurrentPlay();
  if(play){
    play.drawAllPlayers(field);
    
    
  }
  if(defensivePlay){
    defensivePlay.drawAllPlayers(field);
    
  }
  
}

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }
  if (bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
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
      this.runMotion();
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
  }
  else if(test.over){

    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(multipleChoiceAnswers.length < 2 && test.getCurrentPlay()){
      createMultipleChoiceAnswers(3);
      test.updateMultipleChoiceLabels();
    }
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    drawOpening();
  }
}
