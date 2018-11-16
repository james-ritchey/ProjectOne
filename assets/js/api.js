$(document).ready(function () {

    var database = firebase.database();

    getNewQuestion = function() {
        var fetchToken = "https://opentdb.com/api_token.php?command=request"

        // Generates a new token so no questions appear twice, should be kept in onload function
        $.ajax({
            url: fetchToken,
            method: "GET"
        }).then(function (response) {
            var sessionToken = response.token;
            var queryURL = "https://opentdb.com/api.php?amount=1&category=14&type=multiple&token=" + sessionToken;

            // Get's the question and answers
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function (response) {
                var data = response.results[0];
                console.log(queryURL)
                console.log(response);
                console.log(response.results[0].incorrect_answers);
                console.log(response.results[0].correct_answer);
                var answers = {
                    A: data.incorrect_answers[0],
                    B: data.incorrect_answers[1],
                    C: data.incorrect_answers[2],
                    D: data.correct_answer
                }
                var questionObject = {
                    answerList: answers,
                    correctAnswer: response.results[0].correct_answer,
                    question: response.results[0].question,
                }
                database.ref("game/questionData").update(questionObject);
            });
        });
    }

});