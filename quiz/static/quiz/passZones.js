var makeJSONCall = true;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var formationNames;
var maxFormations = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;

function setup() {
  var myCanvas = createCanvas(400, 400);
  field.height = 400;
  field.heightInYards = 53.333;

  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');
  bigReset = new Button({
    x: field.getYardX(width*0.5 - 25),
    y: field.getYardY(height*0.8),
    width: 5,
    label: "Restart"
  })

  var twoDeepZone = new CoverageMap({
    name: "Two Deep Zone"
  });

  twoDeepZone.fillTwoDeepZone(field);

  if(makeJSONCall){
    var scoreboard = new Scoreboard({

    });

    test = new FormationTest({
      formations: [],
      scoreboard: scoreboard,
      coverageMap: twoDeepZone
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
            newPlayer.setFill(212,130,130);
          }
          else if(newPlayer.pos==="OL" || newPlayer.pos ==="LT" || newPlayer.pos ==="LG" || newPlayer.pos ==="C" || newPlayer.pos ==="RG" || newPlayer.pos ==="RT"){
            newPlayer.setFill(143,29,29);
          }
          else{
            newPlayer.setFill(255,0,0);
          }
          var formation = formations.filter(function(formation){return formation.id == position.fields.formation})[0]
          if(formation){
            formation.positions.push(newPlayer);
          }
        })
        formations.forEach(function(formation){
          formation.populatePositions();
        })

        test.formations = formations;
        multipleChoiceAnswers = [];
        test.restartQuiz();
        test.updateScoreboard();
        currentPlayerTested = new Player({
          zoneAssignment: CoverageMap.LEFT_OUT
        });
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
  document.getElementById('correct-answer-index').innerHTML = str(correctIndex+1);
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

//guess is a CoverageZone object
function checkAnswer(guess){
  var assignment = currentPlayerTested.zoneAssignment;
  var isCorrect = guess.type === assignment;
  if(isCorrect){
    test.registerAnswer(isCorrect);
    test.getCurrentCoverageMap().clearClicks();

    //update current player tested
  }else{
    test.registerAnswer(isCorrect);
  }

}

function drawOpening(){
  field.drawBackground(null, height, width);
  test.getCurrentFormation().drawAllPlayers(field);
  var map = test.getCurrentCoverageMap();
  if(map){
    stroke(0);
    map.draw(field);
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
    var mouseYardX = field.getYardX(mouseX);
    var mouseYardY = field.getYardY(mouseY);
    var coverageMap = test.getCurrentCoverageMap();
    var clickedZone = coverageMap.getClickedZone(mouseYardX, mouseYardY);
    if(clickedZone.clicked){
      checkAnswer(clickedZone);
    }else{
      coverageMap.clearClicks();
      clickedZone.clicked = true;
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
      fill(this.red, this.green, this.blue);
      ellipse(x, y, siz, siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      text(this.num, x, y);
    }
    else {
      noStroke();
      fill(this.red, this.green, this.blue);
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
    drawOpening();
  }
}
