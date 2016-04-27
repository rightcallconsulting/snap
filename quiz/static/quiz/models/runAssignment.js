var RunAssignment = function(config){
	this.type = config.type || "";
	this.routeToExchange = config.routeToExchange || [];
	this.routeAfterExchange = config.routeAfterExchange || [];
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

RunAssignment.prototype.removeBeforeExchange = function(){
	if(this.routeToExchange.length > 0){
		this.routeToExchange.pop();
	}
};

RunAssignment.prototype.removeAfterExchange = function(){
	if(this.routeAfterExchange.length > 0){
		this.routeAfterExchange.pop();
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
		if(this.type === "Handoff"){
			strokeWeight(3);
			stroke(255, 255, 0);
			line(x1, y1, x2, y2);
			strokeWeight(1);
			noStroke();
		}else if(this.type === "Pitch"){
			stroke(0, 0, 220);
			line(x1, y1, x2, y2);
			noStroke();
		}
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
			stroke(0, 220, 0);
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
