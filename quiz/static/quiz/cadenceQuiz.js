function setup() {
  var myCanvas = createCanvas(400, 400);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
  randomSeed(millis());
}

function draw() {
  //Create Scoreboard
  var scoreboard = new Scoreboard({

  });

  //var formationNames = ["I-Right Wing", "Doubles Bunch", "Trips Right Gun"]; //In real life, queried directly from DB by IDs

  var multipleChoiceAnswers = [];


	var cadencesForTest = [];
  var formationExample = createSampleFormation();
  var colors = ["Blue", "Yellow", "Red", "Green"];
  var numbers = [42, 88, 17];
  for(var i = 0; i < 3; i++){
  	var cadenceExample = new Cadence({

  	});
  	for(var j = i; j < colors.length; j++){
  		for(var k = 0; k < numbers.length; k++){
  			var cadenceElement = new CadenceElement({
  				text: colors[j] + " " + numbers[k],
  				timeToShow: (k+1)*300
  			});
  			if(cadenceExample.elements.length < 7){
  				cadenceExample.addElement(cadenceElement);
  			}
  		}
  	}
  	cadencesForTest.push(cadenceExample);
  }



  var test = new CadenceTest({
  	cadences: cadencesForTest,
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

  var playButton = new Button({
      x: 10,
      y: 360,
      width: 32,
      label: "Play",
      clicked: false,
      displayButton: true
  });

  var restartButton = new Button({
      x: 53,
      y: 360,
      width: 53,
      label: "Restart",
      clicked: false,
      displayButton: true
  });

  var bigReset = new Button({
      x: width / 2 - 40,
      y: height * 4 / 5,
      width: 80,
      label: "Restart Quiz",
      clicked: false
  });

  var drawBackground = function(heightInYards) {
      background(93, 148, 81);
      for(var i = 0; i < heightInYards; i++){
          var yc = height * (i/heightInYards);
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
      drawBackground(30);
      playButton.draw();
      restartButton.draw();
      formationExample.drawAllPlayers();
      fill(0, 0, 0);
      textSize(20);
      text(test.scoreboard.feedbackMessage, width/2, height/4);
      var currentCadence = test.getCurrentCadence();
      if(currentCadence !== null){
      	var currentElement = currentCadence.getElementForTime();
      	if(currentElement !== null){
      		textSize(26);
      		text(currentElement.getShowText(), width/2, height /4);
      	}
      }
  };

  keyTyped = function() {
  	test.scoreboard.feedbackMessage = "";
  	var currentCadence = test.getCurrentCadence();
  	if(currentCadence === null){
  		if(test.over && key === 'r'){
  			test.restartQuiz();
  		}
  		return;
  	}
    if (key === ' '){
      if (playButton.clicked){
        currentCadence.pauseCadence();
      }
      else {
        currentCadence.startCadence();
      }
      playButton.changeClickStatus();
    }
    else if (key === 'r'){
      	currentCadence.restartCadence();
    }else if(currentCadence.startTime > 0){
    	//check to see if the timing is correct, as this is a guess
    	var timeDiff = millis() - (currentCadence.startTime + currentCadence.getCadenceTime(0, currentCadence.elements.length-1));
    	test.registerAnswer(timeDiff);
    	if(playButton.clicked){
    		playButton.changeClickStatus();
    	}
    }
  };


  mouseClicked = function() {
    test.scoreboard.feedbackMessage = "";
    var currentCadence = test.getCurrentCadence();
      if (playButton.isMouseInside()){
      	if(!playButton.clicked){
          if(currentCadence !== null){
          	currentCadence.startCadence();
          	playButton.changeClickStatus();
          }
        }
        else{
        	if(currentCadence !== null){
          		currentCadence.pauseCadence();
          	}
          	playButton.changeClickStatus();
        }
      }else if (restartButton.isMouseInside()){
          if(currentCadence !== null){
          	currentCadence.restartCadence();
          }
      }else if (bigReset.isMouseInside() && test.over) {
          test.restartQuiz();
          playButton.displayButton = true;
          restartButton.displayButton = true;
          bigReset.displayButton = false;
      }
      else{
      	if(currentCadence !== null && currentCadence.startTime > 0){
      		//check to see if you clicked at the right time
      		var timeDiff = millis() - (currentCadence.startTime + currentCadence.getCadenceTime(0, currentCadence.elements.length-1));
    		test.registerAnswer(timeDiff);
    		if(playButton.clicked){
    			playButton.changeClickStatus();
    		}
      	}
      }
  };

  draw = function() {
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
