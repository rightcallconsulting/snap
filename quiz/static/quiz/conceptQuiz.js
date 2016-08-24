var setupComplete = false;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var conceptNames;
var maxConcepts = 5;
var originalConceptList;
var bigReset; var resetMissed; var nextQuiz;
var exitDemo = null;
var demoDoubleClick = false;

function setup() {
	var box = document.getElementById('display-box');
	var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
	var width = box.offsetWidth;
	var myCanvas = createCanvas(width, height);
	field.height = height;
	field.width = width;
	field.heightInYards = 34;
	field.ballYardLine = 75;
	background(58, 135, 70);
	randomSeed(millis());
	myCanvas.parent('quiz-box');

	window.onresize=function() {
		var box = document.getElementById('display-box');
		var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
		var width = box.offsetWidth;
		resizeCanvas(width, height);
		field.height = height;
		field.width = width;
		resizeJSButtons();
	}

	multipleChoiceAnswers = [];
	var buttonWidth = field.heightInYards * field.width / field.height / 6;
	bigReset = new Button({
		x: field.getYardX(width*0.25) - buttonWidth / 2,
		y: field.getYardY(height*0.8),
		width: buttonWidth,
		label: "Retake All"
	});

	resetMissed = new Button({
		x: field.getYardX(width*0.5) - buttonWidth / 2,
		y: bigReset.y,
		width: bigReset.width,
		label: "Retake Missed"
	});

	nextQuiz = new Button({
		x: field.getYardX(width*0.75) - buttonWidth / 2,
		y: bigReset.y,
		width: bigReset.width,
		label: "Exit"
	});

	exitDemo = new Button({
		label: "",
		x: field.getYardX(width*0.1),
		y: field.getYardY(height*0.1),
		height: 1.5,
		width: 1.5,
		clicked: false,
		fill: color(255, 255, 255)
	});

	if(json_seed) {
		var scoreboard = new Scoreboard({});
		test = new ConceptTest({
			concepts: [],
			scoreboard: scoreboard,
			displayName: false
		});

		var concepts = [];
		conceptNames = [];

		for(var i = 0; i < json_seed.length; i++) {
			var concept = createConceptFromJson(JSON.parse(json_seed[i]));
			var positionsAsPlayers = [];

			conceptNames.push(concept.name);
			concepts.push(concept);
		}

		originalConceptList = concepts.slice();
		test.concepts = shuffle(concepts);
		multipleChoiceAnswers = [];
		test.restartQuiz();
		test.updateScoreboard();
		setupComplete = true;
	}
};

function resizeJSButtons() {
	var buttonWidth = field.heightInYards * field.width / field.height / 6;
	bigReset.x =  field.getYardX(width*0.25) - buttonWidth/2;
	bigReset.y = field.getYardY(height*0.8);
	bigReset.width = buttonWidth;

	resetMissed.x =  field.getYardX(width*0.5) - buttonWidth/2;
	resetMissed.y = bigReset.y;
	resetMissed.width = bigReset.width;

	nextQuiz.x =  field.getYardX(width*0.75) - buttonWidth/2;
	nextQuiz.y = bigReset.y;
	nextQuiz.width = bigReset.width;

	exitDemo.x =  field.getYardX(width*0.1);
	exitDemo.y = field.getYardY(height*0.1);
};

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};

function createMultipleChoiceAnswers(correctAnswer, numOptions) {
	var correctIndex = Math.floor((Math.random() * numOptions));
	document.getElementById('correct-answer-index').innerHTML = str(correctIndex+1);
	// I can probably just set multiple choice answers == concept names and shuffle
	multipleChoiceAnswers = [];
	var availableNames = concept_names;
	shuffle(availableNames);
	var i = 0;

	while (multipleChoiceAnswers.length < numOptions) {
		var label = availableNames[i];
		if(multipleChoiceAnswers.length === correctIndex) {
			label = correctAnswer;
		} else if(label === correctAnswer) { 
			i++;
			label = availableNames[i];
		}

		multipleChoiceAnswers.push(new MultipleChoiceAnswer({
			x: 50 + multipleChoiceAnswers.length * width / (numOptions+1),
			y: height / 3,
			width: width / (numOptions + 2),
			height: 50,
			label: label,
			clicked: false
		}));

		i++;
	}
};

function clearAnswers() {
	for(var i = 0; i < multipleChoiceAnswers.length; i++) {
		var a = multipleChoiceAnswers[i];
		if(a.clicked) {
			a.changeClickStatus();
		}
	}
};

function checkAnswer(guess) {
	var isCorrect = test.getCurrentConcept().name === guess.label;
	registerAnswer(isCorrect);
};

function drawOpening() {
	field.drawBackground(null, height, width);
	test.getCurrentConcept().drawPlayers(field);
	test.getCurrentConcept().drawAssignments(field);
};

