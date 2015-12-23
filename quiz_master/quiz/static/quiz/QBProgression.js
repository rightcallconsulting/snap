function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {


  var csrftoken = getCookie('csrftoken');
  var currentPlayerTested = null
  var playerID = null
  // Fetch player object from Django DB

  $.getJSON('/quiz/players/11', function(data, jqXHR){
    currentPlayerTested = data[0].fields
    playerID = data[0].pk
    sendDataToServer()
  });

  $.ajaxSetup({
      beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
              // Send the token to same-origin, relative URLs only.
              // Send the token only if the method warrants CSRF protection
              // Using the CSRFToken value acquired earlier
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
          }
      }
  });

  var sendDataToServer = function(){
    $.post( "players/"+playerID+"/update", { name: "John", time: "2pm" } );
  }

  // Create Scoreboard
  var scoreboard = new Scoreboard({

  });

  var formationExample = new Formation({

  })
  formationExample.createOLineAndQB();

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

  var hawaii511 = new Play({
    eligibleReceivers: [wr1, te1, rb1, te2, wr2],
    offensivePlayers: [].concat.apply([],[rb1, te1, te2, wr1, wr2, formationExample.oline, formationExample.qb[0]]),
    playName: "511 Hawaii",
    qb: formationExample.qb[0],
    oline: formationExample.oline,
    formation: formationExample,
    test: test
  });

  var bootSlide = new Play({
    eligibleReceivers: [wr1, te1, rb1, te2, wr2],
    offensivePlayers: [].concat.apply([],[rb1, te1, te2, wr1, wr2, formationExample.oline, formationExample.qb[0]]),
    playName: "Boot-Slide",
    qb: formationExample.qb[0],
    oline: formationExample.oline,
    formation: formationExample,
    test: test
  });

  var defensePlay = new DefensivePlay({
    defensivePlayers: [],
    dlAssignments: [[5,1,2,6],[5,1,2,6],[5,1,2,6]],
    lbAssignments: [[,-3,-4],[-3,1,4],[-3,0,8]],
    dbAssignments: [[-6,-8,-9,-7],[-1,-2,-4,-5],[-1,-2,-4,-5]],
    dlPositions: ["DE", "NT", "DT", "RE"],
    lbPositions: ["W", "M", "S"],
    dbPositions: ["CB", "SS", "F/S", "CB"],
    dlNames: ["Gronk", "Davis", "Smith", "Evans"]
  });

  // Create Test
  var test = new Test({
      plays: [spider2Y, hawaii511, bootSlide],
      badGuessPenalty: 0.1,
      scoreboard: scoreboard,
      typeTest: "QBProgression"
  });

  spider2Y.test = test;
  hawaii511.test = test;
  bootSlide.test = test;

  var user = new User({});

  Player.prototype.draw = function() {
      if(this.unit === "offense"){
          noStroke();
          if(this.rank > 0){
              fill(255, 255, 0);
          }else{
              fill(this.fill);
          }
          ellipse(this.x, this.y, this.siz, this.siz);
          fill(0,0,0);
          textSize(14);
          textAlign(CENTER, CENTER);
          if(this.rank > 0){
              text(this.rank, this.x, this.y);
          }else{
              text(this.num, this.x, this.y);
          }
          if (this.showRoute && this.breakPoints.length > 0 && !playButton.clicked){
            this.displayRoute(this.breakPoints);
          }
      }
      else {
          fill(this.fill);
          textSize(17);
          textAlign(CENTER, CENTER);
          text(this.pos, this.x, this.y);
      }
  };

  Player.prototype.select = function() {
      //this.fill = color(255, 234, 0);
      this.rank = Player.rank;
      Player.rank++;
      this.clicked = true;
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
      }
      this.rank = 0;
      Player.rank--;
  };

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
      x: 108,
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

  // Draw Defense
  defensePlay.draw(formationExample.oline[2].x, formationExample.oline[2].y, test);

  var drawBackground = function(play, field) {
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
      textSize(18);
      textAlign(LEFT);
      if(play){
        fill(255,255,255)
        text(play.playName,10,23);
      }
  };

  // intro scene
  var drawOpening = function(test) {
      if(test.startTime === 0){
          test.startTime = second() + minute() * 60;
      }
      drawBackground(test.getCurrentPlay(), field);
      playButton.draw();
      check.draw();
      clear.draw();
      defensePlay.drawAllPlayers();
      test.getCurrentPlay().drawAllPlayers();
      nextPlay.draw();
      fill(0, 0, 0);
      textSize(20);
      text(scoreboard.feedbackMessage, 160, 360);
      scoreboard.draw(test, user);
  };
  // game scene
  var drawScene = function(play) {
      drawBackground(play, field);
      pause.draw();
      stop.draw();
      pause.displayButton = true;
      stop.displayButton = true;
      playButton.displayButton = false;
      check.displayButton = false;
      clear.displayButton = false;
      defensePlay.drawAllPlayers();
      test.getCurrentPlay().drawAllPlayers();
      for(var i = 0; i < play.eligibleReceivers.length; i++){
          play.eligibleReceivers[i].runRoute();
      }
      for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
          defensePlay.defensivePlayers[i].blitzGap(play.formation.oline[2],play);
      }
      play.qb.runBootleg(play.formation.oline[2], 1.0);
      fill(0, 0, 0);
      textSize(20);
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
    test.getCurrentPlay().resetPlayers(defensePlay);
    test.getCurrentPlay().inProgress = false;
    playButton.displayButton = true;
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


  mouseClicked = function() {
    currentPlay = test.getCurrentPlay();
    if(currentPlay){currentPlay.setAllRoutes();}
    scoreboard.feedbackMessage = "";
      if (playButton.isMouseInside() && !playButton.clicked) {
        pressPlayButton();
      }else if (check.isMouseInside()){
          currentPlay.checkProgression();
      }else if (clear.isMouseInside()){
          test.getCurrentPlay().clearProgression();
          scoreboard.feedbackMessage = "";
      }else if (pause.isMouseInside()) {
          pause.changeClickStatus();
      } else if (stop.isMouseInside()&& playButton.clicked) {
          pressStopButton();
      }else if (bigReset.isMouseInside() && test.questionNum === test.plays.length) {
          test.restartQuiz(defensePlay);
          nextPlay.displayButton = true;
          playButton.displayButton = true;
          check.displayButton = true;
          clear.displayButton = true;
      }
      else if (nextPlay.isMouseInside()){
        test.advanceToNextPlay("Boo! Weak!");
      }
      else if (currentPlay){
          var playerSelected = false;
          for(var i = 0; i < currentPlay.eligibleReceivers.length; i++){
              var p = currentPlay.eligibleReceivers[i];
              if (p.isMouseInside()){
                  if(p.clicked){
                      p.unselect();
                      p.showRoute = false;
                  }else{
                      p.select();
                      p.showRoute = true;
                  }
                  break;
              }
          }
      }
  };

  draw = function() {
    if(test.endTime > 0){
      bigReset.displayButton = true;
      drawBackground("", field);
      bigReset.draw();
      test.drawQuizSummary();
    }else{
      if (playButton.clicked) {
          if(!pause.clicked) {
              drawScene(test.getCurrentPlay());
          }
      } else {
          drawOpening(test);
      }
    }
  };
}
