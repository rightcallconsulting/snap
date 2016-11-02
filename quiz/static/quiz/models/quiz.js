
//***************************************************************************//
//																			 //
// quiz.js - Right Call Consulting. All Rights Reserved. 2016		     	 //
//																			 //
//***************************************************************************//
//																			 //
// A quiz object contains all the formations, plays, and concepts in one     //
// assigned quiz.                                                            //
//																			 //
//***************************************************************************//

var Quiz = function(config) {
	this.name = config.name || "";
	this.unit = config.unit || "offense";
	this.formations = config.formations || [];
	this.plays = config.plays || [];
	this.concepts = config.concepts || [];
	this.attempt = config.attempt || null;

	this.questions = config.questions || [];
	this.currentQuestionIndex = config.currentQuestionIndex || null;
	this.over = false;

	this.results = config.results || []; //array of Int results - 0 is wrong, 1 is right, 2 is skipped
	this.restartButtons = config.restartButtons || [];
};

//***************************************************************************//
//***************************************************************************//

//*******************************************************************//
// Create Quiz                                                       //
//*******************************************************************//

// push determines the type of the input and pushes it to the correct array
// in this instance of quiz.
Quiz.prototype.push = function (input) {
	input = input.deepCopy();

	if (input instanceof Formation) {
		for (i in this.formations) {
			if (input.name === this.formations[i].name) {
				return;
			}
		}

		this.formations.push(input);
	} else if (input instanceof Play) {
		for (i in this.plays) {
			if (input.name === this.plays[i].name && input.scoutName === this.plays[i].scoutName) {
				return;
			}
		}

		this.plays.push(input);
	} else if (input instanceof Concept) {
		for (i in this.concepts) {
			if (input.name === this.concepts[i].name) {
				return;
			}
		}

		this.concepts.push(input);
	}
};

// remove determines the types of the input and splices it from the correct
// array in this instance of quiz.
Quiz.prototype.remove = function (input) {
	input = input.deepCopy();

	if (input instanceof Formation) {
		for (i in this.formations) {
			if (input.name === this.formations[i].name) {
				this.formations.splice(i, 1);
			}
		}
	} else if (input instanceof Play) {
		for (i in this.plays) {
			if (input.name === this.plays[i].name && input.scoutName === this.plays[i].scoutName) {
				this.plays.splice(i, 1);
			}
		}
	} else if (input instanceof Concept) {
		for (i in this.concepts) {
			if (input.name === this.concepts[i].name) {
				this.concepts.splice(i, 1);
			}
		}
	}
};

// save handles everything that need to be done when the user pressed the save
// button.
Quiz.prototype.save = function (path, csrf_token) {
	var quizName = this.name;

	var quiz = JSON.stringify(this, ["formations", "plays", "concepts", "name", "scoutName"]);

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: true, delete: false, name: quizName, quiz: quiz}
		).done(function() {
			console.log("Quiz successfully sent to Django to be saved");
		}).fail(function() {
			console.log("Error sending Quiz to Django to be saved");
	});
};

// delete sends a delete request to Django for this play.
Quiz.prototype.delete = function (path, csrf_token) {
	var quizName = this.name;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: false, delete: true, name: quizName}
		).done(function() {
			console.log("Quiz successfully sent to Django to be deleted");
		}).fail(function() {
			console.log("Error sending Quiz to Django to be deleted");
	});
};


//*******************************************************************//
// Take Quiz                                                         //
//*******************************************************************//

// draw displays the current question.
Quiz.prototype.draw = function(field) {
	if (!this.isEmpty()) {
		var question = this.questions[this.currentQuestionIndex];

		if (question.startTime === 0) {
			this.clearQuestionStartTimes()
			question.startTime = millis();
		}

		question.draw(field);
		if (question.feedbackStartTime > 0) {
			question.drawFeedbackScreen(field);
		} else {
			if (this.attempt !== null) {
				this.attempt.drawAssignments(field);
				this.attempt.draw(field);
			}
		}
	}
};

