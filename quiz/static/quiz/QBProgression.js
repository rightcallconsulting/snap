var test
var currentPlayerTested
var positions = []
var makeJSONCall = true
var testIDFromHTML = $('#test-id').data('test-id')
function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

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

    var user = new User({});

    Player.prototype.draw = function(field) {
      var x = field.getTranslatedX(this.x);
      var y = field.getTranslatedY(this.y);
      var siz = field.yardsToPixels(this.siz);
      var letters = ["A", "B", "C", "D", "E"];
      if (this.showRoute && this.breakPoints.length > 0 && !playButton.clicked){
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

    var playButton = new Button({
        x: 10,
        y: 360,
        width: 32,
        label: "Play",
        clicked: false,
        displayButton: false
    });

    var check = new Button({
        x: 53,
        y: 360,
        width: 43,
        label: "Check",
        clicked: false,
        displayButton: false
    });

    var nextPlay = new Button({
        x: 330,
        y: 360,
        width: 60,
        label: "Next Play",
        clicked: false,
        displayButton: false
    });

    var clear = new Button({
        x: 108,
        y: 360,
        width: 43,
        label: "Clear",
        clicked: false,
        displayButton: false
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
        // playButton.draw();
        // check.draw();
        // clear.draw();
        defensePlay.drawAllPlayers(field);
        test.getCurrentPlay().drawAllPlayers(field);
        // nextPlay.draw();
        fill(0, 0, 0);
        textSize(20);
        text(scoreboard.feedbackMessage, 160, 360);
        scoreboard.draw(test, user);
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
        //play.qb[0].runBootleg(play.oline[2], 1.0);
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
      // playButton.changeClickStatus();
      // if (pause.clicked) {
      //     pause.changeClickStatus();
      // }
      if (test.getCurrentPlay()){
        playButton.clicked = false;
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
        playButton.changeClickStatus();
        test.getCurrentPlay().setAllRoutes();
        scoreboard.feedbackMessage = "";
        test.getCurrentPlay().inProgress = true;
      }
    };

    mouseClicked = function() {
      currentPlay = test.getCurrentPlay();
      if(currentPlay){currentPlay.setAllRoutes();}
      // scoreboard.feedbackMessage = "";
        if (playButton.isMouseInside(field) && !playButton.clicked) {
          pressPlayButton();
        }else if (check.isMouseInside(field)){
            currentPlay.checkProgression();
        }else if (clear.isMouseInside(field)){
            test.getCurrentPlay().clearProgression();
            scoreboard.feedbackMessage = "";
        }else if (pause.isMouseInside(field)) {
            pause.changeClickStatus();
        } else if (stop.isMouseInside(field)&& playButton.clicked) {
            pressStopButton();
        }else if (bigReset.isMouseInside(field) && test.questionNum === test.plays.length) {
            test.restartQuiz(defensePlay);
            // nextPlay.displayButton = true;
            // playButton.displayButton = true;
            // check.displayButton = true;
            // clear.displayButton = true;
        }
        else if (nextPlay.isMouseInside(field)){
          test.skips++;
          test.advanceToNextPlay("Boo! Weak!");
        }
        else if (currentPlay){
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
        debugger;
        bigReset.displayButton = true;
        field.drawBackground(null, height, width);
        bigReset.draw(field);
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
}
