function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {
  var selectedGap = -1;
  var playerBeingTested = null;
  var test = new Test({
      plays: [],
      badGuessPenalty: 0.1,
      scoreboard: scoreboard,
      typeTest: "Option"
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
      textSize(17);
      textAlign(CENTER, CENTER);
      text(this.pos, this.x, this.y);
    }
  };

  Player.prototype.select = function() {
    test.clearSelection();
    this.clicked = true;
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

  var checkSelection = function(selection){
    test.registerAnswer(selection === 2);
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


/*
  pressStopButton = function(){
    playButton.changeClickStatus();
    if (pause.clicked) {
      pause.changeClickStatus();
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

*/

  var getGap = function(x,y){
    var play = test.getCurrentPlay();
    if(play === null){
      return -1;
    }
    var ballX = play.oline[2].startX;
    var leftX = ballX - play.oline[2].siz * 4;
    var rightX = ballX + play.oline[2].siz * 4;
    var ballY = play.oline[2].startY;
    var topY = ballY - play.oline[2].siz;
    var bottomY = ballY + play.oline[2].siz;

    if(x >= leftX && x <= rightX && y >= topY && y <= bottomY){
      var gap = (abs((x-ballX)/(ballX-leftX))*4).toFixed();
      if(x > ballX){
        gap *= 2;
      }else{
        gap = gap*2 + 1;
      }
      return gap;
    }else{
      return -1;
    }
  }

  var getGapX = function(gap){
    var play = test.getCurrentPlay();
    if(play === null){
      return -1;
    }
    var ballX = play.oline[2].startX;
    var leftX = ballX - play.oline[2].siz * 4;
    var rightX = ballX + play.oline[2].siz * 4;

    var offset = gap;
    if(offset % 2 === 1){
      offset--;
      offset *= -1;
    }
    offset /= 2;

    return ballX + offset*abs((ballX-leftX)/4);

  }

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

    if(selectedGap >= 0 && playerBeingTested !== null){
      //draw a line from playerBeingTested to the gap he's blitzing
      stroke(255,255,0);
      line(playerBeingTested.x, playerBeingTested.y, getGapX(selectedGap), test.getCurrentPlay().oline[2].startY+30);
      noStroke();
    }

    fill(0, 0, 0);
    textSize(20);
    text(scoreboard.feedbackMessage, 250, 360);
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
    scoreboard.feedbackMessage = "";
    if(test.over || test.getCurrentDefensivePlay() === null){
      if(bigReset.isMouseInside()){
        test.restartQuiz(cover2);
        selectedGap = -1;
        nextPlay.displayButton = true;
        playButton.displayButton = true;
        restart.displaybutton = true;
        check.displayButton = true;
        clear.displayButton = true;
        pause.displayButton = false;
        stop.displayButton = false;
      }
    } else if (playButton.isMouseInside()) {
      pressPlayButton();
      scoreboard.feedbackMessage = "";
    } else if (restart.isMouseInside()) {
      test.restartQuiz(cover2);

    } else if (clear.isMouseInside()) {
      test.getCurrentPlay().clearSelection();
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

    } else {
      //Check for clicking on a gap to blitz
      var gap = getGap(mouseX, mouseY);
      if(gap >= 0){
        if(gap === selectedGap){
          checkSelection(selectedGap);
          selectedGap = -1;
        }else{
          selectedGap = gap;
        }
      }else{
        selectedGap = -1;
      }
    }
  };

  draw = function() {
    if(!test.over){
      if(test.getCurrentDefensivePlay().defensivePlayers.length === 0){
        test.getCurrentDefensivePlay().draw(width/2, height/2, test);
      }
      test.getCurrentDefensivePlay().defensivePlayers[5].isBeingTested = true;
      playerBeingTested = test.getCurrentDefensivePlay().defensivePlayers[5];
      //test.getCurrentDefensivePlay().defensivePlayers[10].CBAssignment = test.getCurrentPlay().eligibleReceivers[4];
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
        drawOpening();
      }
    }
  };
}
