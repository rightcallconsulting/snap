
//***************************************************************************//
//																			 //
// question.js - Right Call Consulting. All Rights Reserved. 2016		  	 //
//																			 //
//***************************************************************************//
//																			 //
// A question object represents one question in an assigned quiz. It         //
// contains information about the question, answer, and the score.           //
//																			 //
//***************************************************************************//

var Question = function(config) {
	this.question = config.question || null;
	this.answer = config.answer || null;
	this.prompt = config.prompt || "";
	this.score = config.score || null;
	this.startTime = 0;
	this.feedbackStartTime = 0;
};

//***************************************************************************//
//***************************************************************************//

// buildQuestionAndAnswer creates an appropriate creates a question and answer
// based on the current content in the question variable and the positons of
// the player who is attempting the question.
Question.prototype.buildQuestionAndAnswer = function(player_positions) {
	var positions = shuffle_positions(player_positions);
	for (i in positions) {
		if (this.question instanceof Formation) {
			if (positions[i][1] === "Quarterback") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].eligible === true && this.question.offensivePlayers[j].pos != "QB") {
						this.answer = this.question.offensivePlayers[j].deepCopy();
						this.prompt = "Place the missing " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
						this.question.offensivePlayers.splice(j, 1);
						return 0;
					}
				}
			} else if (positions[i][1] === "Skill Position") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0]) {
						this.answer = this.question.offensivePlayers[j].deepCopy();
						this.prompt = "Place the missing " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
						this.question.offensivePlayers.splice(j, 1);
						return 0;
					}
				}
			} else if (positions[i][1] === "Offensive Lineman") {
				return 1;
			}
		} else if (this.question instanceof Play) {
			if (positions[i][1] === "Quarterback") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0]) {
						if (this.question.offensivePlayers[j].hasAssignment() === true) {
							this.question.offensivePlayers[j].setSelected();
							this.answer = this.question.offensivePlayers[j].deepCopy();
							this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
							return 0;
						} else {
							for (k in this.question.offensivePlayers) {
								if (this.question.offensivePlayers[k].eligible === true && this.question.offensivePlayers[k].hasAssignment() === true) {
									this.question.offensivePlayers[k].setSelected();
									this.answer = this.question.offensivePlayers[k].deepCopy();
									this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[k].pos + " in " + this.question.name;
									return 0;
								}
							}
						}
					}
				}
			} else if (positions[i][1] === "Skill Position") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0] && this.question.offensivePlayers[j].hasAssignment() === true) {
						this.question.offensivePlayers[j].setSelected();
						this.answer = this.question.offensivePlayers[j].deepCopy();
						this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
						return 0;
					}
				}
			} else if (positions[i][1] === "Offensive Lineman") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0] && this.question.offensivePlayers[j].hasAssignment() === true) {
						this.question.offensivePlayers[j].setSelected();
						this.answer = this.question.offensivePlayers[j].deepCopy();
						this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
						return 0;
					}
				}
			}
		} else if (this.question instanceof Concept) {
			if (positions[i][1] === "Quarterback") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0]) {
						if (this.question.offensivePlayers[j].hasAssignment() === true) {
							this.question.offensivePlayers[j].setSelected();
							this.answer = this.question.offensivePlayers[j].deepCopy();
							this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
							return 0;
						} else {
							for (k in this.question.offensivePlayers) {
								if (this.question.offensivePlayers[k].eligible === true && this.question.offensivePlayers[k].hasAssignment() === true) {
									this.question.offensivePlayers[k].setSelected();
									this.answer = this.question.offensivePlayers[k].deepCopy();
									this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[k].pos + " in " + this.question.name;
									return 0;
								}
							}
						}
					}
				}
			} else if (positions[i][1] === "Skill Position") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0] && this.question.offensivePlayers[j].hasAssignment() === true) {
						this.question.offensivePlayers[j].setSelected();
						this.answer = this.question.offensivePlayers[j].deepCopy();
						this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
						return 0;
					}
				}
			} else if (positions[i][1] === "Offensive Lineman") {
				for (j in this.question.offensivePlayers) {
					if (this.question.offensivePlayers[j].pos === positions[i][0] && this.question.offensivePlayers[j].hasAssignment() === true) {
						this.question.offensivePlayers[j].setSelected();
						this.answer = this.question.offensivePlayers[j].deepCopy();
						this.prompt = "Draw the assignment for the " + this.question.offensivePlayers[j].pos + " in " + this.question.name;
						return 0;
					}
				}
			}
		}
	}

	return 1;
};

