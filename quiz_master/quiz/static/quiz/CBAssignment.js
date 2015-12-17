function setup() {
  createCanvas(400, 400);
  background(58, 135, 70);
}

function draw() {

  var test = new Test({
      plays: [],
      badGuessPenalty: 0.1,
      scoreboard: scoreboard,
      typeTest: "CBAssignment"
  });

  var formationExample = new Formation({

  })
  formationExample.createOLineAndQB();

  var user = new User({

  })

  // Create Players
  var rb1 = new Player ({
      x: formationExample.qb[0].x,
      y: formationExample.qb[0].y + 60,
      num: 22,
      fill: color(255, 0, 0),
      progressionRank: 3,
      routeNum: 2
  });

  var te1 = new Player ({
      x: formationExample.oline[0].x - 30,
      y: formationExample.oline[0].y,
      num: 80,
      fill: color(255, 0, 0),
      progressionRank: 2,
      routeNum: 3
  });
  var te2 = new Player({
     x: formationExample.oline[4].x + 40,
     y: formationExample.oline[4].y + 30,
     num: 17,
     fill: color(255, 0, 0),
     progressionRank: 4,
     routeNum: 4
  });
  var wr1 = new Player({
     x: formationExample.oline[0].x - 80,
     y: formationExample.oline[4].y + 30,
     num: 88,
     fill: color(255, 0, 0),
     progressionRank: 1,
     routeNum: 0
  });
  var wr2 = new Player({
     x: formationExample.oline[4].x + 80,
     y: formationExample.oline[4].y,
     num: 84,
     fill: color(255, 0, 0),
     progressionRank: 5,
     routeNum: 1
  });

  // Create Plays
  var spider2Y = new Play({
    eligibleReceivers: [wr1, te1, rb1, te2, wr2],
    offensivePlayers: [].concat.apply([],[rb1, te1, te2, wr1, wr2, formationExample.oline, formationExample.qb[0]]),
    playName: "Spider-2 Y Banana",
    qb: formationExample.qb[0],
    oline: formationExample.oline,
    formation: formationExample,
    test: test
  });

  test.plays.push(spider2Y);

  var hawaii511 = new Play({
    eligibleReceivers: [wr1, te1, rb1, te2, wr2],
    offensivePlayers: [].concat.apply([],[rb1, te1, te2, wr1, wr2, formationExample.oline, formationExample.qb[0]]),
    playName: "511 Hawaii",
    qb: formationExample.qb[0],
    oline: formationExample.oline,
    formation: formationExample,
    test: test
  });

  test.plays.push(hawaii511);

  var bootSlide = new Play({
    eligibleReceivers: [wr1, te1, rb1, te2, wr2],
    offensivePlayers: [].concat.apply([],[rb1, te1, te2, wr1, wr2, formationExample.oline, formationExample.qb[0]]),
    playName: "Boot-Slide",
    qb: formationExample.qb[0],
    oline: formationExample.oline,
    formation: formationExample,
    test: test
  });

  test.plays.push(bootSlide);

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

  test.getCurrentDefensivePlay().draw(formationExample.oline[2].x, formationExample.oline[2].y, test);
  test.getCurrentDefensivePlay().defensivePlayers[10].CBAssignment = test.getCurrentPlay().eligibleReceivers[4];

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
    test.getCurrentPlay().qb.runBootleg(test.getCurrentPlay().oline[2], 1.0);
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
    if(test.getCurrentDefensivePlay()){
      var playerBeingTested = test.getCurrentDefensivePlay().playerBeingTested();
      var rightAnswerPlayer = playerBeingTested.CBAssignment;
    }
    scoreboard.feedbackMessage = "";
    if (playButton.isMouseInside()) {
      pressPlayButton();
      scoreboard.feedbackMessage = "";
    } else if (restart.isMouseInside()) {
      test.restartQuiz(cover2);

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
      test.restartQuiz(cover2);
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
      test.getCurrentDefensivePlay().defensivePlayers[10].isBeingTested = true;
      test.getCurrentDefensivePlay().defensivePlayers[10].CBAssignment = test.getCurrentPlay().eligibleReceivers[4];
      if(!test.getCurrentDefensivePlay().bigPlayer && !test.getCurrentPlay().bigPlayer){
        var playerBeingTested = test.getCurrentDefensivePlay().playerBeingTested();
        var rightAnswerPlayer = playerBeingTested.CBAssignment;
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
