
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
};

//***************************************************************************//
//***************************************************************************//

// draw displays this question.
Question.prototype.draw = function(field) {
	this.question.drawPlayers(field);
};

// buildQuestionAndAnswer creates an appropriate creates a question and answer
// based on the current content in the question variable and the positons of
// the player who is attempting the question.
Question.prototype.buildQuestionAndAnswer = function(player_position) {
	if (this.question instanceof Formation) {
		for (i in this.question.offensivePlayers) {
			var player = this.question.offensivePlayers[i];
			if (player.pos === player_position) {
				this.answer = player.deepCopy();
				this.question.offensivePlayers.splice(i, 1);
			}
		}

		if (this.answer === null) {
			var randomPlayerIndex = Math.floor(Math.random()*this.question.offensivePlayers.length);
			this.answer = this.question.offensivePlayers[randomPlayerIndex].deepCopy();
			this.question.offensivePlayers.splice(i, 1);
		}

		this.prompt = "Place the missing " + this.answer.pos;
	} else if (this.question instanceof Play) {
		for (i in this.question.offensivePlayers) {
			var player = this.question.offensivePlayers[i];
			if (player.pos === player_position) {
				this.answer = player.deepCopy();
				player.setSelected();
			}
		}

		if (this.answer === null) {
			var randomPlayerIndex = Math.floor(Math.random()*this.question.offensivePlayers.length);
			this.answer = this.question.offensivePlayers[randomPlayerIndex].deepCopy();
			this.question.offensivePlayers[randomPlayerIndex].setSelected();
		}

		this.prompt = "Draw the assignment for the " + this.answer.pos;
	} else if (this.question instanceof Concept) {
		for (i in this.question.offensivePlayers) {
			var player = this.question.offensivePlayers[i];
			if (player.pos === player_position) {
				this.answer = player.deepCopy();
				player.setSelected();
			}
		}

		if (this.answer === null) {
			var randomPlayerIndex = Math.floor(Math.random()*this.question.offensivePlayers.length);
			this.answer = this.question.offensivePlayers[randomPlayerIndex].deepCopy();
			this.question.offensivePlayers[randomPlayerIndex].setSelected();
		}

		this.prompt = "Draw the assignment for the " + this.answer.pos;		
	}
};

// getName returns the name of the Question
Question.prototype.getName = function() {
	return this.question.name;
};

// check compares the attempt with the answer and determines the score. It
// posts an attempted question to the database.
Question.prototype.check = function(attempt) {
	if (attempt != null) {
		if (this.question instanceof Formation) {
			var dist = sqrt(pow(attempt.x - this.answer.x, 2) + pow(attempt.y - this.answer.y, 2));

			if (dist < 1) {
				this.score = 1;
			} else {
				this.score = 0;
			}
		} else {
			for (i in attempt.motionCoords) {
				var dist = sqrt(pow(attempt.motionCoords[i][0] - this.answer.motionCoords[i][0], 2) + pow(attempt.motionCoords[i][1] - this.answer.motionCoords[i][1], 2));

				if (dist < 2) {
					this.score = 1;
				} else {
					this.score = 0;
					break;
				}
			}

			if (this.score != 0) {
				for (i in attempt.blockingAssignmentArray) {
					var dist = sqrt(pow(attempt.blockingAssignmentArray[i].x - this.answer.blockingAssignmentArray[i].x, 2) + pow(attempt.blockingAssignmentArray[i].y - this.answer.blockingAssignmentArray[i].y, 2));

					if (dist < 2) {
						this.score = 1;
					} else {
						this.score = 0;
						break;
					}
				}
			}

			if (this.score != 0) {
				for (i in attempt.route) {
					var dist = sqrt(pow(attempt.route[i][0] - this.answer.route[i][0], 2) + pow(attempt.route[i][1] - this.answer.route[i][1], 2));

					if (dist < 3) {
						this.score = 1;
					} else {
						this.score = 0;
						break;
					}
				}
			}

			if (this.score === null) {
				this.score = 1;
			}
		}
	}
};

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
	deepCopy.answer = this.answer.deepCopy();

	return deepCopy;
};
