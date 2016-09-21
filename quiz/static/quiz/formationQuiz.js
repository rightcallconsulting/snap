var setupComplete = false;
var testIDFromHTML = 33;
var test;
var multipleChoiceAnswers;
var formationNames;
var maxFormations = 5;
var originalFormationList;
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
	field.ballYardLine = 65;
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
		test = new FormationTest({
			formations: [],
			scoreboard: scoreboard,
			displayName: false
		});

		var formations = [];
		formationNames = [];

		for(i in json_seed) {
			var formation = createFormationFromJson(JSON.parse(json_seed[i]));
			formationNames.push(formation.name);
			formations.push(formation);
		}

		originalFormationList = formations.slice();
		test.formations = shuffle(formations);
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
	multipleChoiceAnswers = [];
	var availableNames = formation_names;
	shuffle(availableNames);
	var i = 0;

	while(multipleChoiceAnswers.length < numOptions) {
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
	var isCorrect = test.getCurrentFormation().name === guess.label;
	registerAnswer(isCorrect);
};

function drawOpening() {
	field.drawBackground(null, height, width);
	test.getCurrentFormation().drawAllPlayers(field);
};

function drawDemoScreen() {
	noStroke();
	field.drawBackground(null, height, width);
	var timeElapsed = millis() - test.demoStartTime;
	var formation = test.getCurrentFormation();

	if(formation) {
		formation.drawAllPlayers(field);
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

		var clicked = false;
		for(var i = 1; i <= multipleChoiceAnswers.length; i++) {
			var answer = document.getElementById("mc-button-"+i);
			if(answer && answer.classList.contains('clicked')) {
				clicked = true;
			}
		}

		textSize(24);
		textAlign(CENTER);
		if(clicked) {
			text("Demo Complete!\nClick anywhere to exit.", width / 2, y2);
		} else {
			text("Select the correct play by clicking the \n corresponding button on the right.", width / 2, y2);
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
		test.formations = shuffle(originalFormationList.slice());
		test.restartQuiz();
		return true;
	} else if(resetMissed.isMouseInside(field) && test.over) {
		var newFormations = test.missedFormations.concat(test.skippedFormations);
		if(newFormations.length < 1) {
			newFormations = originalFormationList.slice();
		}

		test.formations = shuffle(newFormations);
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
			test.advanceToNextFormation("");
			multipleChoiceAnswers = [];
		}
	} else {
		if(multipleChoiceAnswers.length < 2 && test.getCurrentFormation()) {
			var correctAnswer = test.getCurrentFormation().name;
			createMultipleChoiceAnswers(correctAnswer,3);
			test.updateProgress(false);
			test.updateMultipleChoiceLabels();
		}
		drawOpening();
	}
};
