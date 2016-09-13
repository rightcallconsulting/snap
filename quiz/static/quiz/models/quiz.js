
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
};

//***************************************************************************//
//***************************************************************************//

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
Quiz.prototype.delete = function(path, csrf_token) {
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
