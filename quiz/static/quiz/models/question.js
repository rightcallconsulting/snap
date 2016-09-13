
//***************************************************************************//
//																			 //
// question.js - Right Call Consulting. All Rights Reserved. 2016		  	 //
//																			 //
//***************************************************************************//
//																			 //
// A question object represents one question in an assigned quiz. It         //
// contains information about the question, answer, and the result.          //
//																			 //
//***************************************************************************//

var Question = function(config) {
	this.question = config.question || null;
	this.answer = config.answer || null;
	this.prompt = config.prompt || "";
	this.result = config.result || 2;
};

//***************************************************************************//
//***************************************************************************//

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

		this.prompt = "Draw the assignment of the selected " + this.answer.pos;
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

		this.prompt = "Draw the assignment of the selected " + this.answer.pos;		
	}
};

// draw displays this question.
Question.prototype.draw = function(field) {
	this.question.drawPlayers(field);
};

// check compares the attempt with the answer and determines the result. It
// posts an attempted question to the database.
Question.prototype.check = function(attempt) {};

// skip posts an attempted question to the database.
Question.prototype.skip = function() {};

// save is used to post an attempted question.
Question.prototype.save = function(path, csrf_token) {};

// deepCopy returns a deep copy of the instance of Question that called it.
Question.prototype.deepCopy = function() {
	var deepCopy = new Question ({ result: this.result });
	deepCopy.question = this.question.deepCopy();
	deepCopy.answer = this.answer.deepCopy();

	return deepCopy;
};
