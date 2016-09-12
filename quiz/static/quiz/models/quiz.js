
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

// save handles everything that need to be done when the user pressed the save
// button.
Quiz.prototype.save = function (path, csrf_token) {
	var quizName = this.name;

	var jqxhr = $.post(
			path,
			{csrfmiddlewaretoken: csrf_token, save: true, delete: false, name: quizName}
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

/*********************************/
/*     Non object functions      */
/*********************************/

Quiz.prototype.createFormationsFromJson = function(formationJsonDictionary) {
	var formation = createFormationFromJson(formationJsonDictionary);
	this.formations.push(formation);
};

Quiz.prototype.createPlaysFromJson = function(playJsonDictionary) {
	var play = createPlayFromJson(playJsonDictionary);
	this.plays.push(formation);
};

Quiz.prototype.createConceptsFromJson = function(conceptJsonDictionary) {
	var concept = createConceptFromJson(conceptJsonDictionary);
	this.concepts.push(formation);
};
