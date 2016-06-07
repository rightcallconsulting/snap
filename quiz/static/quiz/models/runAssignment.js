var RunAssignment = function(config){
	this.type = config.type || "Handoff";
	this.routeToExchange = config.routeToExchange || [];
	this.routeAfterExchange = config.routeAfterExchange || [];
	this.hasExchanged = config.hasExchanged || false;
};

var parseCoordinatesFromJSON = function(json){
	var coords = [];

	return coords;
}

var createRunAssignmentFromJSON = function(json){
	if(!json){
		return null;
	}
	while(json.indexOf("u'") >= 0){
		json = json.replace("u'", "'");
	}

	while(json.indexOf("'") >= 0){
		json = json.replace("'", "\"");
	}

	var dict = JSON.parse(json);

	if(!dict){
		return null;
	}

  var assignment = new RunAssignment({
		type: dict.type || "",
		routeToExchange: parseCoordinatesFromJSON(dict.routeToExchange) || [],
		routeAfterExchange: parseCoordinatesFromJSON(dict.routeAfterExchange) || []
  });

	debugger;

	return assignment;
};

RunAssignment.prototype.getRouteToExchangeCoords = function(){
	return this.routeToExchange;
};

RunAssignment.prototype.getRouteAfterExchangeCoords = function(){
	return this.routeAfterExchange;
};

RunAssignment.prototype.addRouteToExchangeCoords = function(x, y){
	this.routeToExchange.push([x, y]);
};

RunAssignment.prototype.addRouteAfterExchangeCoords = function(x, y){
	this.routeAfterExchange.push([x, y]);
};

RunAssignment.prototype.addCoordinates = function(x, y){
	if(this.hasExchanged){
		this.addRouteAfterExchangeCoords(x, y);
	}else{
		this.addRouteToExchangeCoords(x, y);
	}
}

RunAssignment.prototype.removeBeforeExchange = function(){
	if(this.routeToExchange.length > 0){
		this.routeToExchange.pop();
	}
};

RunAssignment.prototype.removeAfterExchange = function(){
	if(this.routeAfterExchange.length > 0){
		this.routeAfterExchange.pop();
	}
	if(this.routeAfterExchange.length === 0){
		this.hasExchanged = false;
	}
};

RunAssignment.prototype.clearRunAssignments = function(){
	this.routeToExchange = [];
	this.routeAfterExchange = [];
};

RunAssignment.prototype.draw = function(rb, field){
	this.drawRouteToExchange(rb, field);
	this.drawRouteAfterExchange(rb, field);
};

RunAssignment.prototype.drawRouteToExchange = function(rb, field){
	var x1 = field.getTranslatedX(rb.startX);
	var y1 = field.getTranslatedY(rb.startY);
	var i = 0;
	for(i = 0; i < this.routeToExchange.length; i++){
		if(i > 0){
			x1 = field.getTranslatedX(this.routeToExchange[i-1][0]);
			y1 = field.getTranslatedY(this.routeToExchange[i-1][1]);
		}
		var x2 = field.getTranslatedX(this.routeToExchange[i][0]);
		var y2 = field.getTranslatedY(this.routeToExchange[i][1]);

		strokeWeight(3);
		stroke(66,165,245);
		if(this.type === "Handoff"){
			line(x1, y1, x2, y2);
		}else if(this.type === "Pitch"){
			var dx = (x2-x1);
			var dy = (y2-y1);
			var dist = sqrt(dx*dx+dy*dy);
			var numPieces = 10;
			var pieceLength = dist / numPieces;
			var xLength = dx / numPieces;
			var yLength = dy / numPieces;
			for(var j = 0; j < numPieces; j++){
				line(x1+j*xLength, y1+j*yLength, x1 + (j+0.5)*xLength, y1 + (j+0.5)*yLength);
			}


		}
		strokeWeight(1);
		noStroke();
	}
};


RunAssignment.prototype.drawRouteAfterExchange = function(rb, field){
	var startX = field.getTranslatedX(rb.startX);
	var startY = field.getTranslatedY(rb.startY);
	if(this.routeToExchange.length > 0){
		startX = this.routeToExchange[this.routeToExchange.length-1][0];
		startY = this.routeToExchange[this.routeToExchange.length-1][1];
	}
	for(var i = 0; i < this.routeAfterExchange.length; i++){
		if(i > 0){
			startX = this.routeAfterExchange[i-1][0];
			startY = this.routeAfterExchange[i-1][1];
		}
		var exchangeDestination = this.routeAfterExchange[i];
		if(this.routeToExchange.length){
			stroke(66, 165, 245);
			strokeWeight(3);
			line(field.getTranslatedX(startX), field.getTranslatedY(startY), field.getTranslatedX(exchangeDestination[0]), field.getTranslatedY(exchangeDestination[1]));
			strokeWeight(1);
			noStroke();
		}
	}
};

RunAssignment.prototype.getLastCoord = function(){
	if(this.routeAfterExchange.length > 0){
		return this.routeAfterExchange[this.routeAfterExchange.length - 1];
	}
	if(this.routeToExchange.length > 0){
		return this.routeToExchange[this.routeToExchange.length - 1];
	}
	return null;
};

RunAssignment.prototype.stepRunBackward = function(){
	if(this.routeAfterExchange.length > 0){
		this.removeAfterExchange();
	}else if(this.routeToExchange.length > 0){
		this.removeBeforeExchange();
	}
}

RunAssignment.prototype.equals = function(assignment){
	if(assignment === null){
		return false;
	}
	if(this.routeToExchange.length !== assignment.routeToExchange.length || this.routeAfterExchange.length !== assignment.routeAfterExchange.length){
		return false;
	}
	for(var i = 0; i < this.routeToExchange.length; i++){
		var diffX = Math.abs(this.routeToExchange[i][0] - assignment.routeToExchange[i][0]);
		var diffY = Math.abs(this.routeToExchange[i][1] - assignment.routeToExchange[i][1]);
		var diff = Math.sqrt(diffX*diffX + diffY*diffY);
		if(diff > 2){
			return false;
		}
	}
	for(var i = 0; i < this.routeAfterExchange.length; i++){
		var diffX = Math.abs(this.routeAfterExchange[i][0] - assignment.routeAfterExchange[i][0]);
		var diffY = Math.abs(this.routeAfterExchange[i][1] - assignment.routeAfterExchange[i][1]);
		var diff = Math.sqrt(diffX*diffX + diffY*diffY);
		if(diff > 2){
			return false;
		}
	}
	return true;
};
