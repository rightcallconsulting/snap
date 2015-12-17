function setup() {
  createCanvas(400, 400);
  background(58, 135, 70);
}

function draw() {

  var summary = new Summary({
    header: "Results for "
  });

  var peytonTest1Completed = new Test({
    score: 5,
    incorrectGuesses: 17,
    skips: 3,
    completed: true,
    name: "Test 1"
  });

  var peytonTest2Completed = new Test({
    score: 5,
    incorrectGuesses: 3,
    skips: 0,
    completed: true,
    name: "Test 2"
  });

  var peytonTest3Completed = new Test({
    score: 10,
    incorrectGuesses: 11,
    skips: 1,
    completed: true,
    name: "Test 3"
  });

  var peytonTest4Assigned = new Test({
    assigned: true,
    name: "Test 4"
  });

  var brockTest1Completed = new Test({
    score: 2,
    incorrectGuesses: 20,
    skips: 3,
    name: "Test 1",
    completed: true
  });

  var brockTest2Completed = new Test({
    score: 4,
    incorrectGuesses: 2,
    skips: 1,
    name: "Test 2",
    completed: true
  });

  var test3 = new Test({
    score: 1,
    incorrectGuesses: 2,
    skips: 3,
    name: "Test 3"
  });

  var test4 = new Test({
    score: 10,
    incorrectGuesses: 0,
    skips: 3,
    name: "Test 4"
  });

  var broncos = new Team({
    teamName: "Broncos"
  });

  var peytonManning = new User({
    name: "Peyton Manning",
    position: "QB"
  });

  var brockOsweiler = new User({
    name: "Brock Osweiler",
    position: "QB"
  });

  var demaryiusThomas = new User({
    name: "Demaryius Thomas",
    position: "WR"
  });

  var vonMiller = new User({
    name: "Von Miller",
    position: "LB"
  });

  summary.team = broncos;
  peytonManning.tests.push(peytonTest1Completed);
  peytonManning.tests.push(peytonTest2Completed);
  peytonManning.tests.push(peytonTest3Completed);
  peytonManning.tests.push(peytonTest4Assigned);
  brockOsweiler.tests.push(brockTest1Completed);
  brockOsweiler.tests.push(brockTest2Completed);

  demaryiusThomas.tests.push(test3);
  vonMiller.tests.push(test4);
  broncos.players.push(peytonManning);
  broncos.players.push(brockOsweiler);
  broncos.players.push(demaryiusThomas);
  broncos.players.push(vonMiller);
  peytonManning.getOverallScore();
  brockOsweiler.getOverallScore();
  demaryiusThomas.getOverallScore();
  vonMiller.getOverallScore();

  // Create Buttons
  var viewLatest = new Button({
      x: 0,
      y: 70,
      width: 90,
      label: "Latest Scores",
      clicked: false,
      displayButton: true
  });

  var overallStandings = new Button({
      x: 0,
      y: 110,
      width: 90,
      label: "Overall",
      clicked: false,
      displayButton: true
  });

  var byPosition = new Button({
      x: 0,
      y: 150,
      width: 90,
      label: "By Position",
      clicked: false,
      displayButton: true
  });

  var playerDetail = new Button({
      x: 0,
      y: 190,
      width: 90,
      label: "Players",
      clicked: false,
      displayButton: true
  });

  var createTest = new Button({
      x: 0,
      y: 230,
      width: 90,
      label: "Create Test",
      clicked: false,
      displayButton: true
  });

  var home = new Button({
    x: 300,
    y: 290,
    width: 80,
    label: "Home",
    clicked: false,
    displayButton: true
  });

  var showMenu = new Button({
    x: 0,
    y: 10,
    width: 80,
    label: "Show Menu",
    clicked: false,
    displayButton: true
  });

  var qbButton = new Button({
      width: 30,
      label: "QB",
      clicked: false
  });

  var wrButton = new Button({
      width: 30,
      label: "WR",
      clicked: false
  });

  var lbButton = new Button({
      width: 30,
      label: "LB",
      clicked: false
  });

  var totalCorrectSort = new Button({
      width: 80,
      label: "Total Right",
      clicked: false
  });

  var totalWrongSort = new Button({
      width: 80,
      label: "Total Wrong",
      clicked: false
  });

  var totalPercentageSort = new Button({
      width: 80,
      label: "Total %",
      clicked: false
  });

  summary.sortButtons.push(totalCorrectSort);
  summary.sortButtons.push(totalWrongSort);
  summary.sortButtons.push(totalPercentageSort);
  summary.positionButtons.push(qbButton);
  summary.positionButtons.push(wrButton);
  summary.positionButtons.push(lbButton);
  summary.menuButtons.push(overallStandings);
  summary.menuButtons.push(viewLatest);
  summary.menuButtons.push(byPosition);
  summary.menuButtons.push(playerDetail);
  summary.menuButtons.push(createTest);

  // intro scene
  var drawOpening = function(test) {
    field.drawBackground("", height, width);
    broncos.drawSummaryHeader();
    drawMenuOptions();
    home.draw();
    fill(176,176,176)
  };

  var drawMenuOptions = function(){
    viewLatest.draw();
    overallStandings.draw();
    byPosition.draw();
    playerDetail.draw();
    createTest.draw();
    home.draw();
  };

  keyPressed = function() {
    if (keyCode === 32){

    }
    else if (keyCode === 81){
    }
    else if (keyCode === 8){
    }
  };

  mouseDragged = function(){

  };

  mouseClicked = function() {
      if (viewLatest.isMouseInside()) {

      }else if (showMenu.isMouseInside()){
        if (showMenu.label === "Show Menu"){
          summary.showMenu = true;
          showMenu.label = "Hide Menu"
        } else {
          summary.showMenu = false;
          showMenu.label = "Show Menu";
        }
      }else if (overallStandings.isMouseInside()){
        broncos.playerPressed= false;
        summary.hideMenuButtons(showMenu);
        summary.drawOverall = true;
      }else if (byPosition.isMouseInside()){
        broncos.playerPressed= false;
        summary.hideMenuButtons(showMenu);
        summary.drawPositionSummary = "QB";
        summary.drawOverall = false;
        summary.playerDetail = false;
      }else if (playerDetail.isMouseInside()){
        broncos.playerPressed= false;
        summary.hideMenuButtons(showMenu);
        summary.drawOverall = false;
        summary.drawPositionSummary = false;
        summary.byPosition = false;
        summary.playerDetail = true;
      }else if (totalCorrectSort.isMouseInside()){
        broncos.sortByTotalCorrect = true;
        broncos.sortByTotalPercentage = false;
        broncos.sortByTotalWrong = false;
      }
      else if(positionButtonPressed(summary.positionButtons)){
        broncos.playerPressed= false;
        summary.hideMenuButtons(showMenu);
        summary.drawPositionSummary = positionButtonPressed(summary.positionButtons).label
      }
      else if (totalWrongSort.isMouseInside()){
        broncos.sortByTotalWrong = true;
        broncos.sortByTotalCorrect = false;
        broncos.sortByTotalPercentage = false;
      }else if (totalPercentageSort.isMouseInside()){
        broncos.sortByTotalPercentage = true;
        broncos.sortByTotalCorrect = false;
        broncos.sortByTotalWrong = false;
      }else if(home.isMouseInside()){
        summary.showMenuButtons(showMenu);
        summary.playerDetail = false;
        summary.drawOverall = false;
        summary.drawPositionSummary = false;
        summary.byPosition = false;
        broncos.playerPressed = false;
        broncos.sortByTotalWrong = true;
        broncos.sortByTotalCorrect = false;
        broncos.sortByTotalPercentage = false;
      }else if(broncos.playerButtonPressed()){
        summary.hideMenuButtons(showMenu);
        broncos.playerPressed = broncos.playerButtonPressed();
        broncos.hidePlayerButtons();
      }
  };

  var positionButtonPressed = function(buttons){
    var buttonClicked = null;
    buttons.forEach(function(button){
      if(button.isMouseInside()){
        buttonClicked = button;
      }
    })
    return buttonClicked
  };


  draw = function() {
    field.drawBackground("", height, width);
    showMenu.draw();
    home.draw();
    if (summary.drawLatest){

    }
    else if (broncos.playerPressed){
      broncos.playerPressed.drawQuizAssignment(100,80);
    }
    else if(summary.drawOverall){
      broncos.drawOverallSummary(100, 100, summary.sortButtons);
    }
    else if(summary.drawPositionSummary){
      broncos.drawPositionSummary(summary.drawPositionSummary, 100, 100, summary.sortButtons);
      summary.positionButtons.forEach(function(button, index){
        button.x = 100 + 40*index;
        button.y = 190;
        button.displayButton = true;
        button.draw();
      })
    }
    else if(summary.playerDetail){
      broncos.drawAssignQuiz(140, 100)
    }
    else if(summary.home) {
      drawOpening();
    }
    if (summary.showMenu){
      summary.showMenuButtons(showMenu);
    }
  };
}
