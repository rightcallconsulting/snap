(function() {

  var colors = {
    correct: '#558B2F',
    incorrect: '#F7464A',
    skipped: '#FDB45C',
    empty: '#EAEAEA',
  }

  // Configure global Chart.js settings
  // http://www.chartjs.org/docs/#getting-started-global-chart-configuration
  Chart.defaults.global.animation = false;
  Chart.defaults.global.showTooltips = false;

  // Extend Chart.js core Doughnut chart
  Chart.types.Doughnut.extend({
    name: "SingleValueDoughnut",
    
    initialize: function(data) {
      // Save value for drawing center label
      this.value = data[0].value;
      Chart.types.Doughnut.prototype.initialize.apply(this, arguments);
    },

    // Prevents center label from being moved on hover
    showTooltip: function() {
      this.chart.ctx.save();
      Chart.types.Doughnut.prototype.showTooltip.apply(this, arguments);
      this.chart.ctx.restore();
    },

    draw: function() {
      Chart.types.Doughnut.prototype.draw.apply(this, arguments);

      var width = this.chart.width,
        height = this.chart.height;

      var fontSize = (height / 140).toFixed(2);
      this.chart.ctx.font = fontSize + "em Verdana";
      this.chart.ctx.textBaseline = "middle";

      var text = this.value + '%';
      var textX = Math.round(
        (width - this.chart.ctx.measureText(text).width) / 2
      );
      var textY = height / 2;
      this.chart.ctx.fillStyle = '#000000';
      this.chart.ctx.fillText(text, textX, textY);
    }
  });

  /**
   * Creates and draws a SingleValueDonut chart.
   * 
   * @param percent {Number} Integer between 0 and 100 representing a % value
   * @param color {String} The desired color of the chart (E.g.,'#FFFFFF')
   * @param elementID {String} The id tag of the element to draw the chart in
   */
  function makeChart(percent, color, elementID) {
    var data = [
      {
        value: percent,
        color: color,
      },
      {
        value: 100 - percent,
        color: colors.empty,
      }
    ];

    var ctx = document.getElementById(elementID).getContext("2d");
    var correctChart = new Chart(ctx).SingleValueDoughnut(data,{});
  }

  // NOTE: percentCorrect, percentIncorrect, & percentSkipped are all passed
  // in through a script tag at the bottom of /templates/show_player_list.html

  makeChart(percentCorrect, colors.correct, 'percentCorrectChart');
  makeChart(percentIncorrect, colors.incorrect, 'percentIncorrectChart');
  makeChart(percentSkipped, colors.skipped, 'percentSkippedChart');
})();