// buildCallQuestionAndAnswer creates an appropriate creates a
// question and answer based on the current content in the question variable.
Question.prototype.buildCallQuestionAndAnswer = function(testedPlayerPosition) {
	var testedPlayer = this.question.getPlayerFromPosition(testedPlayerPosition)
	if(testedPlayer !== null){
		this.answer = testedPlayer.call
	}else{
		this.answer = ""
	}

	this.prompt = "Choose the correct call for the " + testedPlayerPosition +  " on " + this.question.name;

	return 0;
};

// buildIdentificationQuestionAndAnswer creates an appropriate creates a
// question and answer based on the current content in the question variable.
Question.prototype.buildIdentificationQuestionAndAnswer = function() {
	this.answer = this.question.name;

	if (this.question instanceof Formation) {
		this.prompt = "Choose the name of this Formation";
	} else if (this.question instanceof Play) {
		this.prompt = "Choose the name of this Play";
	} else if (this.question instanceof Concept) {
		this.prompt = "Choose the name of this Concept";
	}

	return 0;
};

// draw displays this question.
Question.prototype.draw = function(field) {
	this.question.drawPlayers(field);

	if (millis() - this.startTime < 2000) {
		//this.drawPrompt(field);
	}
};

// drawIdentification displays this question and the assignments.
Question.prototype.drawIdentification = function(field) {
	if (this.question instanceof Play || this.question instanceof Concept) {
		this.question.drawAssignments(field);
	}

	this.question.drawPlayers(field);

	if (millis() - this.startTime < 2000) {
		//this.drawPrompt(field);
	}
};

// getName returns the name of the Question
Question.prototype.getName = function() {
	return this.question.name;
};

Question.prototype.drawFeedbackScreen = function(field){
	if (this.answer !== null) {
		this.answer.drawAssignments(field);
		this.answer.draw(field);
	}
};

Question.prototype.drawPrompt = function(field) {
		textSize(20);
		var x = field.getTranslatedX(Field.WIDTH / 2);
		var y = 30;
		text(this.prompt, x, y);
};

//returns the position being tested for this question
//goes through the players' positions in priority order first
//if none exist in the question, it then picks a random player's position
Question.prototype.getTestedPosition = function(player_positions){
	for(var i = 0; i < player_positions.length; i++){
		var position = player_positions[i];
		if (this.question.getPlayerFromPosition(position) !== null) {
			return position;
		}
	}
	return this.question.offensivePlayers[0].position;
};

// check compares the attempt with the answer and determines the score. It
// posts an attempted question to the database.
Question.prototype.check = function(attempt) {
	if (attempt !== null) {
		if (typeof attempt === "string") {
			if (attempt === this.answer) {
				this.score = 1;
			} else {
				this.score = 0;
			}
		} else if (this.question instanceof Formation) {
			var dist = sqrt(pow(attempt.x - this.answer.x, 2) + pow(attempt.y - this.answer.y, 2));

			if (dist < 1) {
				this.score = 1;
			} else {
				this.score = 0;
			}
		} else if (this.question instanceof Play || this.question instanceof Concept) {
			if(this.checkAssignments(attempt)){
				this.score = 1;
			}else{
				this.score = 0;
			}
		}
	}
};

Question.prototype.checkAssignments = function(attempt){
		if (this.checkDropback(attempt) && this.checkMotion(attempt) && this.checkRun(attempt) && this.checkRoute(attempt) && this.checkBlockingAssignment(attempt)) {
			return true;
		}

		return false;
}

Question.prototype.checkDropback = function(attempt){
	if(this.answer.dropback === null){
		return true;
	}
	if(attempt === null){
		return false;
	}
	if(attempt.dropback.length !== this.answer.dropback.length){
		return false;
	}
	for (i in attempt.dropback) {
		var dist = sqrt(pow(attempt.dropback[i][0] - this.answer.dropback[i][0], 2) + pow(attempt.dropback[i][1] - this.answer.dropback[i][1], 2));
		if (dist > 3) {
			return false;
		}
	}
	return true;
}

Question.prototype.checkMotion = function(attempt){
	if(this.answer.motionCoords === null){
		return true;
	}
	if(attempt === null){
		return false;
	}
	if(attempt.motionCoords.length !== this.answer.motionCoords.length){
		return false;
	}
	for (i in attempt.motionCoords) {
		var dist = sqrt(pow(attempt.motionCoords[i][0] - this.answer.motionCoords[i][0], 2) + pow(attempt.motionCoords[i][1] - this.answer.motionCoords[i][1], 2));
		if (dist > 2) {
			return false;
		}
	}
	return true;
}

