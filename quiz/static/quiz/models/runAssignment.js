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

RunAssignment.prototype.clearRunAssignments = function(){
	this.routeToExchange = [];
	this.routeAfterExchange = [];
};

RunAssignment.prototype.drawRouteToExchange = function(rb, field){
	var startX = rb.startX;
	var startY = rb.startY;
	for(var i = 0; i < this.routeToExchange.length; i++){
		if(i > 0){
			startX = this.routeToExchange[i-1][0];
			startY = this.routeToExchange[i-1][1];
		}
		var exchangeLocation = this.routeToExchange[i];
		stroke(255, 255, 0);
		line(field.getTranslatedX(startX), field.getTranslatedY(startY), field.getTranslatedX(exchangeLocation[i][0]), field.getTranslatedY(exchangeLocation[i][1]));
		noStroke();
	}
};

RunAssignment.prototype.drawRouteAfterExchange = function(field){
	var startX = this.routeToExchange[this.routeToExchange.length-1][0];
	var startY = this.routeToExchange[this.routeToExchange.length-1][1];
	for(var i = 0; i < this.routeAfterExchange.length; i++){
		if(i > 0){
			startX = this.routeAfterExchange[i-1][0];
			startY = this.routeAfterExchange[i-1][1];
		}
		var exchangeDestination = this.routeAfterExchange[i];
		stroke(255, 255, 0);
		line(field.getTranslatedX(startX), field.getTranslatedY(startY), field.getTranslatedX(exchangeDestination[i][0]), field.getTranslatedY(exchangeDestination[i][1]));
		noStroke();
	}
};

