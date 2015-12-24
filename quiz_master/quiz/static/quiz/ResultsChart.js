function setup() {
  var myCanvas = createCanvas(600, 500);
  background(58, 135, 70);
  myCanvas.parent('quiz-box');
}

function draw() {


  var peytonTest1Completed = new Test({
    score: 5,
    plays: [null, null, null, null, null, null, null, null, null, null],
    incorrectGuesses: 17,
    skips: 3,
    completed: true,
    name: "Test 1"
  });

  var peytonTest2Completed = new Test({
    score: 5,
    plays: [null, null, null, null, null, null, null, null, null, null],
    incorrectGuesses: 3,
    skips: 0,
    completed: true,
    name: "Test 2"
  });

  var peytonTest3Completed = new Test({
    score: 10,
    plays: [null, null, null, null, null, null, null, null, null, null],
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

  var cv = document.getElementById('defaultCanvas0');
	var ctx = cv.getContext('2d');

	var labels = []//["11-23", "11-24", "11-25"];//, "11-26"];
	for(var i = 0; i < peytonManning.tests.length; i++){
		if(peytonManning.tests[i].completed){
			labels.push(peytonManning.tests[i].name);
		}
	}
	var accuracyData = [];
	for(var i = 0; i < peytonManning.tests.length; i++){
		if(peytonManning.tests[i].completed){
			accuracyData.push(int(peytonManning.tests[i].getPercentage()));
		}
	}

	var data = {
    	labels: labels,
    	datasets: [
        	{
				label: "Accuracy",
				fillColor: "rgba(220,220,220,0.2)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)",
				data: accuracyData
			}/*,
			{
				label: "Speed",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: [28, 48, 40, 19, 86, 27, 90]
			}*/
		]
	};

	var options = {

		scaleOverride: true,

		scaleSteps: 10,

		scaleStepWidth: 10,

		scaleStartValue: 0,

		///Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - Whether to show horizontal lines (except X axis)
		scaleShowHorizontalLines: true,

		//Boolean - Whether to show vertical lines (except Y axis)
		scaleShowVerticalLines: false,


		//Boolean - Whether the line is curved between points
		bezierCurve : false,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

	};

	var myLineChart = new Chart(ctx).Line(data, options);

	//var myBarChart = new Chart(ctx).Bar(data, options);


  draw = function() {

  };
}