Quiz.prototype.drawQuizSummary = function(field){
	background(93, 148, 81);
	/*var elapsedSeconds = (this.endTime - this.startTime)/1000;
	if (elapsedSeconds > this.cutOff * this.plays.length * this.questionsPerPlay) {
		elapsedSeconds = this.cutOff * this.plays.length * this.questionsPerPlay;
	}

	var timeDeduction = (elapsedSeconds - 10 * this.plays.length * this.questionsPerPlay)*0.01;
	if (timeDeduction < 0.0) {
		timeDeduction = 0.0;
	}*/

	var score = 0.0;
	var incorrectGuesses = 0;
	var skips = 0;

	for(var i = 0; i < this.results.length; i++){
		if(this.results[i] === 0){
			incorrectGuesses++;
		}else if(this.results[i] === 1){
			score += 1.0;
		}else if(this.results[i] === 2){
			skips++;
		}
	}

	var resultString = "You scored " + (score).toFixed(2) + " out of " + this.questions.length;
	var guessesString = "You had " + incorrectGuesses.toFixed(0) + " incorrect guess";
	if (incorrectGuesses !== 1) {
		guessesString += "es";
	}

	var skipString = "You skipped " + skips.toFixed(0) + " question";
	if(skips !== 1) {
		skipString += "s";
	}

	/*var timeString = "You took " + elapsedSeconds.toFixed(0) + " seconds";*/
	textAlign(CENTER);
	textSize(24);
	text(resultString, width/2, height/2-50);
	textSize(20);
	text(guessesString, width/2, height/2+10);
	//text(skipString, width/2, height/2+70);
	//text(timeString, width/2, height/2+70);

	if (this.restartButtons.length === 0) {
		this.setRestartButtons(field);
	}

	this.drawRestartButtons(field);
};

Quiz.prototype.setRestartButtons = function(field) {
	this.restartButtons = [];
	var buttonWidth = field.yardsToPixels(field.heightInYards * field.width / field.height / 6);

	var bigReset = new Button({
		x: field.getTranslatedX(field.getYardX(width*0.25)) - buttonWidth/2,
		y: height*0.8,
		width: buttonWidth,
		label: "Retake All",
		display: true
	});

	var resetMissed = new Button({
		x: bigReset.x + bigReset.width*1.5,
		y: bigReset.y,
		width: bigReset.width,
		label: "Retake Missed",
		display: true
	});

	var submitQuiz = new Button({
		x: resetMissed.x + resetMissed.width*1.5,
		y: bigReset.y,
		width: bigReset.width,
		label: "Submit Quiz",
		display: true
	});

	this.restartButtons.push(bigReset)
	this.restartButtons.push(resetMissed)
	this.restartButtons.push(submitQuiz)
};

Quiz.prototype.drawRestartButtons = function(field){
	for(var i = 0; i < this.restartButtons.length; i++){
		this.restartButtons[i].draw(field);
	}
};

Quiz.prototype.getClickedRestartButton = function(field){
	for(var i = 0; i < this.restartButtons.length; i++){
		var button = this.restartButtons[i];
		if(button.isMouseInside(field)){
			return button;
		}
	}
	return null;
};

Quiz.prototype.restartQuiz = function(missedQuestionsOnly){
	if(missedQuestionsOnly === true){
		var newQuestions = [];
		for(var i = 0; i < this.questions.length; i++){
			if(this.questions[i].score !== 1){
				newQuestions.push(this.questions[i]);
			}
		}
		if(newQuestions.length > 0){
			this.questions = newQuestions;
		}
	}

	this.over = false;
	this.results = [];
	this.restartButtons = [];
	this.currentQuestionIndex = 0;
	this.attempt = null;
	var newQuiz = this.deepCopy();
	newQuiz.currentQuestionIndex = 0;
	newQuiz.clearQuestionScores();
	return newQuiz;
}

Quiz.prototype.clearQuestionScores = function(){
	for(var i = 0; i < this.questions.length; i++){
		this.questions[i].score = null;
	}
}

Quiz.prototype.clearQuestionStartTimes = function(){
	for(var i = 0; i < this.questions.length; i++){
		this.questions[i].startTime = 0;
	}
}

// buildQuestions creates the question array. It takes in the postions of the
// player taking the quiz as a string and then builds an array of questions
// based on the formations, plays, and concepts in the quiz. It shuffles the
// array once it is populated.
Quiz.prototype.buildQuestions = function(player_positions) {
	var question;

	for (i in this.formations) {
		question = new Question({ question: this.formations[i].deepCopy() });
		var result = question.buildQuestionAndAnswer(player_positions);

		if (result === 0) {
			this.questions.push(question);
		}
	}

	for (i in this.plays) {
		question = new Question({ question: this.plays[i].deepCopy() });
		var result = question.buildQuestionAndAnswer(player_positions);

		if (result === 0) {
			this.questions.push(question);
		}
	}

	for (i in this.concepts) {
		question = new Question({ question: this.concepts[i].deepCopy() });
		var result = question.buildQuestionAndAnswer(player_positions);

		if (result === 0) {
			this.questions.push(question);
		}
	}

	this.shuffle();
	this.currentQuestionIndex = 0;
};

