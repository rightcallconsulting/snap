var makeJSONCall = true;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var bigReset;

function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  randomSeed(millis());
  myCanvas.parent('quiz-box');
}

function draw() {
  //Create Scoreboard
  var scoreboard = new Scoreboard({
  });

  var field = new Field({
    heightInYards: 50,
    widthInYards: 50,
    yardLine: 95,
    widthOffset: -3
  });

  var multipleChoiceAnswers = [];
  var multipleChoiceLabels = ["A", "B", "C", "D", "E"];
  var routeNames = ["Slant", "Post", "Stick", "Go", "Out", "Skinny Post"];
  var receivers = [];


  //create receiver from user variable
  var user = new User({});

  var receiver1 = new Player({
    fill: color(255,0,0),
    siz: 30,
    x: width * 0.2,
    y: height/2,
    pos: "Z",
    num: 84,
  });
  var receiver2 = new Player({
    fill: color(255, 0, 0),
    siz: 30,
    x: width * 0.5,
    y: height/2,
    pos: "Y",
    num: 2
  });
  var receiver3 = new Player({
    fill: color(255, 0, 0),
    siz: 30,
    x: width * 0.8,
    y: height/2,
    pos: "X",
    num: 21
  });
  receivers.push(receiver1);
  receivers.push(receiver2);
  receivers.push(receiver3);

  Player.prototype.getStartingPoint = function(){
    return[this.x, this.y];
  };

  var slantExample = new Route({
    startingPoint: receivers[0].getStartingPoint(),
    routeName: "Slant",
    breakPoints: []
  });
  slantExample.breakPoints.push(Route.getDestination(20, PI/2, slantExample.startingPoint[0], slantExample.startingPoint[1]));
  slantExample.breakPoints.push(Route.getDestination(150, PI/6, slantExample.breakPoints[0][0], slantExample.breakPoints[0][1]));

  var postExample = new Route({
    startingPoint: receivers[1].getStartingPoint(),
    routeName: "Post",
    breakPoints: []
  });
  postExample.breakPoints.push(Route.getDestination(60, PI/2, postExample.startingPoint[0], postExample.startingPoint[1]));
  postExample.breakPoints.push(Route.getDestination(100, PI/3, postExample.breakPoints[0][0], postExample.breakPoints[0][1]));

  var stickExample = new Route({
    startingPoint: receivers[2].getStartingPoint(),
    routeName: "Stick",
    breakPoints: []
  });
  stickExample.breakPoints.push(Route.getDestination(60, PI/2, stickExample.startingPoint[0], stickExample.startingPoint[1]));
  stickExample.breakPoints.push(Route.getDestination(10, 7*(PI/4), stickExample.breakPoints[0][0], stickExample.breakPoints[0][1]));
  stickExample.breakPoints.push(Route.getDestination(80, PI/2, stickExample.breakPoints[0][0], stickExample.breakPoints[0][1]));

  var test = new MultiRouteTest({
    routes: [[stickExample, postExample, slantExample],[stickExample, slantExample, postExample],[stickExample, postExample, slantExample], [slantExample, stickExample, postExample], [postExample, stickExample, slantExample]],
    playNames: ["Arrow", "Bullseye", "Canada", "Bravo", "Alpha"],
    answers: [0, 1, 2, 1, 0],
    receivers: [receiver1, receiver2, receiver3],
    scoreboard: scoreboard
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

  Player.prototype.draw = function() {
    if(this.unit === "offense"){
      noStroke();
      fill(this.fill);
      ellipse(this.x, this.y, this.siz, this.siz);
      fill(0,0,0);
      textSize(14);
      textAlign(CENTER, CENTER);
      if(this.num > 0){
        text(this.num, this.x, this.y);
      }else{
        text(this.pos, this.x, this.y);
      }
    }
  }

var shuffle = function(o){
  for(var n = 0; n < 100; n++){
      for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    }
    return o;
  };

  var createMultipleChoiceAnswers = function(){
    multipleChoiceAnswers = [];
    var availableNames = multipleChoiceLabels.slice(0,3);
    for(var i = 0; i < availableNames.length; i++){
      multipleChoiceAnswers.push(new MultipleChoiceAnswer({
        x: width*0.1 + (i) * (width*0.8)/(availableNames.length),
        y: height * 0.7,
        width: width / (availableNames.length + 2),
        height: height * 0.1,
        label: availableNames[i],
        clicked: false
      }));
    }
  };

  var clearAnswers = function(){
    for(var i = 0; i < multipleChoiceAnswers.length; i++){
      var a = multipleChoiceAnswers[i];
      if(a.clicked){
        a.changeClickStatus();
      }
    }
  };

  var checkAnswer = function(guessNum){
    var isCorrect = test.getCurrentAnswer() === guessNum;
    if(isCorrect){
      test.advanceToNextRoute(this.correctAnswerMessage);
        test.score++;
        createMultipleChoiceAnswers();
        if(test.over){
          bigReset.displayButton = true;
          check.displayButton = false;
          clear.displayButton = false;
        }
      }else{
        clearAnswers();
          test.scoreboard.feedbackMessage = this.incorrectAnswerMessage;
          test.incorrectGuesses++;
      }
  }


  // intro scene
  var drawOpening = function() {
      field.drawBackground(null, height, width);
      fill(255, 255, 255);
      text(test.getCurrentPlayName(), 10, 23);
      test.scoreboard.draw(test, user);
      for (var i = 0; i < receivers.length; i++){
      receivers[i].draw();
    }
      var routes = test.getCurrentRoutes();
      for(var i = 0; i < routes.length; i++){
        routes[i].draw();
      }

      for(var i = 0; i < multipleChoiceAnswers.length; i++){
        multipleChoiceAnswers[i].draw();
      }
      check.draw();
      clear.draw();
      fill(0, 0, 0);
      textSize(20);
      text(test.scoreboard.feedbackMessage, 160, 360);
  };

  keyTyped = function(){
    if(test.over){
      if(key === 'r'){
        test.restartQuiz();
        check.displayButton = true;
        clear.displayButton = true;
      }
    }else{
      var offset = key.charCodeAt(0) - "1".charCodeAt(0);
      if(offset >= 0 && offset < multipleChoiceAnswers.length){
        var answer = multipleChoiceAnswers[offset];
        if(answer.clicked){
          checkAnswer(offset);
        }else{
          clearAnswers();
          answer.changeClickStatus();
        }
      }
    }
  };

  mouseClicked = function() {
    test.scoreboard.feedbackMessage = "";
      if (check.isMouseInside()){
          var selectedAnswer = null;
          for(var i = 0; i < multipleChoiceAnswers.length; i++){
            if(multipleChoiceAnswers[i].clicked){
              selectedAnswer = multipleChoiceAnswers[i];
            }
          }
          if(selectedAnswer !== null){
            checkAnswer(i);
          }
      }else if (clear.isMouseInside()){
          clearAnswers();
          test.scoreboard.feedbackMessage = "";
      }else if (bigReset.isMouseInside() && test.over) {
          test.restartQuiz();
          check.displayButton = true;
          clear.displayButton = true;
      }
      else{
        for(var i = 0; i < multipleChoiceAnswers.length; i++){
          var answer = multipleChoiceAnswers[i];
          if(answer.clicked){
            if(answer.isMouseInside()){
              checkAnswer(i);
            }else{
              answer.changeClickStatus();
            }
          }else{
            if(answer.isMouseInside()){
              answer.changeClickStatus();
            }
          }
        }
      }
  };

  draw = function() {
    if(multipleChoiceAnswers.length < 2){
      createMultipleChoiceAnswers();
    }
    if(test.over){
      //debugger;
      background(93, 148, 81);
      noStroke();
      test.drawQuizSummary();
      bigReset.draw();
    }else{
      drawOpening();
    }
  };
}
