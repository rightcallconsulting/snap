var test
var currentPlayerTested
var positions = []
var makeJSONCall = true

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {

  if(makeJSONCall){
    makeJSONCall = false
    $.getJSON('/quiz/players/18/tests/1', function(data, jqXHR){
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
            test.typeTest = "OLAssignment"
            runTest("OLAssignment", currentPlayerTested, test);
          })
        })
      })
    });
  }

  var runTest = function(type, user, test){

    var cover2 = new DefensivePlay({
      playName: "Cover 2",
      defensivePlayers: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
      dlNames: ["Gronk", "Davis", "Smith", "Evans"]
    });

    test.defensivePlays.push(cover2);

    var cover3 = new DefensivePlay({
      playName: "Cover 3",
      defensivePlayers: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
      dlNames: ["Gronk", "Davis", "Smith", "Evans"]
    });

    test.defensivePlays.push(cover3);

    var cover4 = new DefensivePlay({
      playName: "Cover 4",
      defensivePlayers: [],
      dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
      lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
      dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
      dlPositions: ["DE", "NT", "DT", "RE"],
      lbPositions: ["W", "M", "S"],
      dbPositions: ["CB", "SS", "F/S", "CB"],
      dlNames: ["Gronk", "Davis", "Smith", "Evans"]
    });

    test.defensivePlays.push(cover4);

    //Create Scoreboard
    var scoreboard = new Scoreboard({

    });

    test.scoreboard = scoreboard;

    Player.prototype.draw = function() {
      if (this.unit === "offense") {
        noStroke();
        if (this.clicked) {
          fill(255, 255, 0);
        } else if (this === test.getCurrentPlay().bigPlayer) {
          fill(255, 0, 0);
        } else if (this.isBeingTested) {
          fill(0, 0, 250);
        } else {
          fill(this.fill);
        }
        ellipse(this.x, this.y, this.siz, this.siz);
        fill(0, 0, 0);
        textSize(14);
        textAlign(CENTER, CENTER);
        text(this.num, this.x, this.y);
      } else {
        if (this.isBeingTested) {
          fill(0, 0, 250);
        } else if (this.clicked) {
          fill(255, 255, 0);
        } else {
          fill(this.fill);
        }
        if (this === test.getCurrentPlay().bigDefender) {
          fill(0, 0, 255);
          ellipse(this.x, this.y, this.siz, this.siz);
          if (this.clickedRegion === 1) {
            fill(235, 235, 29);
            ellipse(this.x - this.siz / 4, this.y, this.siz / 2, this.siz * 0.9);
          } else if (this.clickedRegion === 2) {
            fill(235, 235, 29);
            ellipse(this.x + this.siz / 4, this.y, this.siz / 2, this.siz * 0.9);
          } else if (this.clickedRegion === 3) {
            fill(235, 235, 29);
            ellipse(this.x, this.y + this.siz / 3.3, this.siz * 0.75, this.siz * 0.4);
          }
          stroke(0, 0, 255);
          fill(0, 0, 0);
          textSize(26);
        } else {
          textSize(20);
        }
        textAlign(CENTER, CENTER);
        text(this.pos, this.x, this.y);
      }
    };

    Player.prototype.select = function() {
      test.getCurrentPlay().clearSelection(test, test.getCurrentDefensivePlay());
      this.clicked = true;
      currentDefender = this;
    };

    Player.prototype.unselect = function() {
      this.clicked = false;
    };

    // Create Buttons
    var playButton = new Button({
      x: 10,
      y: 360,
      width: 32,
      label: "Play",
      clicked: false
    });

    var restart = new Button({
      x: 108,
      y: 360,
      width: 48,
      label: "Restart",
      clicked: false
    });

    var clear = new Button({
      x: 53,
      y: 360,
      width: 43,
      label: "Clear",
      clicked: false
    });

    var pause = new Button({
      x: 300,
      y: 360,
      width: 43,
      label: "Pause",
      clicked: false
    });

    var stop = new Button({
      x: 355,
      y: 360,
      width: 34,
      label: "Stop",
      clicked: false
    });

    var bigReset = new Button({
      x: width / 2 - 40,
      y: height * 4 / 5,
      width: 80,
      label: "Restart Quiz",
      clicked: false
    });

    // intro scene
    var drawOpening = function() {
      currentPlayer = test.establishOLPlayerTested(user);
      currentPlayer.isBeingTested = true;
      if(test.getCurrentDefensivePlay().defensivePlayers.length === 0){
        test.getCurrentDefensivePlay().draw(test.getCurrentPlay().oline[2].x, test.getCurrentPlay().oline[2].y);
      }
      test.getCurrentPlay().oline[3].blockingAssignment = test.getCurrentDefensivePlay().defensivePlayers[2];
      if (test.startTime === 0) {
        test.startTime = millis();
      }
      field.drawBackground(test.getCurrentPlay(), height, width);
      playButton.draw();
      restart.draw();
      clear.draw();
      test.getCurrentDefensivePlay().drawAllPlayers();
      test.getCurrentPlay().drawAllPlayers();
      fill(0, 0, 0);
      textSize(20);
      noStroke();
      text(scoreboard.feedbackMessage, 250, 360);
      scoreboard.draw(test, user);
    };

    var drawDetail = function() {
      field.drawBackground(test.getCurrentPlay(), height, width);
      playButton.draw();
      restart.draw();
      clear.draw();
      if (test.getCurrentPlay().bigPlayer !== null && test.getCurrentPlay().bigDefender !== null) {
        test.getCurrentPlay().bigPlayer.draw();
        test.getCurrentPlay().bigDefender.draw();
      } else if (currentPlayer !== null && currentDefender !== null) {
        test.getCurrentPlay().bigPlayer = test.getCurrentPlay().playerBeingTested().createBigPlayer(height/2 + 100, width/2);
        test.getCurrentPlay().bigDefender = new Player({
          x: width / 2,
          y: height / 2 - 50,
          unit: "defense",
          siz: currentDefender.siz * 2.5,
          pos: currentDefender.pos
        });
      } else {

      }
      fill(0, 0, 0);
      textSize(20);
      noStroke();
      text(scoreboard.feedbackMessage, 120, 60);
      scoreboard.draw(test, user);
    };

    var drawDetailScene = function() {
      field.drawBackground(test.getCurrentPlay(), height, width);
      playButton.draw();
      pause.draw();
      stop.draw();
      test.getCurrentPlay().bigDefender.draw();
      test.getCurrentPlay().bigPlayer.draw();
      test.getCurrentPlay().bigPlayer.blockMan(test.getCurrentPlay().bigDefender, 0, false);
      fill(0, 0, 0);
      textSize(20);
      noStroke();
      text(scoreboard.feedbackMessage, 120, 60);
      scoreboard.draw(test, user);
    };

    var drawScene = function() {
      field.drawBackground(test.getCurrentPlay(), height, width);
      pause.draw();
      stop.draw();
      test.getCurrentDefensivePlay().drawAllPlayers();
      test.getCurrentPlay().drawAllPlayers();
      for (var i = 0; i < test.getCurrentPlay().oline.length; i++) {
        var olineman = test.getCurrentPlay().oline[i];
        olineman.blockMan(test.getCurrentDefensivePlay().defensivePlayers[i], 0, false);
      }
      for (var i = 0; i < test.getCurrentDefensivePlay().defensivePlayers.length; i++) {
        test.getCurrentDefensivePlay().defensivePlayers[i].blitzGap(test.getCurrentPlay().oline[2], test.getCurrentPlay());
      }
      fill(0, 0, 0);
      textSize(20);
      noStroke();
      text(scoreboard.feedbackMessage, 120, 60);
      scoreboard.draw(test, user);
    };

    keyPressed = function() {
      if (keyCode === 32){
        if (!test.getCurrentPlay().inProgress){
          pressPlayButton();
        }
        else {
          pause.changeClickStatus();
        }
      }
      else if (keyCode === 81){
        pressStopButton();
      }
    };

    pressStopButton = function(){
      playButton.changeClickStatus();
      if (pause.clicked) {
        pause.changeClickStatus();
      }
      if (test.showBigPlayers){
        test.getCurrentPlay().bigPlayer.resetToStart();
      }
      test.getCurrentPlay().resetPlayers(test.getCurrentDefensivePlay());
      test.getCurrentPlay().inProgress = false;
      playButton.displayButton = true;
      restart.displayButton = true;
      clear.displayButton = true;
      pause.displayButton = false;
      stop.displayButton = false;
    }

    pressPlayButton = function() {
      playButton.changeClickStatus();
      test.getCurrentPlay().setAllRoutes();
      scoreboard.feedbackMessage = "";
      test.getCurrentPlay().inProgress = true;
    };

    mouseClicked = function() {
      scoreboard.feedbackMessage = "";
      if (playButton.isMouseInside()) {
        pressPlayButton();
        for (var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++) {
          var receiver = test.getCurrentPlay().eligibleReceivers[i]
          receiver.setRoute(receiver.routeNum, test.getCurrentPlay().oline[2]);
        }
        scoreboard.feedbackMessage = "";
      } else if (restart.isMouseInside()) {
        test.restartQuiz(test.defensivePlays[0]);
        test.getCurrentPlay().clearSelection(test, test.getCurrentDefensivePlay());
      } else if (clear.isMouseInside()) {
        test.getCurrentPlay().clearSelection(test, test.getCurrentDefensivePlay());
        scoreboard.feedbackMessage = "";
      } else if (pause.isMouseInside()) {
        pause.changeClickStatus();
      } else if (stop.isMouseInside()) {
          pressStopButton();
        if (pause.clicked) {
          pause.changeClickStatus();
        }
      } else if (bigReset.isMouseInside()) {
        test.restartQuiz(test.defensivePlays[0]);
        test.getCurrentPlay().clearSelection(test, test.getCurrentDefensivePlay());
      } else {
        if (test.showBigPlayers) {
          if (test.getCurrentPlay().bigDefender !== null && test.getCurrentPlay().bigDefender.isMouseInside()) {
            var clickedRegion = 1;
            if (mouseX > test.getCurrentPlay().bigDefender.x) {
              clickedRegion = 2;
            }
            if (mouseY > test.getCurrentPlay().bigDefender.y + (test.getCurrentPlay().bigDefender.siz / 5)) {
              clickedRegion = 3;
            }
            if (clickedRegion === test.getCurrentPlay().bigDefender.clickedRegion) {
              // test.getCurrentPlay().bigPlayer.checkBigSelection(test);
              test.checkBigSelection();
            } else {
              test.getCurrentPlay().bigDefender.clickedRegion = clickedRegion;
            }
          }
        } else {
          for (var i = 0; i < test.getCurrentDefensivePlay().defensivePlayers.length; i++) {
            var p = test.getCurrentDefensivePlay().defensivePlayers[i];
            if (p.isMouseInside()) {
              if (p.clicked) {
                p.checkSelection(test);
              } else {
                p.select();
              }
              break;
            }
          }
        }

      }
    };

    draw = function() {
      if (test.endTime > 0) {
        field.drawBackground(test.getCurrentPlay(),height, width)
        test.drawQuizSummary();
        bigReset.displayButton = true;
        bigReset.draw();
      } else {
        if (playButton.clicked) {
          if (!pause.clicked) {
            if (test.showBigPlayers) {
              drawDetailScene();
            } else {
              drawScene();
            }
          }
        } else {
          if (test.showBigPlayers) {
            drawDetail();
          } else {
            drawOpening();
          }
        }
      }
    };
  }
}
