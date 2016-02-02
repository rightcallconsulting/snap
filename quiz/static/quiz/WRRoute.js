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
            runTest("WRRoute", currentPlayerTested, test);
          })
        })
      })
    });
  }
  var runTest = function(type, playerTested, test){
    //Field Position Variables
    var scoreboard = new Scoreboard({

    });

    test.scoreboard = scoreboard;

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


    // Global Variables

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
            if (this.showPreviousRoute){
              stroke(0, 255, 0);
              this.displayRoute(this.previousRouteBreakpoints);
            }
            if (this.showPreviousRouteGuess){
              stroke(255, 0, 0);
              this.displayRoute(this.previousRouteGuess);
            }
        }
        else {
            fill(this.fill);
            textSize(17);
            textAlign(CENTER, CENTER);
            text(this.pos, this.x, this.y);
        }
        this.drawRoute();
        noStroke();
    };

    Player.prototype.select = function() {
        //this.fill = color(255, 234, 0);
        this.rank = 1;
        this.clicked = true;
        // Unselect all other players to isolate one route
        for(var i = 0; i < test.getCurrentPlay().eligibleReceivers.length; i++){
          var p = test.getCurrentPlay().eligibleReceivers[i];
          if(p !== this){
            p.clicked = false;
            p.rank = 0;
          }
        }
    };

    Player.prototype.unselect = function() {
        this.clicked = false;
        this.routeCoordinates = [[this.startX, this.startY]];
        this.routeNodes = [];
        this.rank = 0;
    };

    // Create Buttons
    var playButton = new Button({
        x: 10,
        y: 360,
        width: 32,
        label: "Play",
        clicked: false,
        displayButton: true
    });

    // Create Buttons
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

    var back = new Button({
        x: 10,
        y: 320,
        width: 35,
        label: "Back",
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

    //Create defense
    defensePlay.draw(test.getCurrentPlay().oline[2].x, test.getCurrentPlay().oline[2].y, test);

    // intro scene
    var drawOpening = function(test) {
        if(test.startTime === 0){
            test.startTime = second() + minute() * 60;
        }
        field.drawBackground(test.getCurrentPlay(), height, width);
        // playButton.draw();
        // check.draw();
        // clear.draw();
        // back.draw();
        test.getCurrentPlay().drawAllPlayers();
        defensePlay.drawAllPlayers();
        // nextPlay.draw();
        fill(0, 0, 0);
        textSize(20);
        text(scoreboard.feedbackMessage, 160, 360);
        scoreboard.draw(test,user);
        fill(176,176,176)
    };

    // game scene
    var drawScene = function(play) {
        field.drawBackground(play, height, width);
        // pause.draw();
        // stop.draw();
        pause.displayButton = true;
        stop.displayButton = true;
        playButton.displayButton = false;
        check.displayButton = false;
        clear.displayButton = false;
        back.displayButton = false;
        play.drawAllPlayers();
        defensePlay.drawAllPlayers();
        for(var i = 0; i < play.eligibleReceivers.length; i++){
            play.eligibleReceivers[i].runRoute();
        }
        for(var i = 0; i < defensePlay.defensivePlayers.length; i++){
            defensePlay.defensivePlayers[i].blitzGap(play.oline[2],play);
        }
        play.qb[0].runBootleg(play.oline[2], 1.0);
        fill(0, 0, 0);
        textSize(20);
        text(scoreboard.feedbackMessage, 120, 60);
        scoreboard.draw(test,user);
    };

    keyPressed = function() {
      selectedWR = test.getCurrentPlay().findSelectedWR();
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
      else if (keyCode === 8){
        if (selectedWR) selectedWR.stepRouteBackward();
      }
    };

    pressStopButton = function(){
      // playButton.changeClickStatus();
      // if (pause.clicked) {
      //     pause.changeClickStatus();
      // }
      playButton.clicked = false;
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
    }


    mouseDragged = function(){
      var currentPlay = test.getCurrentPlay();
      if (currentPlay){
        var receiverClicked = currentPlay.mouseInReceiverOrNode()[0];
        var selectedNode = currentPlay.mouseInReceiverOrNode()[1];
        selectedWR = currentPlay.findSelectedWR();
        if(selectedNode){
          selectedNode.change = true;
        }
      }
    };

    mouseClicked = function() {

      var currentPlay = test.getCurrentPlay();
      if(currentPlay){
        currentPlay.setAllRoutes();
        var receiverClicked = currentPlay.mouseInReceiverOrNode()[0];
        var selectedNode = currentPlay.mouseInReceiverOrNode()[1];
        selectedWR = currentPlay.findSelectedWR();
      }

      // scoreboard.feedbackMessage = "";
      if(mouseX <= 400 && mouseY <= 400){
        if (playButton.isMouseInside() && !playButton.clicked) {
          pressPlayButton();
        }else if (check.isMouseInside()){
          selectedWR.checkRoutes(currentPlay);
        }else if (clear.isMouseInside()){
          currentPlay.clearProgression();
          currentPlay.clearRouteDrawings();
          scoreboard.feedbackMessage = "";
        }else if (back.isMouseInside()){
          if(selectedWR)selectedWR.stepRouteBackward();
        }else if (pause.isMouseInside()) {
          pause.changeClickStatus();
        } else if (stop.isMouseInside()&& playButton.clicked) {
          pressStopButton();
        }else if (bigReset.isMouseInside() && test.isLastQuestion) {
          test.restartQuiz(defensePlay);
          nextPlay.displayButton = true;
          playButton.displayButton = true;
          check.displayButton = true;
          clear.displayButton = true;
          back.displayButton = true;
        }
        else if (nextPlay.isMouseInside()){
          test.skips++;
          test.advanceToNextPlay("Boo! Weak!");
        }
        else if(selectedNode){
          if (selectedNode.change){
            selectedNode.change = false;
          }
          else{
            selectedNode.change = true;
          }
        }
        else if (receiverClicked){
            var playerSelected = false;
            currentPlay.clearPreviousRouteDisplays();
            for(var i = 0; i < currentPlay.eligibleReceivers.length; i++){
                var p = currentPlay.eligibleReceivers[i];
                if (p.isMouseInside()){
                    if(p.clicked){
                        p.unselect();
                        p.showRoute = false;
                    }else{
                        p.select();
                    }
                    break;
                }
            }
        }
        else if(selectedWR){
          selectedWR.routeCoordinates.push([mouseX, mouseY]);
          var nodeObject = new Node({
              x: mouseX,
              y: mouseY,
              siz: 10
          });
          selectedWR.routeNodes.push(nodeObject);
        }
      }

    };

    draw = function() {
      if(test.endTime > 0){
        bigReset.displayButton = true;
        field.drawBackground("", height, width);
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
}