function drawDemoScreen() {
	noStroke();
	field.drawBackground(null, height, width);
	var timeElapsed = millis() - test.demoStartTime;
	var concept = test.getCurrentConcept();
	
	if(concept) {
		concept.drawAllPlayers(field);
		var x1 = field.getTranslatedX(exitDemo.x);
		var y1 = field.getTranslatedY(exitDemo.y);
		var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
		var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
		noStroke();
		fill(220,0,0);
		exitDemo.draw(field);
		textSize(22);
		textAlign(LEFT);
		text("DEMO", x2 + 5, (y1 + y2) / 2);
		stroke(0);
		strokeWeight(2);
		line(x1, y1, x2, y2);
		line(x1, y2, x2, y1);
		strokeWeight(1);
		noStroke();

		var x = field.getTranslatedX(49);
		var y = field.getTranslatedY(85);
		var x2 = field.getTranslatedX(66);
		var y2 = field.getTranslatedY(85);
		stroke(255,238,88);
		fill(255,238,88);
		strokeWeight(2);
		line(x, y, x2, y2);
		strokeWeight(1);
		triangle(x2, y2, x2 - 20, y2 + 20, x2 - 20, y2 - 20);

		var clicked = false;
		for(var i = 1; i <= multipleChoiceAnswers.length; i++) {
			var answer = document.getElementById("mc-button-"+i);
			if(answer && answer.classList.contains('clicked')) {
				clicked = true;
			}
		}

		textSize(24);
		textAlign(CENTER);
		if(demoDoubleClick) {
			text("Demo Complete!\nClick anywhere to exit.", x - 20, y - 115);
		} else if(clicked) {
			text("Click again to check answer.", x - 20, y - 115);
		} else {
			text("Select the correct play by \ndouble clicking button.", x - 20, y - 115);
		}
	}
};

function setupDemoScreen() {
	test.showDemo = true;
	demoDoubleClick = false;
	test.demoStartTime = millis();
	clearAnswers();
};

function exitDemoScreen() {
	test.showDemo = false;
	demoDoubleClick = false;
	clearAnswers();
};


mouseClicked = function() {
	if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height) {
		test.scoreboard.feedbackMessage = "";
	}

	if(bigReset.isMouseInside(field) && test.over) {
		test.concepts = shuffle(originalConceptList.slice());
		test.restartQuiz();
		return true;
	} else if(resetMissed.isMouseInside(field) && test.over) {
		var newConcepts = test.missedConcepts.concat(test.skippedConcepts);
		if(newConcepts.length < 1) {
			newConcepts = originalConceptList.slice();
		}

		test.conepts = shuffle(newConcepts);
		test.restartQuiz();
		return true;
	} else if(nextQuiz.isMouseInside(field) && test.over) {
		//Advance to next quiz or exit to dashboard
		window.location.href = "/playbook";
	} else if(test.showDemo && exitDemo.isMouseInside(field) || demoDoubleClick) {
		exitDemoScreen();
	} else {
		if(test.showDemo) {
			if(mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height) {
				demoDoubleClick = true;
			} else {
				return;
			}
		}
	}
};

keyTyped = function() {
	if(test.over) {
		if(key === 'r') {
			test.restartQuiz();
		}
	} else {
		var offset = key.charCodeAt(0) - "1".charCodeAt(0);
		if(offset >= 0 && offset < multipleChoiceAnswers.length) {
			var answer = multipleChoiceAnswers[offset];
			if(answer.clicked) {
				checkAnswer(answer);
			} else {
				clearAnswers();
				answer.changeClickStatus();
			}
		}
	}
};



function draw() {
	Player.prototype.draw = function(field) {
		var x = field.getTranslatedX(this.x);
		var y = field.getTranslatedY(this.y);
		var siz = field.yardsToPixels(this.siz);
		
		if(this.unit === "offense") {
			noStroke();
			fill(this.red, this.green, this.blue);
			ellipse(x, y, siz, siz);
			fill(0,0,0);
			textSize(14);
			textAlign(CENTER, CENTER);
			text(this.num, x, y);
		} else {
			noStroke();
			fill(this.red, this.green, this.blue);
			textSize(17);
			textAlign(CENTER, CENTER);
			text(this.pos, x, y);
		}
	};

	if(!setupComplete) {
		//WAIT - still executing JSON
	} else if(test.showDemo) {
		drawDemoScreen();
	} else if(test.over) {
		background(93, 148, 81);
		noStroke();
		test.drawQuizSummary();
		bigReset.draw(field);
		resetMissed.draw(field);
		nextQuiz.draw(field);
	} else if(test.feedbackScreenStartTime) {
		var timeElapsed = millis() - test.feedbackScreenStartTime;
		if(timeElapsed < 2000){
			drawOpening();
		} else {
			test.feedbackScreenStartTime = 0;
			test.advanceToNextConcept("");
			multipleChoiceAnswers = [];
		}
	} else {
		if(multipleChoiceAnswers.length < 2 && test.getCurrentConcept()) {
			var correctAnswer = test.getCurrentConcept().name;
			createMultipleChoiceAnswers(correctAnswer, 3);
			test.updateProgress(false);
			test.updateMultipleChoiceLabels();
		}
		drawOpening();
	}
};
