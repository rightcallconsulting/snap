function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');
}

function draw() {

  var defensivePlayers = [];
  var defensiveCoverages = [];
  var QUESTION_NUM = 0;
  //Create Scoreboard
  var scoreboard = new Scoreboard({

  });

  var answerMap = { 
     "0":2, 
     "1":3,
     "2":1,
     "3":2, 
     "4":3,
     "5":1,
     "6":2, 
     "7":3,
     "8":1,
     "9":2, 
     "10":3
};

  Formation.prototype.drawAllPlayers = function(){
    this.offensivePlayers.forEach(function(player){
    player.draw();
    })
  };


  var audibleNames = ["OMAHA", "LASSO", "RAINBOW", "RODEO", "LUCY"]; //In real life, queried directly from DB by IDs

  var multipleChoiceAnswers = [];

  var formationExample = new Formation({
  });

  formationExample.createOLineAndQB();
  formationExample.createSkillPlayers();

  var test = new FormationTest({
    scoreboard: scoreboard,
    formations: [formationExample, formationExample, formationExample]
  });
  
  var cover2 = new DefensivePlay({
      playName: "Cover 2",
      defensivePlayers: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
    });

  defensiveCoverages.push(cover2);

  var cover4 = new DefensivePlay({
    playName: "Cover 4",
    defensivePlayers: [],
    dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
    lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
    dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
    dlPositions: ["RE", "DE", "NT", "DT"],
    lbPositions: ["W", "M", "S"],
    dbPositions: ["CB", "SS", "F/S", "CB"]
  });

  defensiveCoverages.push(cover4);

  var createDefense = function(){
    for(var i = 0; i < cover2.dlPositions.length; i++){
        var dl = new DefensivePlayer ({
            x: 140 + (40 * i),
            y: 170,
            fill: color(255),
            unit: "defense",
            pos: defensiveCoverages[0].dlPositions[i],
            index: i,
            num: i + 90,
            clicked: false
        });
        defensivePlayers.push(dl);
    }
    
    for(var i = 0; i < cover2.lbPositions.length; i++){
        var lb = new DefensivePlayer ({
            x: 120 + (75 * i),
            y: 125,
            fill: color(255),
            pos: defensiveCoverages[0].lbPositions[i],
            unit: "defense",
            index: 4+i,
            num: 50 + i,
            clicked: false
        });
        defensivePlayers.push(lb);
    }
    
    for(var i = 0; i < 2; i++){
        var safety = new DefensivePlayer ({
            x: 100 + (200 * i),
            y: 75,
            fill: color(255),
            pos: defensiveCoverages[0].dbPositions[i+1],
            unit: "defense",
            index: 4+i,
            num: i + 30,
            clicked: false
        });
        defensivePlayers.push(safety);
    }

    
    for(var i = 0; i < 2; i++){
        var corner = new DefensivePlayer ({
            x: 65 + (270 * i),
            y: 165,
            fill: color(255),
            pos: defensiveCoverages[0].dbPositions[i*3],
            unit: "defense",
            index: 4+i,
            num: 20 + i,
            clicked: false
        });
        defensivePlayers.push(corner);
    } 
};

createDefense(200, 200);

  var user = new User({});

  Player.prototype.draw = function() {
          noStroke();
          fill(this.fill);
          ellipse(this.x, this.y, this.siz, this.siz);
          fill(0,0,0);
          textSize(14);
          textAlign(CENTER, CENTER);
          text(this.num, this.x, this.y);  
  };

  var check = new Button({
      x: 90,
      y: 10,
      width: 43,
      label: "Check",
      clicked: false,
      displayButton: true
  });

  var nextPlay = new Button({
      x: 330,
      y: 360,
      width: 60,
      label: "Next Play",
      clicked: false,
      displayButton: true
  });

  var displayCoverage = new Button({
      x: 10,
      y: 10,
      width: 70,
      label: "Coverage?",
      clicked: false,
      displayButton: true
  });

var shuffle = function(o){
  for(var n = 0; n < 100; n++){
      for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    }
    return o;
};
  var createMultipleChoiceAnswers = function(){
    multipleChoiceAnswers = [];

    var availableNames = audibleNames.slice(0,4);
    shuffle(availableNames);
    
    for(var i = 0; i < availableNames.length; i++){
      multipleChoiceAnswers.push(new MultipleChoiceAnswer({
        x: 50 + i * width / (availableNames.length + 1),
        y: 340,
        width: width / (availableNames.length + 2),
        height: 50,
        label: availableNames[i],
        clicked: false
      }));
    }
  };

var clearDefendersClicked = function(){
  for(var i = 0; i < defensivePlayers.length; i++){
    defensivePlayers[i].clicked = false;
  }

};

var getClickedDefender = function(){
  for(var i = 0; i < defensivePlayers.length; i++){
    if(defensivePlayers[i].clicked){
      return defensivePlayers[i];
    }
  }
  return null;
};

var makeCorrectPlayer = function(player){
  var playerNum = defensivePlayers.indexOf(player);
  if(playerNum === -1 || defensivePlayers[playerNum].clicked){
    return; //wasn't found or already clicked - do nothing
  }
  clearDefendersClicked();
  defensivePlayers[playerNum].clicked = true;
  };


  var checkAnswer = function(guess){
    //you can get the selected defender if you want, as below
    var isCorrect = false;
    var selectedDefender = getClickedDefender();
    if(selectedDefender !== null){
      var playerIndex = defensivePlayers.indexOf(selectedDefender);
      var key = "" + playerIndex;
      var answerIndex = answerMap[key];
      var guessIndex = multipleChoiceAnswers.indexOf(guess);
      if(answerIndex === guessIndex){
        isCorrect = true;
      }
      
      var answerIndex = multipleChoiceAnswers.indexOf(guess);
      if(playerIndex >= 0 && answerIndex >= 0 && (playerIndex % multipleChoiceAnswers.length === answerIndex)){
        isCorrect = true;
      }
    }
    test.registerAnswer(isCorrect);
    clearAnswers();
  };


  var clearAnswers = function(){
    for(var i = 0; i < multipleChoiceAnswers.length; i++){
      if(multipleChoiceAnswers[i].clicked){
        multipleChoiceAnswers[i].changeClickStatus();
      }
    }
  };
  
  keyPressed = function(){
    
  };

  // intro scene
  var drawOpening = function() {
      background(93, 148, 81);
      field.drawBackground("", 400, 400);
      test.scoreboard.draw(test, user);

      for(var i = 0; i < defensivePlayers.length; i++){
        defensivePlayers[i].draw();
      }
      formationExample.drawAllPlayers();
      for(var i = 0; i < multipleChoiceAnswers.length; i++){
        multipleChoiceAnswers[i].draw();
      }
      
      check.draw();
      displayCoverage.draw();
      fill(0, 0, 0);
      textSize(20);
      text(test.scoreboard.feedbackMessage, 160, 360);
  };


  mouseClicked = function() {
    test.feedbackMessage = "";

      if (check.isMouseInside()){
          var selectedAnswer = null;
          for(var i = 0; i < multipleChoiceAnswers.length; i++){
            if(multipleChoiceAnswers[i].clicked){
              selectedAnswer = multipleChoiceAnswers[i];
            }
          }
          if(selectedAnswer !== null){
            checkAnswer(selectedAnswer);
          }
      }else if (displayCoverage.isMouseInside()){
          clearAnswers();
          test.scoreboard.feedbackMessage = cover2.playName;
      }else if (test.over) {
          test.restartQuiz();
          check.displayButton = true;
          displayCoverage.displayButton = true;
      }
      else{
        for(var i = 0; i < multipleChoiceAnswers.length; i++){
          var answer = multipleChoiceAnswers[i];
          if(answer.clicked){
            if(answer.isMouseInside()){
              checkAnswer(answer);
              return;
            }else{
              answer.changeClickStatus();
            }
          }else{
            if(answer.isMouseInside()){
              answer.changeClickStatus();
              return;
            }
          }
        }
        for(var i = 0; i < defensivePlayers.length; i++){
          var p = defensivePlayers[i];
          if(p.isMouseInside()){
            makeCorrectPlayer(p);
          }
        }
      }
  };

  keyTyped = function(){
    if(test.over){
      if(key === 'r'){
        test.restartQuiz();
        check.displayButton = true;
        displayCoverage.displayButton = true;
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

  draw = function() {
    background(93, 148, 81);
    if(multipleChoiceAnswers.length < 2){
      createMultipleChoiceAnswers();
    }
    if(test.over){
      background(93, 148, 81);
      noStroke();
      test.drawQuizSummary();
    }else{
      drawOpening();
    }
  };
}