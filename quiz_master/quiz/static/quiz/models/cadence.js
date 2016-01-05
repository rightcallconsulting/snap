var CadenceElement = function(config){
	this.text = config.text || "";
	this.group = config.group || ""; //tbi, but might allow for regex-style cadences
	this.timeToShow = config.timeToShow || 500; //time in millies
};

CadenceElement.prototype.getShowTime = function(){
	return this.timeToShow;
};

CadenceElement.prototype.getShowText = function(){
	return this.text;
};

var Cadence = function(config) {
    this.elements = config.elements || [];
    this.currentElementIndex = config.startIndex || 0;
    this.startTime = 0;
};

Cadence.prototype.addElementAt = function(e, index) {
	if(index < 0){
		//TBI - error
	}else if(index >= this.elements.length){
		this.elements.push(e);
	}else{
		var latter = this.elements.slice(index);
		this.elements = (this.elements.slice(0, index));
		this.elements.push(e);
		this.elements.concat(latter);
	}
};

Cadence.prototype.addElement = function(e) {
	this.addElementAt(e,this.elements.length);
};

Cadence.prototype.startCadence = function(){
	if(this.paused){
		this.startTime = millis() - this.elapsedTime;
		this.paused = false;
	}else{
		this.startTime = millis();
		this.currentElementIndex = 0;
	}
};

Cadence.prototype.restartCadence = function(){
	this.currentElementIndex = 0;
	if(this.startTime > 0 && !this.paused){
		this.startTime = millis();
	}else{
		this.startTime = 0;
		this.paused = false;
	}
};

Cadence.prototype.pauseCadence = function(){
	if(this.isCadenceTimedOut()){
		this.endTime = millis();
	}else{
		this.paused = true;
		this.elapsedTime = millis() - this.startTime;
		this.startTime = 0;
	}
}

Cadence.prototype.getElementAt = function(n){
	if(n >= 0 && n < this.elements.length){
		return this.elements[n];
	}
	return null;
};

Cadence.prototype.getCadenceTime = function(start, finish){
	start = start || 0;
	finish = finish || this.elements.length;
	var timeSum = 0;
	for(var i = 0; i < finish; i++){
		timeSum += this.elements[i].getShowTime();
	}
	return timeSum;
};

Cadence.prototype.getElementForTime = function(){
	if(this.startTime === 0 || this.paused){
		return null;
	}
	var elapsedTime = millis() - this.startTime;
	if(elapsedTime < 0){
		return null;
	}
	
	var timeSum = 0;
	for(var i = 0; i < this.elements.length; i++){
		timeSum += this.elements[i].getShowTime();
		if(timeSum > elapsedTime){
			return this.elements[i];
		}
	}
	
	return null;
};

Cadence.prototype.getCurrentElement = function(){
	return this.getElementAt(this.currentElementIndex);
};

Cadence.prototype.advanceCadence = function(){
	this.currentElementIndex++;
};

Cadence.prototype.getEndTime = function(){
	if(this.startTime === 0){
		return 0;
	}
	return this.startTime + this.getCadenceTime();
};

Cadence.prototype.isCadenceTimedOut = function(){
	var elapsedTime = millis() - this.startTime;
	return elapsedTime > this.getCadenceTime();
};

Cadence.prototype.isCadenceOver = function(){
	return this.currentElementIndex >= this.elements.length;	
};