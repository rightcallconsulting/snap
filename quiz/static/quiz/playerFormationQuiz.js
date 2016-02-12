var makeJSONCall = true;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var formationNames;
var maxFormations = 5;
var bigReset;
var testPlayer = null;

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  multipleChoiceAnswers = [];
  bigReset = new Button({
    x: width*0.5 - 25,
    y: height*0.8,
    width: 50,
    label: "Restart"
  })

  if(makeJSONCall){
    var scoreboard = new Scoreboard({

    });
    test = new FormationTest({
      formations: [],
      scoreboard: scoreboard
    });
    var formations = [];
    formationNames = [];
    $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        formationObject.fields.id = formationObject.pk;
        formationObject.fields.positions = [];
        var newFormation = new Formation(formationObject.fields);
        newFormation.playName = formationObject.fields.name;
        newFormation.name = newFormation.playName
        formations.push(newFormation);
        formationNames.push(newFormation.name);
      })
      formations.sort(sortByCreationDecreasing); //can sort by any function, and can sort multiple times if needed
      formations = formations.slice(0,maxFormations); //can slice by any limiting factor (global variable for now)
      $.getJSON('/quiz/teams/1/formations/positions', function(data, jqXHR){
        data.forEach(function(position){
          position.fields.id = position.pk;
          position.fields.x = position.fields.startX;
          position.fields.y = position.fields.startY;
          position.fields.pos = position.fields.name;
          position.fields.num = position.fields.pos;
          var newPlayer = new Player(position.fields)
          if(newPlayer.pos==="QB"){
            newPlayer.fill = color(212, 130, 130);
          }
          else if(newPlayer.pos==="OL" || newPlayer.pos ==="LT" || newPlayer.pos ==="LG" || newPlayer.pos ==="C" || newPlayer.pos ==="RG" || newPlayer.pos ==="RT"){
            newPlayer.fill = color(143, 29, 29);
          }
          else{
            newPlayer.fill = color(255, 0, 0);
          }
          var formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
          if(formation){
            formation.positions.push(newPlayer);
          }
        })
        formations.forEach(function(formation){
          formation.populatePositions();
        })

        for(var i = 0; i < formations.length; i++){
          var formation = formations[i];
          for(var j = 0; j < formation.offensivePlayers.length; j++){
            var p = formation.offensivePlayers[j];
            if(p.num === playerBeingTested.num){
              answers.push([p.x, p.y]);
              var oldCopy = formation.offensivePlayers.slice();
              formation.offensivePlayers = formation.offensivePlayers.slice(0, j);
              formation.offensivePlayers.concat(oldCopy.slice(j+1));
            }
          }
        }

        test.formations = formations;
        multipleChoiceAnswers = [];
        test.restartQuiz();
        makeJSONCall = false

      })
});
}
}

var sortByCreationDecreasing = function(a, b){
  var date1 = new Date(a.created_at);
  var date2 = new Date(b.created_at);
  return date2 - date1;
};

function shuffle(o) {
  for(var n = 0; n < 100; n++){
    for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  }
return o;
}

function createMultipleChoiceAnswers(correctAnswer, numOptions){
  var correctIndex = Math.floor((Math.random() * numOptions));
  multipleChoiceAnswers = [];
  var availableNames = formationNames.slice();
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
  var isCorrect = test.getCurrentFormation().name === guess.label;
  if(isCorrect){
    test.advanceToNextFormation(test.correctAnswerMessage);
    test.score++;
    multipleChoiceAnswers = [];
  }else{
    clearAnswers();
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
  }
}
/*
Formation.prototype.drawTenPlayers = function(player){
  for(var i = 0; i < this.offensivePlayers.length; i++){
    if(i === player){
      continue;
      offensivePlayers.draw();
    } 
  }
}
*/



function drawOpening(){
  field.drawBackground(null, height, width);
  test.scoreboard.draw(test, null);
 
    test.getCurrentFormation().drawAllPlayers(field);
  //test.getCurrentFormation().drawTenPlayers(5);
  if(testPlayer){
    testPlayer.draw(field);
  }

  for(var i = 0; i < multipleChoiceAnswers.length; i++){
    multipleChoiceAnswers[i].draw();
  }
  fill(0, 0, 0);
  textSize(20);
  text(test.scoreboard.feedbackMessage, 160, 360);
}

mouseClicked = function() {
  test.scoreboard.feedbackMessage = "";
  if (bigReset.isMouseInside() && test.over) {
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
// in mouse clicked do stuff using test player
// when click on test player ... checking the answer
// when no test player, clicks to place 11th man
// when click and test player and not inside him...move the player


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
  if(makeJSONCall){
    //WAIT - still executing JSON
  }
  else if(test.over){
    //debugger;
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw();
  }else{
    if(multipleChoiceAnswers.length < 2 && test.getCurrentFormation()){
      var correctAnswer = test.getCurrentFormation().name;
      createMultipleChoiceAnswers(correctAnswer,3);
    }
    drawOpening();
  }
}
