var makeJSONCall = true;
var testIDFromHTML = 33;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var checkNames = [];
var maxPlays = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var COOLER_NAMES = ["OMAHA", "LION", "TIGER", "NEBRASKA", "HAWAII"];

function setup() {
  var myCanvas = createCanvas(400, 400);
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
    var plays = [];
    playNames = [];
    var formations = [];
    var defensivePlays = [];
    $.getJSON('/quiz/players/'+ playerIDFromHTML, function(data2, jqXHR){
      currentUserTested = createUserFromJSON(data2[0]);
      currentUserTested.position = "QB"; //remove when done testing
    })
    $.getJSON('/quiz/teams/1/plays', function(data, jqXHR){
      data.forEach(function(play){
        var play = createPlayFromJSON(play);
        plays.push(play);
        playNames.push(play.playName)
      })
      var positions = [];
      plays.sort(sortByPlayName); //can sort by any function, and can sort multiple times if needed
      plays = plays.slice(0,maxPlays); //can slice by any limiting factor (global variable for now)
      $.getJSON('/quiz/teams/1/defensive_formations', function(data, jqXHR){
        data.forEach(function(formationObject){
          var newFormation = createFormationFromJSON(formationObject);
          formations.push(newFormation);
        })
        $.getJSON('/quiz/teams/1/plays/players', function(data2, jqXHR){
          data2.forEach(function(position){
            var player = createPlayerFromJSON(position);
            positions.push(player);
          })
          plays.forEach(function(play){
            play.addPositionsFromID(positions);
            play.populatePositions();
            play.test = test;
          })
          $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
            data.forEach(function(position){
              var newPlayer = createPlayerFromJSON(position);
              var formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
              if(formation){
                newPlayer.unit = "defense"
                formation.positions.push(newPlayer);
              }
            })
          })
          formations.forEach(function(formation){
            formation.populatePositions();
            var defensivePlay = formation.createDefensivePlay();
            defensivePlays.push(defensivePlay);
          })
          for(var i = 0; i < plays.length; i++){
            var play = plays[i];
            var check = new OffenseCheck({
              name: COOLER_NAMES[i],
              defensiveFormation: formations[i % formations.length],
              newPlay: plays[(i+1)%plays.length]
            });
            checkNames.push(check.name);
            play.checks.push(check);
          }
          test.plays = plays;
          multipleChoiceAnswers = [];
          test.restartQuiz();
          makeJSONCall = false;
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

function createMultipleChoiceAnswers(correctAnswer, numOptions){
  var correctIndex = Math.floor((Math.random() * numOptions));
  multipleChoiceAnswers = [];
  var availableNames = checkNames.slice();
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
      y: height - 60,
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
  var isCorrect = test.getCurrentPlay().checks[0].name === guess.label;
  if(isCorrect){
    test.score++;
    multipleChoiceAnswers = [];
    test.advanceToNextPlay(test.correctAnswerMessage);
  }else{
    clearAnswers();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
    test.updateScoreboard();
  }
}

function drawOpening(){
  field.drawBackground(null, height, width);
  test.getCurrentPlay().drawAllRoutes(field);
  test.getCurrentPlay().drawAllPlayers(field);
  if(test.getCurrentPlay().checks[0].defensiveFormation){
    test.getCurrentPlay().checks[0].defensiveFormation.drawAllPlayers(field);
  }
  for(var i = 0; i < multipleChoiceAnswers.length; i++){
    multipleChoiceAnswers[i].draw();
  }
}

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }
  if (bigReset.isMouseInside(field) && test.over) {
    test.restartQuiz();
  }
  else{
    for(var i = 0; i < multipleChoiceAnswers.length; i++){
      var answer = multipleChoiceAnswers[i];
      if(answer.clicked){
        if(answer.isMouseInside()){
          checkAnswer(answer);
        }else{
          answer.changeClickStatus();
        }
      }else{
        if(answer.isMouseInside()){
          answer.changeClickStatus();
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
    var offset = key.charCodeAt(0) - "1".charCodeAt(0);
    if(offset >= 0 && offset < multipleChoiceAnswers.length){
      var answer = multipleChoiceAnswers[offset];
      if(answer.clicked){
        checkAnswer(answer);
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
      if(this === currentPlayerTested){
        fill(20, 50, 150);
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
    if(multipleChoiceAnswers.length < 2 && test.getCurrentPlay()){
      var correctAnswer = test.getCurrentPlay().checks[0].name;
      createMultipleChoiceAnswers(correctAnswer,3);
      test.updateMultipleChoiceLables();
    }
    if(!currentPlayerTested){
      currentPlayerTested = test.getCurrentPlayerTested(currentUserTested);
    }
    drawOpening();
  }
}