var Button = function(config) {
    this.x = config.x || 0;
    this.y = config.y || 360;
    this.width = config.width || 4;
    this.height = config.height || 3;
    this.label = config.label || "";
    this.clicked = config.clicked || false;
    this.fill = config.fill || color(255, 255, 255);
    this.displayButton = config.displayButton || false;
    this.player = config.player || null;
    this.test = config.test || null;
};

// Prototype Methods

Button.prototype.draw = function(field) {
    fill(this.fill);
    var x = field.getTranslatedX(this.x);
    var y = field.getTranslatedY(this.y);
    var width = field.yardsToPixels(this.width);
    var height = field.yardsToPixels(this.height);
    rect(x, y, width, height);
    fill(0, 0, 0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(this.label, x, y, width, height);
    //this.displayButton = true; // COULD CAUSE SOME BUGS SO COME BACK TO THIS IF BUTTONS ARE WEIRD
};

Button.prototype.isMouseInside = function(field) {
  var x = field.getTranslatedX(this.x);
  var y = field.getTranslatedY(this.y);
  var width = field.yardsToPixels(this.width);
  var height = field.yardsToPixels(this.height);
    return mouseX > x &&
           mouseX < (x + width) &&
           mouseY > y &&
           mouseY < (y + height);
};

Button.prototype.changeClickStatus = function() {
    if (this.clicked) {
        this.fill = color(255, 255, 255);
        this.clicked = false;
    } else {
        this.fill = color(176, 176, 176);
        this.clicked = true;
    }
};
