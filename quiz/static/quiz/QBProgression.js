var test
var currentPlayerTested
var positions = []
var makeJSONCall = true
var testIDFromHTML = $('#test-id').data('test-id')
var exitDemo = null;
var demoComplete = false;
var exitDemo = null;
var defensePlay = null;


function setup() {
  var myCanvas = createCanvas(550, 550);
  field.height = 550;
  field.width = 550;
  field.heightInYards = 54;
  field.ballYardLine = 75;
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
  /*var m = document.getElementById('display-box');
  m.style.width = '552px';
  m.style.height = '650px';
  var sidebar = document.getElementById('quiz-sidebar');
  var scoreboard = document.getElementById('quiz-scoreboard');
  sidebar.style.height = '650px';
  scoreboard.style.height = '650px';
  sidebar.style.width = '330px';
  scoreboard.style.width = '330px';*/


  exitDemo = new Button({
    label: "",
    x: field.getYardX(50),
    y: field.getYardY(50),
    height: 1.5,
    width: 1.5,
    clicked: false,
    fill: color(255, 255, 255)
  });
}

function setupDemoScreen(){
  test.showDemo = true;
  demoComplete = false;
  test.demoStartTime = millis();
  test.getCurrentPlay().clearProgression();
};

function exitDemoScreen(){
  test.showDemo = false;
  demoComplete = false;
  test.getCurrentPlay().clearProgression();
};


function draw() {
  // Fetch player object from Django DB
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
            test.updateProgress();
            test.updateScoreboard();
            runTest("QBProgression", currentPlayerTested, test);
          })
        })
      })
});
}