// buildIdentificationQuestions creates the question array. It iterates through
// the plays or concepts and creates questions whose answers are
// the correct call for the tested player on that play, or "No Call"
Quiz.prototype.buildCallQuestions = function(testedPlayerPosition) {
	var question;

	for (i in this.plays) {
		question = new Question({ question: this.plays[i].deepCopy() });
		var result = question.buildCallQuestionAndAnswer(testedPlayerPosition);

		if (result === 0) {
			this.questions.push(question);
		}
	}

	for (i in this.concepts) {
		question = new Question({ question: this.concepts[i].deepCopy() });
		var result = question.buildCallQuestionAndAnswer(testedPlayerPosition);

		if (result === 0) {
			this.questions.push(question);
		}
	}

	this.shuffle();
	this.currentQuestionIndex = 0;
}

// buildIdentificationQuestions creates the question array. It iterates through
// the formations, plays, or concepts and creates questions whose answers are
// the name of that formation, play, or concept.
Quiz.prototype.buildIdentificationQuestions = function() {
	var question;

	for (i in this.formations) {
		question = new Question({ question: this.formations[i].deepCopy() });
		var result = question.buildIdentificationQuestionAndAnswer();

		if (result === 0) {
			this.questions.push(question);
		}
	}

	for (i in this.plays) {
		question = new Question({ question: this.plays[i].deepCopy() });
		var result = question.buildIdentificationQuestionAndAnswer();

		if (result === 0) {
			this.questions.push(question);
		}
	}

	for (i in this.concepts) {
		question = new Question({ question: this.concepts[i].deepCopy() });
		var result = question.buildIdentificationQuestionAndAnswer();

		if (result === 0) {
			this.questions.push(question);
		}
	}

	this.shuffle();
	this.currentQuestionIndex = 0;
};

Quiz.prototype.buildGameModeQuestions = function(testedPlayerPosition, questionsPerPlay){
	var question; var result;
	//this.plays.shuffle();
	//this.concepts.shuffle();

	for (i in this.plays) {
		if(questionsPerPlay > 2){
			question = new Question({ question: this.plays[i].deepCopy(), type: "alignment" });
			result = question.buildAlignmentQuestionAndAnswer(testedPlayerPosition)
			if (result === 0) {
				this.questions.push(question);
			}
		}

		question = new Question({ question: this.plays[i].deepCopy(), type: "call" });
		var result = question.buildCallQuestionAndAnswer(testedPlayerPosition)
		if (result === 0) {
			this.questions.push(question);
		}

		question = new Question({ question: this.plays[i].deepCopy(), type: "assignment" });
		var result = question.buildAssignmentQuestionAndAnswer(testedPlayerPosition)
		if (result === 0) {
			this.questions.push(question);
		}

	}

	for (i in this.concepts) {
		question = new Question({ question: this.concepts[i].deepCopy() });
		result = question.buildAlignmentQuestionAndAnswer(testedPlayerPosition)
		if (result === 0) {
			this.questions.push(question);
		}

		question = new Question({ question: this.concepts[i].deepCopy() });
		var result = question.buildCallQuestionAndAnswer(testedPlayerPosition)
		if (result === 0) {
			this.questions.push(question);
		}

		question = new Question({ question: this.concepts[i].deepCopy() });
		var result = question.buildAssignmentQuestionAndAnswer(testedPlayerPosition)
		if (result === 0) {
			this.questions.push(question);
		}
	}

	this.currentQuestionIndex = 0;
}

// getCurrentQuestionName returns the names of the question.
Quiz.prototype.getCurrentQuestionName = function() {
	if (!this.isEmpty()) {
		return this.questions[this.currentQuestionIndex].getName();
	}
};

// shuffle rearranges the questions in the array in a random order. It is and
// implementation of the Fisher-Yates Shuffle.
Quiz.prototype.shuffle = function() {
	var currentQuestionIndex = this.questions.length;
	var temporaryQuestion;
	var randomQuestionIndex;

	// While the current index is not 0 (there is nothing left to shuffle).
	while (currentQuestionIndex != 0) {
		// Pick a remaining question index at random.
		randomQuestionIndex = Math.floor(Math.random() * currentQuestionIndex);
		currentQuestionIndex -= 1;

		// Swap it with the current element.
		temporaryQuestion = this.questions[currentQuestionIndex].deepCopy();
		this.questions[currentQuestionIndex] = this.questions[randomQuestionIndex].deepCopy();
		this.questions[randomQuestionIndex] = temporaryQuestion.deepCopy();
	}
};

