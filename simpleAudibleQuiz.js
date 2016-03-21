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

  var multipleChoiceAnswers = [];
  var routeNames = ["Slant", "Post", "Skinny Post", "Go", "Out"];

  //create receiver from user variable
  var user = new User({});
  var receiver = new Player({
    fill:color(255,0,0),
    siz: 30,
    x:width*0.3,
    y:height/2,
    pos:"Z",
    num:88
  });

  var slantExample = new Route({
    startingPoint: [receiver.x, receiver.y],
    routeName: "Slant",
    breakPoints: []
  });
  slantExample.breakPoints.push(Route.getDestination(20, PI/2, slantExample.startingPoint[0], slantExample.startingPoint[1]));
  slantExample.breakPoints.push(Route.getDestination(150, PI/6, slantExample.breakPoints[0][0], slantExample.breakPoints[0][1]));

  var postExample = new Route({
    startingPoint: [receiver.x, receiver.y],
    routeName: "Post",
    breakPoints: []
  });
  postExample.breakPoints.push(Route.getDestination(60, PI/2, postExample.startingPoint[0], postExample.startingPoint[1]));
  postExample.breakPoints.push(Route.getDestination(100, PI/3, postExample.breakPoints[0][0], postExample.breakPoints[0][1]));

  var goExample = new Route({
    startingPoint: [receiver.x, receiver.y],
    routeName: "Go",
    breakPoints: []
  });
  goExample.breakPoints.push(Route.getDestination(150, PI/2, goExample.startingPoint[0], goExample.startingPoint[1]));

  var test = new RouteTest({
    receiver: receiver,
  	routes: [slantExample, postExample, goExample],
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
		var availableNames = routeNames.slice(0,4);
		shuffle(availableNames);
		for(var i = 0; i < availableNames.length; i++){
			multipleChoiceAnswers.push(new MultipleChoiceAnswer({
				x: 50 + i * width / (availableNames.length + 1),
				y: height * 0.7,
				width: width / (availableNames.length + 2),
				height: 50,
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
	}

	var checkAnswer = function(guess){
		//logic
		var isCorrect = test.getCurrentRoute().getName() === guess.label;
		if(isCorrect){
			test.advanceToNextRoute(test.correctAnswerMessage);
    		test.score++;
    		createMultipleChoiceAnswers();
    		if(test.over){
    			bigReset.displayButton = true;
    			check.displayButton = false;
    			clear.displayButton = false;
    		}
  		}else{
  			clearAnswers();
      		test.scoreboard.feedbackMessage = "Wrong Answer";
      		test.incorrectGuesses++;
  		}
	}

  var drawBackground = function(route, field) {
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

  };

  // intro scene
  var drawOpening = function() {
      field.drawBackground(null, height, width);
      test.scoreboard.draw(test, user);
      test.receiver.draw();
      test.getCurrentRoute().draw();
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
          checkAnswer(answer);
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
          	checkAnswer(selectedAnswer);
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
      				checkAnswer(answer);
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
