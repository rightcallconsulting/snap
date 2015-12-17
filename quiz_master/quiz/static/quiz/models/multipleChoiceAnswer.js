// Constructor

var MultipleChoiceAnswer = function(config) {
    this.x = config.x || 0;
    this.y = config.y || 360;
    this.width = config.width || 60;
    this.height = config.height || 30;
    this.label = config.label || "Click";
    this.clicked = config.clicked || false;
    this.fill = config.fill || color(255, 255, 255);
    this.displayAnswer = config.displayAnswer || true;
};

// Prototype Methods

MultipleChoiceAnswer.prototype.draw = function() {
    fill(this.fill);
    rect(this.x, this.y, this.width, this.height);
    fill(0, 0, 0);
    textSize(12);
    textAlign(LEFT, TOP);
    text(this.label, this.x+5, this.y+this.height/4, this.width, this.height);
};

MultipleChoiceAnswer.prototype.isMouseInside = function() {
    return this.displayAnswer &&
           mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};

MultipleChoiceAnswer.prototype.changeClickStatus = function() {
    if (this.clicked) {
        this.fill = color(255, 255, 255);
        this.clicked = false;
        this.draw();
    } else {
        this.fill = color(176, 176, 176);
        this.clicked = true;
        this.draw();
    }
};
