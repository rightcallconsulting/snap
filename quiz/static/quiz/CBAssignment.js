var test
var formationIDs
var currentPlayerTested
var positions = [];
var makeJSONCall = true

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {

  if(makeJSONCall){
    makeJSONCall = false
    $.getJSON('/quiz/players/20/tests/1', function(data, jqXHR){
      test = createTestFromJSON(data[0]);
      formationIDs = data[0].fields.formations
      var playerID = test.playerID;
      $.getJSON('/quiz/players/'+ playerID, function(data2, jqXHR){
        currentPlayerTested = createUserFromJSON(data2[0]);
        $.getJSON('/quiz/teams/1/defensive_formations', function(dataFormation, jqXHR){
          dataFormation.forEach(function(formation){
            if(formationIDs.includes(formation.pk)){
              var defensiveFormation = createFormationFromJSON(formation);
              test.offensiveFormationIDs.push(defensiveFormation.offensiveFormationID)
              test.defensiveFormationIDs.push(defensiveFormation.id)
              test.defensiveFormations.push(defensiveFormation);
            }
          })
          $.getJSON('/quiz/teams/1/formations', function(data3, jqXHR){
            data3.forEach(function(formation){
              if(test.offensiveFormationIDs.includes(formation.pk)){
                var offensiveFormation = createFormationFromJSON(formation);
                offensiveFormation.test = test
                test.offensiveFormations.push(offensiveFormation);
              }
            })
            $.getJSON('/quiz/teams/1/formations/positions', function(data4, jqXHR){
              data4.forEach(function(position){
                if(test.offensiveFormationIDs.includes(position.fields.formation)){
                  var player = createPlayerFromJSON(position);
                  test.offensiveFormations.filter(function(formation) {return formation.id === position.fields.formation})[0].positions.push(player);
                }
                else if (test.defensiveFormationIDs.includes(position.fields.formation)){
                  var player = createPlayerFromJSON(position);
                  player.unit = "defense";
                  player.establishFill();
                  test.defensiveFormations.filter(function(formation) {return formation.id === position.fields.formation})[0].positions.push(player);
                }
              })
              test.offensiveFormations.forEach(function(formation){
                formation.populatePositions();
                test.plays.push(formation.convertToPlayObject());
              })
              test.defensiveFormations.forEach(function(formation){
                formation.populatePositions();
                test.defensivePlays.push(formation.convertToPlayObject());
              })
              test.typeTest = "CBAssignment";
              runTest("CBAssignment", currentPlayerTested, test);
            })
          })
        })

      })
    });
  }

  var runTest = function(type, user, test){

  Player.prototype.draw = function() {
    if (this.unit === "offense") {
      noStroke();
      if (this.clicked) {
        fill(255, 255, 0);
      } else if (this === test.getCurrentPlay().bigPlayer) {
        fill(255, 0, 0);
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
        } else {
          fill(this.fill);
        }
        if (this === test.getCurrentDefensivePlay().bigPlayer) {
          stroke(0, 0, 255);

          if (this.clicked) {
            fill(255, 255, 0);
          } else if (this === test.getCurrentPlay().bigPlayer) {
            fill(255, 0, 0);
          } else {
            fill(0,0,255);
          }
          ellipse(this.x, this.y, this.siz, this.siz);
          fill(0, 0, 0);
          textSize(14);
          textAlign(CENTER, CENTER);
          text(this.num, this.x, this.y);
        } else {
          if (this.isBeingTested) {
            fill(0, 0, 250);
          } else {
            fill(this.fill);
          }
          if (this === test.getCurrentDefensivePlay().bigPlayer) {
            stroke(0, 0, 255);
            if (this.clicked) {
              fill(255, 255, 0);
            } else {
              fill(0, 0, 255);
            }
            textSize(24);
          } else {
            textSize(17);
          }
          textAlign(CENTER, CENTER);
          text(this.pos, this.x, this.y);
        }
      };
    }

    Player.prototype.select = function() {
      test.clearSelection()
      this.clicked = true;
      currentReceiver = this;
    };

    Player.prototype.unselect = function() {
      this.clicked = false;
    };

    //Create Scoreboard
    var scoreboard = new Scoreboard({

    });

    test.scoreboard = scoreboard;
    test.questionsPerPlay = 2;

    //Create Buttons

    var playButton = new Button({
        x: 10,
        y: 360,
        width: 32,
        label: "Play",
        clicked: false,
        displayButton: true
    });

    var check = new Button({
        x: 53,
        y: 360,
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

    var clear = new Button({
        x: 54,
        y: 360,
        width: 43,
        label: "Clear",
        clicked: false,
        displayButton: true
    });

    var pause = new Button({
        x: 300,
        y: 360,
        width: 43,
        label: "Pause",
        clicked: false,
        displayButton: false
    });

    var stop = new Button({
        x: 355,
        y: 360,
        width: 34,
        label: "Stop",
        clicked: false,
        displayButton: false
    });

    var bigReset = new Button({
        x: width / 2 - 40,
        y: height * 4 / 5,
        width: 80,
        label: "Restart Quiz",
        clicked: false
    });

    var restart = new Button({
      x: 108,
      y: 360,
      width: 48,
      label: "Restart",
      clicked: false,
      displayButton: true
    });

    // test.getCurrentDefensivePlay().draw(test.getCurrentPlay().oline[2].x, test.getCurrentPlay().oline[2].y, test);
    test.getCurrentDefensivePlay().drawAllPlayers();
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
      check.displayButton = true;
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

    // intro scene
    var drawOpening = function() {
      if (test.startTime === 0) {
        test.startTime = millis();
      }
      field.drawBackground(test.getCurrentDefensivePlay(), height, width);
      text(test.getCurrentPlay().playName, 10, 50);
      playButton.draw();
      restart.draw();
      clear.draw();
      test.getCurrentDefensivePlay().drawAllPlayers();
      test.getCurrentPlay().drawAllPlayers();
      fill(0, 0, 0);
      textSize(20);
      text(scoreboard.feedbackMessage, 250, 360);
      scoreboard.draw(test, user);
    };

    var drawDetail = function(offensivePlayer, defensivePlayer) {
      field.drawBackground(test.getCurrentDefensivePlay(), height, width);
      playButton.draw();
      restart.draw();
      clear.draw();
      offensivePlayer.draw();
      defensivePlayer.draw();
      fill(0, 0, 0);
      textSize(20);
      text(scoreboard.feedbackMessage, 120, 60);
      scoreboard.draw(test, user);
    };

    // game scene
    var drawScene = function() {
      field.drawBackground(test.getCurrentDefensivePlay(), height, width);
      pause.draw();
      stop.draw();
      test.getCurrentPlay().qb[0].runBootleg(test.getCurrentPlay().oline[2], 1.0);
      test.getCurrentDefensivePlay().drawAllPlayers();
      test.getCurrentPlay().drawAllPlayers();
      for (var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++) {
        test.getCurrentPlay().eligibleReceivers[i].runRoute();
      }
      for (var i = 0; i < test.getCurrentDefensivePlay().defensivePlayers.length; i++) {
        test.getCurrentDefensivePlay().defensivePlayers[i].blitzGap(test.getCurrentPlay().oline[2], test.getCurrentPlay());
      }
      fill(0, 0, 0);
      textSize(20);
      text(scoreboard.feedbackMessage, 120, 60);
      scoreboard.draw(test, user);
    };

    mouseClicked = function() {
      scoreboard.feedbackMessage = "";
      if (playButton.isMouseInside()) {
        pressPlayButton();
        scoreboard.feedbackMessage = "";
      } else if (restart.isMouseInside()) {
        test.restartQuiz(test.defensivePlays[0]);

      } else if (clear.isMouseInside()) {
        test.clearSelection();
        scoreboard.feedbackMessage = "";
      } else if (pause.isMouseInside() && pause.displayButton) {
        pause.changeClickStatus();
        pause.displayButton = false;
      } else if (stop.isMouseInside() && stop.displayButton) {
        pressStopButton();
        stop.displayButton = false;
        if (pause.clicked) {
          pause.changeClickStatus();
        }

      } else if (bigReset.isMouseInside()) {
        test.restartQuiz(test.defensivePlays[0]);
        nextPlay.displayButton = true;
        playButton.displayButton = true;
        restart.displaybutton = true;
        check.displayButton = true;
        clear.displayButton = true;
        pause.displayButton = false;
        stop.displayButton = false;
      } else {

        if (test.showBigPlayers) {
          if (test.getCurrentPlay().bigPlayer.isMouseInside()) {

            if (test.getCurrentPlay().bigPlayer.clicked) {
              test.checkBigSelection();
            } else {
              test.getCurrentPlay().bigPlayer.select();
            }
          } else if (test.getCurrentDefensivePlay().bigDefender !== null && test.getCurrentDefensivePlay().bigDefender.isMouseInside()) {
            if (test.getCurrentDefensivePlay().bigDefender.clicked) {
              test.checkBigSelection();
            } else {
              test.getCurrentDefensivePlay().bigDefender.select();
            }
          }


        } else {

          var playerSelected = false;

          for (var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++) {
            var p = test.getCurrentPlay().eligibleReceivers[i];
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

      if(!test.over){
        playerBeingTested = test.establishCBPlayerTested(user);
        playerBeingTested.isBeingTested = true;
        if(!test.getCurrentDefensivePlay().bigPlayer && !test.getCurrentPlay().bigPlayer){
          var playerBeingTested = test.getCurrentDefensivePlay().playerBeingTested();
          var rightAnswerPlayer = playerBeingTested.establishRightAnswerPlayer(test.getCurrentPlay());
          test.getCurrentPlay().bigPlayer = rightAnswerPlayer.createBigPlayer(height / 2 + 100, width / 2);
          test.getCurrentDefensivePlay().bigPlayer = playerBeingTested.createBigPlayer(height / 2 - 50, width / 2);
        }
      }
      if (test.endTime > 0) {
        field.drawBackground("",height, width)
        test.drawQuizSummary();
        bigReset.displayButton = true;
        bigReset.draw();
      } else {
        if (playButton.clicked) {
          if (!pause.clicked) {
            drawScene();
          }
        } else {
          if (test.showBigPlayers) {
            test.detailView = true;
            drawDetail(test.getCurrentPlay().bigPlayer, test.getCurrentDefensivePlay().bigPlayer);
          } else {
            test.detailView = false;
            drawOpening();
          }
        }
      }
    };
  }

}