var runTest = function(type, playerTested, test){
    // Create Scoreboard
    var scoreboard = new Scoreboard({

    });
    test.scoreboard = scoreboard

    defensePlay = new DefensivePlay({
      defensivePlayers: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
      dlNames: ["Gronk", "Davis", "Smith", "Evans"]
    });

    var user = new User({});

    Player.prototype.draw = function(field) {
      var x = field.getTranslatedX(this.x);
      var y = field.getTranslatedY(this.y);
      var siz = field.yardsToPixels(this.siz);
      var letters = ["A", "B", "C", "D", "E"];
      if (this.showRoute && this.breakPoints.length > 0){
        this.drawBreakPoints(field);
      }
      if(this.unit === "offense"){
        noStroke();
        if(this.rank !== 0){
          fill(255, 255, 0);
        }else{
          fill(this.fill);
        }
        ellipse(x, y, siz, siz);
        fill(0,0,0);
        textSize(14);
        textAlign(CENTER, CENTER);
        if(this.rank > 0){
          text(this.rank, x, y);
        } else if(this.rank < 0){
          text(letters[-1 - this.rank], x, y);
        }else{
          text(this.num, x, y);
        }

      }
      else {
        fill(this.red,this.green,this.blue);
        textSize(17);
        textAlign(CENTER, CENTER);
        text(this.pos, x, y);
      }
    };

    Player.prototype.select = function() {
      if(keyIsDown(SHIFT)){
        this.rank = Player.altRank;
        Player.altRank--;
        this.clicked = true;
      }else{
        this.rank = Player.rank;
        Player.rank++;
        this.clicked = true;
      }
    };

    Player.prototype.unselect = function() {
      this.clicked = false;
      currentPlay = test.getCurrentPlay();
      if(currentPlay && this.rank > 0 && this.rank < Player.rank - 1){
            //decrement the later guys' ranks
            for(var i = 0; i < currentPlay.eligibleReceivers.length; i++){
              var p = currentPlay.eligibleReceivers[i];
              if(p.rank > this.rank){
                p.rank--;
              }
            }
          }else if(currentPlay && this.rank < 0 && this.rank > Player.altRank + 1){
            for(var i = 0; i < currentPlay.eligibleReceivers.length; i++){
              var p = currentPlay.eligibleReceivers[i];
              if(p.rank < this.rank){
                p.rank++;
              }
            }
          }
          if(this.rank > 0){
            Player.rank--;
          }else if(this.rank < 0){
            Player.altRank++;
          }
          this.rank = 0;
        };

        var bigReset = new Button({
          x: field.getYardX(width/2)-4,
          y: field.getYardY(height * 0.8),
          width: 8,
          label: "Restart Quiz",
          clicked: false
        });

    // Draw Defense
    defensePlay.draw(field, test);

    var drawBackground = function(play, field) {
      field.drawBackground(play, height, width);
    };

    // intro scene
    var drawOpening = function(test) {
      if(test.startTime === 0){
        test.startTime = second() + minute() * 60;
      }
      drawBackground(test.getCurrentPlay(), field);
      defensePlay.drawAllPlayers(field);
      test.getCurrentPlay().drawAllPlayers(field);
    };
    // game scene
    var drawScene = function(play) {
      drawBackground(play, field);
      defensePlay.drawAllPlayers(field);
      test.getCurrentPlay().drawAllPlayers(field);
      for(var i = 0; i < play.eligibleReceivers.length; i++){
        play.eligibleReceivers[i].runRoute();
      }
      for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
        defensePlay.defensivePlayers[i].blitzGap(play.oline[2],play);
      }
    };

    function drawDemoScreen(){
      drawBackground(test.getCurrentPlay(), field);
      defensePlay.drawAllPlayers(field);
      var timeElapsed = millis() - test.demoStartTime;
      var play = test.getCurrentPlay();
      if(play){
        play.drawAllPlayers(field);
        var x1 = field.getTranslatedX(exitDemo.x);
        var y1 = field.getTranslatedY(exitDemo.y);
        var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
        var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
        exitDemo.draw(field);
        stroke(0);
        line(x1, y1, x2, y2);
        line(x1, y2, x2, y1);
        noStroke();
        fill(0, 0, 0);
        textSize(22);
        textAlign(LEFT);
        text("DEMO", x2+5, (y1+y2)/2);
        if(timeElapsed < 2000){
          fill(220,0,0);
          stroke(220, 0, 0);
          line(field.width / 2, 80, field.width / 2, 20);
          noStroke();
          triangle(field.width / 2 - 20, 20, field.width / 2 + 20, 20, field.width/2, 0);
          fill(220,0,0);
          textAlign(LEFT);
          text("Your play call is here", field.width / 2 + 20, 50);
        }else if(timeElapsed < 4000){
          fill(220, 220, 0);
          textAlign(CENTER);
          text("Click players in correct progression order", field.width / 2, (5 * field.height) / 6);
        }else{
          var clickedReceivers = [];
          for(var i = 0; i < play.eligibleReceivers.length; i++){
            var receiver = play.eligibleReceivers[i];
            if(receiver.clicked){
              clickedReceivers.push(receiver);
            }else{
              var x = field.getTranslatedX(receiver.startX);
              var y = field.getTranslatedY(receiver.startY);
              var siz = field.yardsToPixels(receiver.siz);
              y -= siz / 2;
              stroke(220, 220, 0);
              fill(220, 220, 0);
              line(x, y - 80, x, y - 15);
              triangle(x - 15, y - 15, x + 15, y - 15, x, y);
              noStroke();
            }
          }
          textAlign(CENTER);
          if(demoComplete){
            fill(220, 220, 0);
            text("Demo Complete!\nClick anywhere to return to quiz", field.width / 2, (5 * field.height) / 6);
          }
          else if(clickedReceivers.length === 1){
            fill(220, 220, 0);

            if(demoComplete){
              text("Great!  You're ready to start!", 60, 300);
            }else{
              text("Click next player in progression", field.width / 2, (5 * field.height) / 6);
            }
          }else{
            if(clickedReceivers.length > 1){
              text("Click on a player again to unselect him", field.width / 2, (5 * field.height) / 6);
              text("Click the checkbox to check answer", field.width / 2, (11 * field.height) / 12);
              //draw line to check box
            }else{
              text("Click players in correct progression order", field.width / 2, (5 * field.height) / 6);
            }

          }
        }
      }
    };
    var drawFeedBackScreen = function(test){
      drawBackground(test.getCurrentPlay(), field);
      defensePlay.drawAllPlayers(field);
      test.getCurrentPlay().drawAllPlayers(field);
    };

    keyPressed = function() {
      if (keyCode === 32){
        if (!test.getCurrentPlay().inProgress){
          pressPlayButton();
        }
        else {
          //pause.changeClickStatus();
        }
      }
      else if (keyCode === 81){
        pressStopButton();
      }
    };

    keyTyped = function(){
      if(key === 'r' && test.over){
        test.restartQuiz(defensePlay);
      }
    }

    pressStopButton = function(){
      // playButton.changeClickStatus();
      // if (pause.clicked) {
      //     pause.changeClickStatus();
      // }
      if (test.getCurrentPlay()){
        test.getCurrentPlay().resetPlayers(defensePlay);
        test.getCurrentPlay().inProgress = false;
      }
      // playButton.displayButton = true;
      // check.displayButton = true;
      // clear.displayButton = true;
      // pause.displayButton = false;
      // stop.displayButton = false;
    }

    pressPlayButton = function() {
      if (test.getCurrentPlay()){
        test.getCurrentPlay().setAllRoutes();
        scoreboard.feedbackMessage = "";
        test.getCurrentPlay().inProgress = true;
      }
    };

    mouseClicked = function() {

      currentPlay = test.getCurrentPlay();
      if (bigReset.isMouseInside(field) && test.questionNum === test.plays.length) {
        test.restartQuiz(defensePlay);
      }else if(test.showDemo && exitDemo.isMouseInside(field) || demoComplete){
        exitDemoScreen();
      }else if(test.feedBackScreenStartTime){
        return;
      }else if (currentPlay){
        var playerSelected = false;
        for(var i = 0; i < currentPlay.eligibleReceivers.length; i++){
          var p = currentPlay.eligibleReceivers[i];
          if (p.isMouseInside(field)){
            if(p.clicked){

              p.unselect();
              p.showRoute = false;

            }else{
              p.select();
              p.showRoute = true;
            }
            return false;
          }
        }
      }
    };

    draw = function() {
      if(test.endTime > 0){
        bigReset.displayButton = true;
        field.drawBackground(null, height, width);
        bigReset.draw(field);
        test.drawQuizSummary();

      }else if(test.showDemo){
        drawDemoScreen();
      }else if(test.feedBackScreenStartTime){
        var elapsedTime = millis() - test.feedBackScreenStartTime;
        if(elapsedTime > 2000){
          test.feedBackScreenStartTime = 0;
          test.advanceToNextPlay(test.incorrectAnswerMessage);
        }else{
          drawFeedBackScreen(test);
        }
      }else{
        drawOpening(test);
      }
    };
  }
}
