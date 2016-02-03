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

  multipleChoiceAnswers = [];
  bigReset = new Button({
    x: width*0.5 - 25,
    y: height*0.8,
    width: 50,
    label: "Restart"
  })

  /*if(makeJSONCall){
    makeJSONCall = false
    REMOVE WHEN DB ACCESS WORKS:
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

  runTest("FormationTest", null, test); //completes any setup I think?*/

  if(makeJSONCall){
    var scoreboard = new Scoreboard({

    });
    test = new FormationTest({
      formations: [],
      scoreboard: scoreboard
    });
    var formations = [];
    $.getJSON('/quiz/teams/1/formations', function(data, jqXHR){
      data.forEach(function(formationObject){
        formationObject.fields.id = formationObject.pk;
        formationObject.fields.positions = [];
        var newFormation = new Formation(formationObject.fields);
        newFormation.playName = formationObject.fields.name;
        newFormation.name = newFormation.playName
        formations.push(newFormation);
      })
      formations.sort(function(a, b){
        var date1 = new Date(a.created_at);
        var date2 = new Date(b.created_at);
        return date2 - date1;
      });
      formations = formations.slice(0,5);
      var formationTimes = "";
      for(var i = 0; i < formations.length; i++){
        formationTimes += formations[i].created_at + "\n";
      }
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
          formationNames = [];
          formations.forEach(function(formation){
            formationNames.push(formation.name);
            formation.populatePositions();
          })

          test.formations = formations;
          runTest("Formation Test", null, test);
        })

    });
  }

}

function sortByCreationTime(formations){

}

function runTest(type, playerTested, test){
  //REPLACE THIS LINE WITH OPTIONS WE QUERIED FROM DB THAT ARE NOW IN TEST.FORMATIONS
  //var formationNames = ["I-Right Wing", "Doubles Bunch", "Trips Right Gun"];
  formationNames = [];
  for(var i = 0; i < test.formations.length; i++){
    formationNames.push(test.formations[i].name);
  }
  multipleChoiceAnswers = [];
  test.restartQuiz();
  makeJSONCall = false
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
