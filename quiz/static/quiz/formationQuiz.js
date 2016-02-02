var makeJSONCall = true;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var formationNames;
var bigReset;

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

  bigReset = new Button({
    x: width/2,
    y: height*0.8,
    width: 50,
    label: "Restart"
  })

  if(makeJSONCall){
    makeJSONCall = false
    //REMOVE WHEN DB ACCESS WORKS:
    var formationExample = new Formation({
      name: 'BROWN'
    })
    formationExample.createOLineAndQB();
    formationExample.createSkillPlayers();
    var formationExample2 = new Formation({
      name: 'PAPER'
    })
    formationExample2.createOLineAndQB();
    formationExample2.createSkillPlayers();
    var formationExample3 = new Formation({
      name: 'BAG'
    })
    formationExample3.createOLineAndQB();
    formationExample3.createSkillPlayers();
    var scoreboard = new Scoreboard({

    });
    test = new FormationTest({
      formations: [formationExample, formationExample2, formationExample3],
      scoreboard: scoreboard
    });
  }

  runTest("FormationTest", null, test); //completes any setup I think?

  /*
  if(makeJSONCall){
    makeJSONCall = false
    $.getJSON('/quiz/tests/'+testIDFromHTML, function(data, jqXHR){
      test = createTestFromJSON(data[0]);
      var playerID = test.playerID;
      $.getJSON('/quiz/players/'+ playerID, function(data2, jqXHR){
        currentPlayerTested = createUserFromJSON(data2[0]);
        $.getJSON('/quiz/teams/1/plays', function(data3, jqXHR){
          data3.forEach(function(play){
            var testIDArray = play.fields.tests;
            if(testIDArray.includes(test.id)){
              var play = createPlayFromJSON(play);
              play.test = test
              test.plays.push(play);
            }
          })
          $.getJSON('/quiz/teams/1/plays/players', function(data4, jqXHR){
            data4.forEach(function(position){
              var player = createPlayerFromJSON(position);
              positions.push(player);
            })
            test.plays.forEach(function(play){
              play.addPositionsFromID(positions);
              play.populatePositions();
            })
            runTest("QBProgression", currentPlayerTested, test);
          })
        })
      })
    });
  }*/
}



function runTest(type, playerTested, test){
  //REPLACE THIS LINE WITH OPTIONS WE QUERIED FROM DB THAT ARE NOW IN TEST.FORMATIONS
  //var formationNames = ["I-Right Wing", "Doubles Bunch", "Trips Right Gun"];
  formationNames = [];
  for(var i = 0; i < test.formations.length; i++){
    formationNames.push(test.formations[i].name);
  }
  multipleChoiceAnswers = [];
}

function shuffle(o) {
  for(var n = 0; n < 100; n++){
    for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  }
  return o;
}

function createMultipleChoiceAnswers(correctAnswer){
  multipleChoiceAnswers = [];
  var availableNames = formationNames.slice(0,3);
  shuffle(availableNames);
  var i = 0;
  while(multipleChoiceAnswers.length < 3){
    var label = availableNames[i];
    if(i === 0){
      label = correctAnswer;
    }else if(label === correctAnswer){
      i++;
      label = availableNames[i];
    }
    //debugger;
    multipleChoiceAnswers.push(new MultipleChoiceAnswer({
      x: 50 + multipleChoiceAnswers.length * width / (availableNames.length + 1),
      y: height / 3,
      width: width / (availableNames.length + 2),
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
  //logic
  var isCorrect = test.getCurrentFormation().name === guess.label;
  if(isCorrect){
    test.advanceToNextFormation("You got it, dude");
    test.score++;
    multipleChoiceAnswers = [];
    if(test.over){
      /*bigReset.displayButton = true;
      check.displayButton = false;
      clear.displayButton = false;*/
    }
  }else{
    clearAnswers();
    test.scoreboard.feedbackMessage = "Wrong Answer";
    test.incorrectGuesses++;
  }
}

function drawBackground(formation, field) {
  background(93, 148, 81);
  for(var i = 0; i < field.heightInYards; i++){
    var yc = height * (i/field.heightInYards);
    stroke(255, 255, 255);
    if(i % 10 === 0){
      line(0, yc, width, yc);
    }else if(i % 5 === 0){
      line(0, yc, width, yc);
    }else{
      line(width*0.24, yc, width*0.25, yc);
      line(width*0.74, yc, width*0.75, yc);
    }
  }
}

function drawOpening(){
  drawBackground(test.getCurrentFormation(), field);
  test.scoreboard.draw(test, null);
  test.getCurrentFormation().drawAllPlayers();
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
    check.displayButton = true;
    clear.displayButton = true;
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
      check.displayButton = true;
      clear.displayButton = true;
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
  if(test.over){
    //debugger;
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw();
  }else{
    if(multipleChoiceAnswers.length < 2){
      var correctAnswer = test.getCurrentFormation().name;
      createMultipleChoiceAnswers(correctAnswer);
    }
    drawOpening();
  }
}
