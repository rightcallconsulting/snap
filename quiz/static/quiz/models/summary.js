var Summary = function(config){
  this.x = 200;
  this.y = 30;
  this.width = 500;
  this.height = 50;
  this.fill = config.fill || color(255, 255, 255);
  this.header = config.header || "";
  this.team = config.team || null;
  this.sortButtons = config.sortButtons || [];
  this.positionButtons = config.positionButtons || [];
  this.home = config.home || true;
  this.menuButtons = config.menuButtons || [];
};

Summary.prototype.hideMenuButtons = function(menuButton){
  this.menuButtons.forEach(function(button){
    button.displayButton = false;
  })
  this.showMenu = false;
  menuButton.label = "Show Menu";
};

Summary.prototype.showMenuButtons = function(menuButton){
  this.menuButtons.forEach(function(button){
    button.draw();
    button.displayButton = true;
  })
  menuButton.label = "Hide Menu";
  this.showMenu = true;

};
