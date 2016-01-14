var Scoreboard = function(config){
    this.x = 300;
    this.y = 30;
    this.width = 500;
    this.height = 50;
    this.fill = config.fill || color(255, 255, 255);
    this.feedbackMessage = config.feedbackMessage || "";
};

Scoreboard.prototype.draw = function(test, user) {
    fill(0, 0, 0);
    noStroke();
    textSize(18);
    textAlign(CENTER, CENTER);
    text(test.getScoreString(), this.x, this.y);
};
