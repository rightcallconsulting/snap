var makeJSONCall = true;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var formationNames;
var maxFormations = 5;
var bigReset;
var currentUserTested = null;
var currentPlayerTested = null;
var correctZoneFill = null;
var playerIDFromHTML = $('#player-id').data('player-id');

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

    $.getJSON('/quiz/players/'+ playerIDFromHTML, function(data2, jqXHR){
      currentUserTested = createUserFromJSON(data2[0]);
      currentUserTested.position = "M"; //remove when done testing
    })

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

//guess is a CoverageZone number
function checkAnswer(guess){
  var assignment = currentPlayerTested.zoneAssignment;
  var isCorrect = guess.type === assignment;
  if(isCorrect){
    test.getCurrentCoverageMap().clearClicks();
    test.registerAnswer(isCorrect);
  }else{
    test.updateScoreboard();
    test.registerAnswer(isCorrect);
    test.feedbackScreenStartTime = millis();
    var correctZone = test.getCurrentCoverageMap().getZoneFromIndex(currentPlayerTested.zoneAssignment)
    correctZoneFill = correctZone.fill;
    correctZone.fill = color(220, 220, 0);
  }
}


function drawFeedBackScreen(){
  //var elapsedTime = millis() - test.feedbackScreenStartTime;
  field.drawBackground(null, height, width);
  test.getCurrentFormation().drawAllPlayers(field);
  var map = test.getCurrentCoverageMap();

  //debugger;
  if(map){
    stroke(0);
    map.draw(field);
  }

}

function drawOpening(){
  field.drawBackground(null, height, width);
  test.getCurrentFormation().drawAllPlayers(field);
  var map = test.getCurrentCoverageMap();
  if(map){
    stroke(0);
    strokeWeight(1);
    map.draw(field);
  }
}

mouseClicked = function() {
  if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height){
    test.scoreboard.feedbackMessage = "";
  }else{
    return;
  }
  if (bigReset.isMouseInside(field) && test.over){
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
    background(93, 148, 81);
  }
  else if(test.over){
    background(93, 148, 81);
    noStroke();
    test.drawQuizSummary();
    bigReset.draw(field);
  }else{
    if(test.feedbackScreenStartTime){
      var elapsedTime = millis() - test.feedbackScreenStartTime;
      if(elapsedTime > 1000){
        var map = test.getCurrentCoverageMap();
        map.clearClicks();
        test.feedbackScreenStartTime = 0;
        var correctZone = map.getZoneFromIndex(currentPlayerTested.zoneAssignment);
        if(correctZoneFill){
          correctZone.fill = correctZoneFill;
          correctZoneFill = null;
        }
        test.advanceToNextFormation(test.incorrectAnswerMessage);
        currentPlayerTested = null;

      }else{
        drawFeedBackScreen();
      }
    }else{
      if(!currentPlayerTested){
        currentPlayerTested = new Player({
          zoneAssignment: CoverageMap.LEFT_OUT
        });
      }
      drawOpening();
    }

  }
}
