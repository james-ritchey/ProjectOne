$('#find-user').on('click', function (event) {
    event.preventDefault();
    var username = $('#user-input').val();
    var imgURL = "https://api.adorable.io/avatars/150/" + username + ".png";

    var avatar = $('<img>');
    avatar.addClass('avatar')
    avatar.attr('src', imgURL);
    $('.imageBox').append(avatar);
})

$(document).ready(function () {

    (function ($) {

        $.fn.shuffle = function () {

            var allElems = this.get(),
                getRandom = function (max) {
                    return Math.floor(Math.random() * max);
                },
                shuffled = $.map(allElems, function () {
                    var random = getRandom(allElems.length),
                        randEl = $(allElems[random]).clone(true)[0];
                    allElems.splice(random, 1);
                    return randEl;
                });

            this.each(function (i) {
                $(this).replaceWith($(shuffled[i]));
            });

            return $(shuffled);

        };

    })(jQuery);

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
            console.log(queryURL)
            console.log(response);
            console.log(response.results[0].incorrect_answers);
            console.log(response.results[0].correct_answer);

            $('#question').html(response.results[0].question);
            var ansLine = $('<ul>')
            var i = 0
            for (i = 0; i < 3; i++) {
                var wchoice = $('<li class="answer-choice">').html(response.results[0].incorrect_answers[i]);
                wchoice.addClass('w');
                ansLine.append(wchoice)
            }
            var rchoice = $('<li class="answer-choice">').html(response.results[0].correct_answer);
            rchoice.addClass('r');
            ansLine.append(rchoice)
            $('#correct-answer').html(ansLine);
            $('.answer-choice').shuffle();

        })
    })


})