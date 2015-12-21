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

  var formationNames = ["I-Right Wing", "Doubles Bunch", "Trips Right Gun"]; //In real life, queried directly from DB by IDs

  var multipleChoiceAnswers = [];

  var formationExample = new Formation({
	name: formationNames[0]
  })
  formationExample.createOLineAndQB();
  formationExample.createSkillPlayers();

  var test = new FormationTest({
  	formations: [formationExample, formationExample, formationExample],
  	scoreboard: scoreboard
  });

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

var shuffle = function(o){
	for(var n = 0; n < 100; n++){
    	for(var j, x, i = o.length; i; j = floor(random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    }
    return o;
};
	var createMultipleChoiceAnswers = function(){
		multipleChoiceAnswers = [];
		var availableNames = formationNames.slice(0,3);
		shuffle(availableNames);
		for(var i = 0; i < availableNames.length; i++){
			multipleChoiceAnswers.push(new MultipleChoiceAnswer({
				x: 50 + i * width / (availableNames.length + 1),
				y: height / 3,
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
		var isCorrect = formationExample.name === guess.label;
		if(isCorrect){
			test.advanceToNextFormation("You got it, dude");
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

  var drawBackground = function(formation, field) {
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
      drawBackground(formationExample, field);
      test.scoreboard.draw(test, user);
      formationExample.drawAllPlayers();
      for(var i = 0; i < multipleChoiceAnswers.length; i++){
      	multipleChoiceAnswers[i].draw();
      }
      check.draw();
      clear.draw();
      fill(0, 0, 0);
      textSize(20);
      text(test.scoreboard.feedbackMessage, 160, 360);
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
