
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

	this.questions = config.questions || [];
	this.currentQuestionIndex = config.currentQuestionIndex || null;
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
			var create_url = "/quizzes/create";

			window.location.replace("/quizzes/create");
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
		this.questions[this.currentQuestionIndex].draw(field);
	}
};

// buildQuestions creates the question array. It takes in the postions of the
// player taking the quiz as a string and then builds an array of questions
// based on the formations, plays, and concepts in the quiz. It shuffles the
// array once it is populated.
Quiz.prototype.buildQuestions = function(player_position) {
	var question;

	for (i in this.formations) {
		question = new Question({ question: this.formations[i].deepCopy() });
		question.buildQuestionAndAnswer(player_position);
		this.questions.push(question);
	}

	for (i in this.plays) {
		question = new Question({ question: this.plays[i].deepCopy() });
		question.buildQuestionAndAnswer(player_position);
		this.questions.push(question);
	}

	for (i in this.concepts) {
		question = new Question({ question: this.concepts[i].deepCopy() });
		question.buildQuestionAndAnswer(player_position);
		this.questions.push(question);
	}

	this.shuffle();
	this.currentQuestionIndex = 0;
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
Quiz.prototype.checkCurrentQuestion = function(attempt) {
	if (!this.isEmpty()) {
		this.questions[this.currentQuestionIndex].check(attempt);
		this.nextQuestion();
	}
};

// skipCurrentQuestion skips the question the player is currently attempting.
// It posts a question attempt.
Quiz.prototype.skipCurrentQuestion = function() {
	if (!this.isEmpty()) {
		this.questions[this.currentQuestionIndex].skip();
		this.nextQuestion();
	}
};

// nextQuestion increments this currentQuestionIndex unless it is at the end of
// the array in which case it sets the index back to 0
Quiz.prototype.nextQuestion = function() {
	if (!this.isEmpty()) {
		if (this.currentQuestionIndex != (this.questions.length-1)) {
			this.currentQuestionIndex++;
		} else {
			this.currentQuestionIndex = 0;
		}
	}
};

// getCurrentAnswer returns a deep copy of the current questions answer.
Quiz.prototype.getCurrentAnswer = function() {
	return this.questions[this.currentQuestionIndex].getAnswer();
};

// getCurrentQuestionIndex returns the index of the current question.
Quiz.prototype.getCurrentQuestionIndex = function() {
	return this.currentQuestionIndex;
};

// submit shows the player their results on the quiz and then navigates back to
// the players dashboard.
Quiz.prototype.submit = function() {};

//*******************************************************************//
// General Quiz methods                                              //
//*******************************************************************//

// isEmpty returns true if their are no questions in the array.
Quiz.prototype.isEmpty = function() {
	return this.questions.length === 0;
};

// deepCopy returns a new Play object that is exactly the same as this.
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