Question.prototype.checkRun = function(attempt){
	if(this.answer.run === null){
		return true;
	}

	if(attempt === null) {
		return false;
	}

	if (attempt.run.length !== this.answer.run.length) {
		return false;
	}

	for (i in attempt.run) {
		var dist = sqrt(pow(attempt.run[i][0] - this.answer.run[i][0], 2) + pow(attempt.run[i][1] - this.answer.run[i][1], 2));

		if (dist > 3) {
			return false;
		}
	}
	return true;
}

Question.prototype.checkRoute = function(attempt){
	if(this.answer.route === null){
		return true;
	}
	if(attempt === null){
		return false;
	}
	if(attempt.route.length !== this.answer.route.length){
		return false;
	}
	for (i in attempt.route) {
		var dist = sqrt(pow(attempt.route[i][0] - this.answer.route[i][0], 2) + pow(attempt.route[i][1] - this.answer.route[i][1], 2));
		if (dist > 3) {
			return false;
		}
	}
	return true;
}

Question.prototype.checkBlockingAssignment = function(attempt){
	if(this.answer.blockingAssignmentArray === null){
		return true;
	}
	if(attempt === null){
		return false;
	}
	if(attempt.blockingAssignmentArray.length !== this.answer.blockingAssignmentArray.length){
		return false;
	}
	for (i in attempt.blockingAssignmentArray) {
		var dist = sqrt(pow(attempt.blockingAssignmentArray[i].x - this.answer.blockingAssignmentArray[i].x, 2) + pow(attempt.blockingAssignmentArray[i].y - this.answer.blockingAssignmentArray[i].y, 2));
		if (dist > 2) {
			return false;
		}
	}
	return true;
}

// skip posts an attempted question to the database.
Question.prototype.skip = function() {};

// save is used to post an attempted question.
Question.prototype.save = function(path, csrf_token) {
	if (this.question instanceof Formation) {
		var type = "formation";
		var name = this.question.name;
		var score = this.score;

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, type: type, name: name, score: score}
			).done(function() {
				console.log("Question Attempt successfully sent to Django to be saved");
			}).fail(function() {
				console.log("Error sending Question Attempt to Django to be saved");
		});
	} else if (this.question instanceof Play) {
		var type = "play";
		var name = this.question.name;
		var formationName = this.question.formation
		var scoutName = this.question.scoutName;
		var score = this.score;

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, type: type, name: name, formationName: formationName, scoutName:scoutName, score: score}
			).done(function() {
				console.log("Question Attempt successfully sent to Django to be saved");
			}).fail(function() {
				console.log("Error sending Question Attempt to Django to be saved");
		});
	} else if (this.question instanceof Concept) {
		var type = "concept";
		var name = this.question.name;
		var score = this.score;

		var jqxhr = $.post(
				path,
				{csrfmiddlewaretoken: csrf_token, type: type, name: name, score: score}
			).done(function() {
				console.log("Question Attempt successfully sent to Django to be saved");
			}).fail(function() {
				console.log("Error sending Question Attempt to Django to be saved");
		});
	}

};

// getSelected returns the selected player in this question if it is of type
// Play or Concept, or else it returns null.
Question.prototype.getSelected = function() {
	if (this.question instanceof Formation) {
		return [null, null];
	} else {
		return this.question.getSelected();
	}
};

// mouseInPlayer returns the player that the mouse is in or null for this
// question.
Question.prototype.mouseInPlayer = function(field) {
	return this.question.mouseInPlayer(field);
};

// getAnswer returns a deepCopy of the answer so that the quiz view can draw
// the right type of player for a formation question.
Question.prototype.getAnswer = function() {
	return this.answer.deepCopy();
};

// deepCopy returns a deep copy of the instance of Question that called it.
Question.prototype.deepCopy = function() {
	var deepCopy = new Question ({
		score: this.score,
		prompt: this.prompt
	});

	deepCopy.question = this.question.deepCopy();

	if (typeof this.answer === "string") {
		deepCopy.answer = this.answer;
	} else {
		deepCopy.answer = this.answer.deepCopy();
	}

	return deepCopy;
};

function shuffle_positions(array) {
	var result = [];

	for (i in array) {
		result.push([array[i][0], array[i][1]]);
	}

	var currentPositionIndex = array.length;
	var temporaryPosition;
	var randomPositionIndex;

	// While the current index is not 0 (there is nothing left to shuffle).
	while (currentPositionIndex != 0) {
		// Pick a remaining question index at random.
		randomPositionIndex = Math.floor(Math.random() * currentPositionIndex);
		currentPositionIndex -= 1;

		// Swap it with the current element.
		temporaryPosition = result[currentPositionIndex];
		result[currentPositionIndex] = result[randomPositionIndex];
		result[randomPositionIndex] = temporaryPosition;
	}

	return result;
};
