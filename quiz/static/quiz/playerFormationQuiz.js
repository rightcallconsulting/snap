var makeJSONCall = true;
var testIDFromHTML = 33; //filler
var playerIDFromHTML = $('#player-id').data('player-id')
var test;
var formationNames;
var maxFormations = 5;
var bigReset;
var testPlayer = null;
var currentPlayerTested = null;
var answers = [];

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');

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

    $.getJSON('/quiz/players/'+ playerIDFromHTML, function(data2, jqXHR){
      currentPlayerTested = createUserFromJSON(data2[0]);
      //currentPlayerTested.pos = "WR";
    })

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
          var hasChanged = false;
          for(var j = 0; j < formation.offensivePlayers.length; j++){
            var p = formation.offensivePlayers[j];
            if(p.pos === currentPlayerTested.position){
              answers.push([p.x, p.y]);

              var oldCopy = formation.offensivePlayers.slice();
              formation.offensivePlayers = formation.offensivePlayers.slice(0, j);
              formation.offensivePlayers = formation.offensivePlayers.concat(oldCopy.slice(j+1));
              hasChanged = true;
              break;
            }
          }
          if(!hasChanged){
            debugger;
            formations = formations.slice(0, i).concat(formations.slice(i+1));
            i--;
          }
        }

        test.formations = formations;

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

function checkAnswer(){
  var answer = answers[test.questionNum];
  var dx = Math.abs(answer[0] - testPlayer.x);
  var dy = Math.abs(answer[1] - testPlayer.y);
  var dist = Math.sqrt(dx*dx+dy*dy);

  var isCorrect = (dist < 3);
  //debugger;
  if(isCorrect){
    test.advanceToNextFormation(test.correctAnswerMessage);
    testPlayer = null;
    test.score++;
  }else{
    test.scoreboard.feedbackMessage = test.incorrectAnswerMessage;
    test.incorrectGuesses++;
  }
}


function drawOpening(){
  field.drawBackground(null, height, width);
  test.scoreboard.draw(test, null);

  test.getCurrentFormation().drawAllPlayers(field);
  if(testPlayer){
    testPlayer.draw(field);
  }

  fill(0, 0, 0);
  textSize(20);
  text(test.scoreboard.feedbackMessage, 160, 360);
  textAlign(LEFT);
  text(test.getCurrentFormation().name, 10, 23);
}


mouseClicked = function() {
  test.scoreboard.feedbackMessage = "";
  if (test.over) {
    if(bigReset.isMouseInside(field)){
      test.restartQuiz();
    }
  }
  else{
    var y = field.getYardY(mouseY);
    if(y > field.ballYardLine){
      y = field.ballYardLine;
    }
    if(testPlayer){
      if(testPlayer.isMouseInside(field)){
        checkAnswer();
      }else{
        testPlayer.x = field.getYardX(mouseX);
        testPlayer.y = y;

      }

    }else{
      testPlayer = new Player({
        x: field.getYardX(mouseX),
        y: y,
        fill: color(0, 0, 220),
        pos: currentPlayerTested.position,
        num: currentPlayerTested.num
      });
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

 Player.prototype.draw = function(field){
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var siz = field.yardsToPixels(this.siz);
  if(this.unit === "offense"){
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
    bigReset.draw();
  }else{
  drawOpening();
}
}
