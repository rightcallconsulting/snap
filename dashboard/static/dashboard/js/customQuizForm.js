var DEFAULT_NUM_QUESTIONS = 5;
var destinationUrlBase;

$('.quiz-link').click(function() {
  destinationUrlBase = $(this).data('dest-url');
});

function redirectToCustomQuiz() {
  var numQuestions = $('#inputNumQuestions').val();
  if (numQuestions === '') { numQuestions = DEFAULT_NUM_QUESTIONS; }
  var order = $('#inputOrder option:selected').val();

  var destinationUrl = destinationUrlBase + 
    '?num_qs=' + numQuestions +
    ',order=' + order;
  window.location.href = destinationUrl;
}

$('#quizOptionsForm').submit(function () {
  redirectToCustomQuiz()
  return false;
});
