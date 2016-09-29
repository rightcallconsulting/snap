var setupComplete = false;
var playerIDFromHTML = $('#player-id').data('player-id');
var test;
var multipleChoiceAnswers;
var playNames;
var maxPlays = 5;
var originalPlayList;
var bigReset; var resetMissed; var nextQuiz;
var exitDemo = null;
var demoDoubleClick = false;
var answer_player = null;
var original_player = null;
var feedbackScreenStartTime = 0;

function setup() {
	var box = document.getElementById('display-box');
	var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
	var width = box.offsetWidth;
	var myCanvas = createCanvas(width, height);
	field.height = height;
	field.width = width;
	field.heightInYards = 40;
	field.ballYardLine = 65;
	background(58, 135, 70);
	randomSeed(millis());
	myCanvas.parent('quiz-box');

	window.onresize = function() {
		var box = document.getElementById('display-box');
		var height = document.getElementById('quiz-sidebar').offsetHeight - 90;
		var width = box.offsetWidth;
		resizeCanvas(width, height);
		field.height = height;
		field.width = width;
		resizeJSButtons();
	};

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

	resizeJSButtons()

	if (json_seed) {
		var scoreboard = new Scoreboard({});

		test = new PlayTest({
			formations: [],
			scoreboard: scoreboard,
			displayName: true
		});

		var plays = [];
		playNames = [];

		for(i in json_seed) {
			var play = createPlayFromJson(JSON.parse(json_seed[i]));
			playNames.push(play.name);
			plays.push(play);
		}

		originalPlayList = plays.slice();
		test.plays = shuffle(plays);
		multipleChoiceAnswers = [];
		test.restartQuiz();
		test.updateScoreboard();
		setupComplete = true;
	}

	changeAnswerPlayer();
};

function drawRestartButtons(field){
  bigReset.display = true;
  resetMissed.display = true;
  nextQuiz.display = true;
  bigReset.draw(field);
  resetMissed.draw(field);
  nextQuiz.draw(field);
}