// checkCurrentQuestion checks the attempt on the current question and compares
// it to the correct answer. It posts a question attempt based on the result.
Quiz.prototype.checkCurrentQuestion = function(path, csrf_token) {
	if (!this.isEmpty()) {
		this.questions[this.currentQuestionIndex].check(this.attempt);
		this.questions[this.currentQuestionIndex].save(path, csrf_token);
		if (this.questions[this.currentQuestionIndex].score === 1) {
			this.results.push(1)
			this.nextQuestion();
		} else {
			this.results.push(0);
			if (typeof this.attempt === "string") {
				this.nextQuestion();
			} else {
				this.questions[this.currentQuestionIndex].feedbackStartTime = millis();
			}
		}
	}
};

// skipCurrentQuestion skips the question the player is currently attempting.
// It posts a question attempt.
Quiz.prototype.skipCurrentQuestion = function(path, csrf_token) {
	if (!this.isEmpty()) {
		if (this.questions[this.currentQuestionIndex].score === null) {
			this.results.push(2);
			this.questions[this.currentQuestionIndex].skip();
			this.questions[this.currentQuestionIndex].save(path, csrf_token);
		}

		this.nextQuestion();
	}
};

// nextQuestion increments this currentQuestionIndex unless it is at the end of
// the array in which case it sets the index back to 0
Quiz.prototype.nextQuestion = function() {
	if (!this.isEmpty()) {
		if (this.currentQuestionIndex != (this.questions.length-1)) {
			this.currentQuestionIndex++;
			this.setAttempt();
		} else {
			this.over = true;
			//this.currentQuestionIndex = 0;
			return false;
		}

	}
};

Quiz.prototype.setAttempt = function(){
	this.attempt = this.getSelected()[0];
	if (this.attempt != null) {
		this.attempt.dropback = [];
		this.attempt.motionCords = [];
		this.attempt.run = [];
		this.attempt.route = [];
		this.attempt.blockingAssignmentArray = [];

		this.attempt.defensiveMovement = [];
	}
}

// getSelected returns the selected player in this question if it is of type
// Play or Concept, or else it returns null.
Quiz.prototype.getSelected = function() {
	if (!this.isEmpty()) {
		return this.questions[this.currentQuestionIndex].getSelected();
	}
};

// mouseInPlayer returns the player that the mouse is in or null for this
// quiz.
Quiz.prototype.mouseInPlayer = function(field) {
	if (!this.isEmpty()) {
		return this.questions[this.currentQuestionIndex].mouseInPlayer(field);
	}
};

// getCurrentAnswer returns a deep copy of the current questions answer.
Quiz.prototype.getCurrentAnswer = function() {
	if (!this.isEmpty()) {
		return this.questions[this.currentQuestionIndex].getAnswer();
	}
};

Quiz.prototype.getCurrentQuestion = function(){
	if (!this.isEmpty()) {
		return this.questions[this.currentQuestionIndex];
	}
}

// getCurrentQuestionIndex returns the index of the current question.
Quiz.prototype.getCurrentQuestionIndex = function() {
	if (!this.isEmpty()) {
		return this.currentQuestionIndex;
	}
};

// submit shows the player their results on the quiz and then navigates back to
// the players dashboard.
Quiz.prototype.submit = function(csrf_token) {
	var path = "/quizzes/submit"
	var quizName = this.name;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, name: quizName}
		).done(function() {
			console.log("Quiz successfully submitted");
		}).fail(function() {
			console.log("Error submitting quiz");
	});
};

//*******************************************************************//
// General Quiz methods                                              //
//*******************************************************************//

// isEmpty returns true if their are no questions in the array.
Quiz.prototype.isEmpty = function() {
	return this.questions.length === 0;
};

// deepCopy returns a new Quiz object that is exactly the same as this.
Quiz.prototype.deepCopy = function() {
	var result = new Quiz({
		name: this.name,
		unit: this.unit
	});

	for (i in this.formations) {
		result.formations.push(this.formations[i].deepCopy());
	}

	for (i in this.plays) {
		result.plays.push(this.plays[i].deepCopy());
	}

	for (i in this.concepts) {
		result.concepts.push(this.concepts[i].deepCopy());
	}

	for (i in this.questions){
		result.questions.push(this.questions[i].deepCopy());
	}

	return result;
};

Quiz.prototype.createFormationFromJson = function(formationJsonDictionary) {
	var formation = createFormationFromJson(formationJsonDictionary);
	this.formations.push(formation);
};

Quiz.prototype.createPlayFromJson = function(playJsonDictionary) {
	var play = createPlayFromJson(playJsonDictionary);
	this.plays.push(play);
};

Quiz.prototype.createConceptFromJson = function(conceptJsonDictionary) {
	var concept = createConceptFromJson(conceptJsonDictionary);
	this.concepts.push(concept);
};
