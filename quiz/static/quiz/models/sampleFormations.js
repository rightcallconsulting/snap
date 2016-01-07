var sampleFormationNames = ["I-Right Wing", "Doubles Bunch", "Trips Right Gun"];
  
var createSampleFormation = function(){
	var form = new Formation({
		name: sampleFormationNames[Math.floor(Math.random()*3.0)]
  	})
  	form.createOLineAndQB();
  	form.createSkillPlayers();
  	return form;
};

var createSampleFormations = function(n){
	var forms = [];
	for(var i = 0; i < n; i++){
		forms.push(createSampleFormation());
	}
	return forms;
};