function resizeJSButtons() {
	var buttonWidth = field.yardsToPixels(field.heightInYards * field.width / field.height / 6);
	bigReset.x =  field.getTranslatedX(field.getYardX(width*0.25)) - buttonWidth/2;
	bigReset.y = height*0.8;
	bigReset.width = buttonWidth;

	resetMissed.x =  bigReset.x + bigReset.width*1.5;
	resetMissed.y = bigReset.y;
	resetMissed.width = bigReset.width;

	nextQuiz.x =  resetMissed.x + resetMissed.width*1.5;
	nextQuiz.y = resetMissed.y;
	nextQuiz.width = resetMissed.width;

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

function drawScene(field) {
	field.drawBackground(null, height, width);
	clearMultipleChoiceAnswers();
	var play = test.getCurrentPlay();
	if(play) {
		play.drawAllRoutes(field);
		play.drawAllPlayers(field);
		for(var i = 0; i < play.offensivePlayers.length; i++) {
			play.offensivePlayers[i].runRoute();
		}
	}
};

function restartScene() {
	var play = test.getCurrentPlay();
	for (var i = 0; i < play.offensivePlayers.length; i++) {
		play.offensivePlayers[i].resetToStart();
	}
};

function drawDemoScreen() {
	field.drawBackground(null, height, width);
	var timeElapsed = millis() - test.demoStartTime;
	var play = test.getCurrentPlay();
	if (play) {
		play.drawAllRoutes(field);
		play.drawAllPlayers(field);
		var x1 = field.getTranslatedX(exitDemo.x);
		var y1 = field.getTranslatedY(exitDemo.y);
		var x2 = field.getTranslatedX(exitDemo.x + exitDemo.width);
		var y2 = field.getTranslatedY(exitDemo.y - exitDemo.height);
		noStroke();
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

		var playButtonX = 85;
		var playButtonY = 400;

		fill(255,238,88);
		stroke(255,238,88);
		strokeWeight(2);
		line(playButtonX, playButtonY, playButtonX, playButtonY + 80);
		triangle(85, 480, 105, 460, 65, 460);

		textAlign(LEFT);
		textSize(18);
		strokeWeight(0);
		text("Click play button anytime to animate play.\nClick again to pause animation.", 100, 420);

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
		for (var i = 1; i <= multipleChoiceAnswers.length; i++) {
			var answer = document.getElementById("mc-button-"+i);
			if (answer && answer.classList.contains('clicked')) {
				clicked = true;
			}
		}
		textSize(18);
		textAlign(RIGHT);
		strokeWeight(0);

		if(demoDoubleClick) {
			text("Demo Complete!\nClick anywhere to exit.", x - 20, y - 115);
		} else if (clicked) {
			text("Click again to check answer.", x - 20, y - 115);
		} else {
			text("Select the correct play by \ndouble clicking button.", x - 20, y - 115);
		}
		strokeWeight(1);
	}
};

function setupDemoScreen() {
	test.showDemo = true;
	demoDoubleClick = false;
	test.demoStartTime = millis();
	clearMultipleChoiceAnswers();
};

function exitDemoScreen() {
	test.showDemo = false;
	demoDoubleClick = false;
	clearMultipleChoiceAnswers();
};

function checkAnswer() {
	if(feedbackScreenStartTime > 0){
		return;
	}
	var wrong_answer = false;

	if (original_player.blockingAssignmentArray.length != answer_player.blockingAssignmentArray.length) {
		wrong_answer = true;
	} else {
		for (i in original_player.blockingAssignmentArray) {
			var blockPart = original_player.blockingAssignmentArray[i]
			var guessPart = answer_player.blockingAssignmentArray[i]
			var xDiff = blockPart.x - guessPart.x
			var yDiff = blockPart.y - guessPart.y
			var diff = sqrt(xDiff * xDiff + yDiff*yDiff)
			if(diff > 2){
				wrong_answer = true;
				break;
			}
		}
	}

	test.registerAnswer(!wrong_answer)
	if(wrong_answer){
		answer_player.blockingAssignmentArray = [];
		feedbackScreenStartTime = millis();
	}else{
		changeAnswerPlayer();
	}

};

function endFeedbackScreen(){
	feedbackScreenStartTime = 0
	test.advanceToNextPlay("")
	if(!test.over){
		changeAnswerPlayer();
	}
}

function skipQuestion() {
	test.skipQuestion();
	changeAnswerPlayer();
};

function changeAnswerPlayer() {
	answer_player = null;
	original_player = null;

	// Todo: Implement logic for matching player logged in with postions in
	// offensivePlayer arrays.

	// Else choose some random lineman.
	var random_index = Math.floor(Math.random()*5);
	original_player = test.getCurrentPlay().offensivePlayers[random_index].deepCopy()
	answer_player = original_player.deepCopy();
	answer_player.blockingAssignmentArray = [];
	answer_player.setSelected();
};

function mouseReleased() {
	if(test.feedbackScreenStartTime > 0){
		return false;
	}
	// Handle clicks on players in the Play
	var currentPlayerSelected = answer_player;
	var newPlayerSelected = test.getCurrentPlay().mouseInPlayer(field);
	var mouseYardX = field.getYardX(mouseX);
	var mouseYardY = field.getYardY(mouseY);

	if (newPlayerSelected === null || newPlayerSelected.unit === "offense") {
		if (mouseX > 0 && mouseX < field.width && mouseY > 0 && mouseY < field.height) {
			var blockPart = new BlockType({
				x: mouseYardX,
				y: mouseYardY
			})
			currentPlayerSelected.blockingAssignmentArray.push(blockPart);
		}

		return false;
	} else if (newPlayerSelected.unit === "defense") {
		var blockPart = new BlockType({
			x: mouseYardX,
			y: mouseYardY,
			player: newPlayerSelected,
			type: 1
		})
		currentPlayerSelected.blockingAssignmentArray.push(blockPart);
		return false;
	}

	// return false to prevent default behavior
	return false;
};

function mouseClicked() {
	if (mouseX > 0 && mouseY > 0 && mouseX < field.width && mouseY < field.height) {
		test.scoreboard.feedbackMessage = "";
	}

	if(test.feedbackScreenStartTime > 0){
		return false;
	}

	if (bigReset.isMouseInside(field) && test.over) {
		test.plays = shuffle(originalPlayList.slice());
		test.restartQuiz();
		changeAnswerPlayer();
		return true;
	} else if (resetMissed.isMouseInside(field) && test.over) {
		var newPlays = test.missedPlays.concat(test.skippedPlays);
		if(newPlays.length < 1){
			newPlays = originalPlayList.slice();
		}
		test.plays = shuffle(newPlays);
		test.restartQuiz();
		changeAnswerPlayer();
		return true;
	} else if (nextQuiz.isMouseInside(field) && test.over) {
		//Advance to next quiz or exit to dashboard
		window.location.href = "/quizzes/custom";
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

function keyPressed() {
	var playerSelcted = answer_player;
	if (keyCode == BACKSPACE || keyCode == DELETE) {
		if(playerSelcted.blockingAssignmentArray.length > 0){
			playerSelcted.blockingAssignmentArray.pop();
		}
		return false;
	}/* else if (key === "Q") {
		playerSelcted.blockingAssignmentArray.push("Money Block");
	} else if (key === "W") {
		playerSelcted.blockingAssignmentArray.push("Down Block Right");
	} else if (key === "E") {
		playerSelcted.blockingAssignmentArray.push("Down Block Left");
	} else if (key === "R") {
		playerSelcted.blockingAssignmentArray.push("Straight Seal Right");
	} else if (key === "T") {
		playerSelcted.blockingAssignmentArray.push("Straight Seal Left");
	} else if (key === "Y") {
		playerSelcted.blockingAssignmentArray.push("Kick Out Right");
	} else if (key === "U") {
		playerSelcted.blockingAssignmentArray.push("Kick Out Left");
	}*/

	return true;
};

function keyTyped() {
	if(test.over) {
		if(key === 'r') {
			test.restartQuiz();
		}
	}
};

function draw() {
	if(!setupComplete) {
		//WAIT - still executing JSON
	} else if(test.over) {
		background(93, 148, 81);
		noStroke();
		test.drawQuizSummary();
		drawRestartButtons(field);
	} else {
		if(test.getCurrentPlay().inProgress) {
			drawScene(field);
		} else {
			drawOpening(field);
		}
	}
};

function drawOpening() {
	field.drawBackground(null, height, width);
	test.getCurrentPlay().drawAssignmentsExceptBlocks(field);
	test.getCurrentPlay().drawAllPlayers(field);
	test.getCurrentPlay().drawDefensivePlayers(field);

	if (original_player.blockingAssignmentArray.length === answer_player.blockingAssignmentArray.length) {
		answer_player.setUnselected();
	}

	if(feedbackScreenStartTime > 0){
		original_player.drawBlocks(field);
		original_player.draw(field);
		if(millis() - feedbackScreenStartTime > 1500){
			endFeedbackScreen();
		}
	}else{
		answer_player.drawBlocks(field);

		answer_player.setSelected();
		answer_player.draw(field);
	}


};
