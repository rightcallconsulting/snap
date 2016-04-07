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
	var startX = rb.startX;
	var startY = rb.startY;
	var x1 = field.getTranslatedX(startX);
	var y1 = field.getTranslatedY(startY);
	var i = 0;
	var exchangeLocation = this.routeToExchange[i];
	var x2 = field.getTranslatedX(exchangeLocation[0]);
	var y2 = field.getTranslatedY(exchangeLocation[1]);


	for(i = 0; i < this.routeToExchange.length; i++){
		if(i > 0){
			startX = this.routeToExchange[i-1][0];
			startY = this.routeToExchange[i-1][1];
		}
		if(this.type === "Handoff"){
			stroke(255, 255, 0);
			line(x1, y1, x2, y2);
			noStroke();
		}else if(this.type === "Pitch"){
			stroke(255, 255, 0);
			for(var i = 0; i <= 10; i++) {
				var x = lerp(x1, x2, i / 10);
				var y = lerp(y1, y2, i / 10);
				point(x, y);
			}
		}

		}
	};

	RunAssignment.prototype.drawRouteAfterExchange = function(rb, field){
		var startX = rb.startX;
		var startY = rb.startY;
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
			stroke(0, 255, 255);
			line(field.getTranslatedX(startX), field.getTranslatedY(startY), field.getTranslatedX(exchangeDestination[0]), field.getTranslatedY(exchangeDestination[1]));
			noStroke();
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
