// Constructor

var Button = function(config) {
    this.x = config.x || 0;
    this.y = config.y || 360;
    this.width = config.width || 60;
    this.height = config.height || 30;
    this.label = config.label || "";
    this.clicked = config.clicked || false;
    this.fill = config.fill || color(255, 255, 255);
    this.displayButton = config.displayButton || false;
    this.player = config.player || null;
    this.test = config.test || null;
};

// Prototype Methods

Button.prototype.draw = function() {
    fill(this.fill);
    rect(this.x, this.y, this.width, this.height);
    fill(0, 0, 0);
    textSize(12);
    textAlign(LEFT, TOP);
    text(this.label, this.x+5, this.y+this.height/4);
    this.displayButton = true; // COULD CAUSE SOME BUGS SO COME BACK TO THIS IF BUTTONS ARE WEIRD
};

Button.prototype.isMouseInside = function() {
    return this.displayButton &&
           mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};

Button.prototype.changeClickStatus = function() {
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



// Create Buttons
