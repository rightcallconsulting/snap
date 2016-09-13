
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

var Question = function (config) {
	this.question = config.question || null;
	this.answer = config.answer || null;
	this.player = config.player || null;
	this.reult = config.result || 2;
};

//***************************************************************************//
//***************************************************************************//

Question.prototype.buildQuestionFromAnswer = function (player_position) {
	if (this.answer instanceof Formation) {

	} else if (this.answer instanceof Play) {

	} else if (this.answer instanceof Concept) {
		
	}
};

Question.prototype.draw = function () {
	this.question.drawPlayers();
};

Question.prototype.check = function () {};

Question.prototype.save = function (path, csrf_token) {};
