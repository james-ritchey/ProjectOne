$(document).ready(function(){
    /**
     * Object that stores the local game variables and updates based
     * on database changes
     */
    var game = {
        players: {
            player1: {name: "", answer: "", score: 0},
            player2: {name: "", answer: "", score: 0},
            player3: {name: "", answer: "", score: 0},
            player4: {name: "", answer: "", score: 0},
        }, 
        localPlayer: "",
        isHost: false,
        playerCount: 0,
        gameCreated: false,
        gameStarted: false,
        gameFull: false,
        playerNum: 0,
        allAnswered: false,
        questionMax: 10,
        questionData: {
            correctAnswer: "",
            answerList: {A: "", B: "", C: "", D: ""},
            question: "",
            questionNum: 1,
            timerValue: 0
        },
        reset: function() {
            this.players = {
                player1: {name: "", answer: "", score: 0},
                player2: {name: "", answer: "", score: 0},
                player3: {name: "", answer: "", score: 0},
                player4: {name: "", answer: "", score: 0},
            },
            this.questionData = {
                correctAnswer: "",
                answerList: {A: "", B: "", C: "", D: ""},
                question: "",
                questionNum: 1,
                timerValue: 0
            },
            this.isHost = false;
            this.playerCount = 0;
            this.gameCreated = false;
            this.gameStarted = false;
            this.gameFull = false;
            this.playerNum = 0;
            this.localPlayer = "";
            this.allAnswered = false;
        }
    }
    /**
     * Default values for the database to reset once the game finishes
     */
    var gameReset = {
        players: {
            player1: {name: "", answer: "", score: 0},
            player2: {name: "", answer: "", score: 0},
            player3: {name: "", answer: "", score: 0},
            player4: {name: "", answer: "", score: 0},
        },
        playerCount: 4,
        playerNum: 0,
        gameCreated: false,
        gameStarted: false,
        gameFull: false,
        allAnswered: false,
        questionMax: 10,
        questionData: {
            correctAnswer: "",
            answerList: {A: "", B: "", C: "", D: ""},
            question: "",
            questionNum: 1,
            timerValue: 15
        }
    }

    var intervalID;
//============================== Start Firebase Logic ==================================================>>

    /**Variable for the firebase database */
    var database = firebase.database();
    //Remove comment to reset game on page load
    //database.ref("game/").set(gameReset);

    /**
     * Pulls the needed values from the database on page load,
     * updating the playerList and checking if the game has been
     * created or is full.
     */
    database.ref("game/").once("value").then(function(snapshot){
        game.players = snapshot.val().players;
        game.playerCount = snapshot.val().playerCount;
        game.gameCreated = snapshot.val().gameCreated;
        game.gameStarted = snapshot.val().gameStarted;
        game.gameFull = snapshot.val().gameFull;
        game.playerNum = snapshot.val().playerNum;
        localStorage.setItem("playerNum", snapshot.val().playerNum);
        
        if(snapshot.val().gameCreated && !(snapshot.val().gameFull)){
            $("#playerModal").modal("show"); 
        }
        else if(snapshot.val().gameCreated && snapshot.val().gameFull){
            $("#spectator").css("display", "block");
        }
        else if(!snapshot.val().gameCreated){
            $("#myModal").modal("show");
        }

        if(game.playerNum < 0) {
            game.playerNum = 0;
            database.ref("game/").update({playerNum: game.playerNum});
            localStorage.setItem("playerNum", 0);
        }
    });
    /**
     * Is called when the gameCreated value changes on the database,
     * updates the current status of the game for all page viewers;
     * resets the game if the gameCreated value changes to 'false'.
     */
    database.ref("game/gameCreated").on("value", function(snapshot){
        game.gameCreated = snapshot.val();
        if(!game.isHost){
            if(game.gameCreated && !game.gameFull){
                $("#playerModal").modal("show");
                $("#myModal").modal("hide");
                console.log("were trying i swear");
            }
            else if(game.gameCreated && game.gameFull) {
                $("#playerModal").modal("hide");
                $("#myModal").modal("hide");
            }
            else {
                $("#playerModal").modal("hide");
                $("#myModal").modal("show");
            }
        }
        if(!snapshot.val()){
            game.reset();
            $("#new-player").css("display", "none");
            $("#new-host").css("display", "block");
            $("#spectator").css("display", "none");
            $("#current-host").css("display", "none");
        }
    });
    /**
     * Is called when the gameFull value changes on the database,
     * if the game is full then the page updates to allow spectators
     * but no new players can join.
     */
    database.ref("game/gameFull").on("value", function(snapshot){
        game.gameFull = snapshot.val();
        if(game.gameCreated && !game.gameFull){
            $("#playerModal").modal("show");
            $("#myModal").modal("hide");
        }
        else if(game.gameCreated && game.gameFull) {
            $("#playerModal").modal("hide");
            $("#myModal").modal("hide");
        }
        else {
            $("#playerModal").modal("hide");
            $("#myModal").modal("show");
        }
    });
    /**
     * Is called when the players value changes on the database,
     * updating the displayed list of players
     */
    database.ref("game/players").on("value", function(snapshot){
        game.players = snapshot.val();
        var newPlayerNum = 0;
        if(game.players.player1.name !== ""){
            $("#player1").text(game.players.player1.name);
            $("#avatar1").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player1.name + ".png");
            $("#player1-score").text(game.players.player1.score);
            newPlayerNum++;
        }
        else{
            $("#player1").text("Player 1");
            $("#avatar1").attr("src", "assets/images/default_avatar.png");
        }
        if(game.players.player2.name !== ""){
            $("#player2").text(game.players.player2.name);
            $("#avatar2").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player2.name + ".png");
            $("#player2-score").text(game.players.player2.score);
            newPlayerNum++;
        }
        else{
            $("#player2").text("Player 2");
            $("#avatar2").attr("src", "assets/images/default_avatar.png");
        }
        if(game.players.player3.name !== ""){
            $("#player3").text(game.players.player3.name);
            $("#avatar3").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player3.name + ".png");
            $("#player3-score").text(game.players.player3.score);
            newPlayerNum++;
        }
        else{
            $("#player3").text("Player 3");
            $("#avatar3").attr("src", "assets/images/default_avatar.png");
        }
        if(game.players.player4.name !== ""){
            $("#player4").text(game.players.player4.name);
            $("#avatar4").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player4.name + ".png");
            $("#player4-score").text(game.players.player4.score);
            newPlayerNum++;
        }
        else{
            $("#player4").text("Player 4");
            $("#avatar4").attr("src", "assets/images/default_avatar.png");
        }
        if(newPlayerNum != game.playerNum) {
            game.playerNum = newPlayerNum;
        }
        database.ref("game/playerNum").set(game.playerNum);
        console.log("We know the players changed to " + JSON.stringify(game.players));
    });

    database.ref("game/playerNum").on("value", function(snapshot){
        game.playerNum = snapshot.val();
        localStorage.setItem("playerNum", game.playerNum);
        if(game.playerNum === 0 && game.gameCreated) {
            database.ref("game/gameCreated").set(false);
        }
    });
    /**
     * Is called when the gameStarted value changes on the database,
     * if the game has started then the questions and answers begin 
     * displaying for the players and spectators.
     * todo: Set up timer for each question 
     */
    database.ref("game/gameStarted").on("value", function(snapshot){
        game.gameStarted = snapshot.val();
        if(game.gameStarted){
            $("#answers").css("display", "block");
            if(game.players.player3.name === "") {
                $("#card3").css("display", "none");
            }
            if(game.players.player4.name === "") {
                $("#card4").css("display", "none");
            }
        }
        else{
            $("#answers").css("display", "none");
            $("#card3").css("display", "inline");
            $("#card4").css("display", "inline");
        }
    });
    /**
     * Is called when the playerCount value changes on the database,
     * updates the value locally to the 'game' object.
     */
    database.ref("game/playerCount").on("value", function(snapshot){
        game.playerCount = snapshot.val();
    });
    /**
     * 
     */
    database.ref("game/questionData").on("value", function(snapshot){
        game.questionData = snapshot.val();
        $("#question").html(game.questionData.question);
        $("#timer").text(game.questionData.timerValue);
        var answers = [game.questionData.answerList.A, game.questionData.answerList.B, game.questionData.answerList.C, game.questionData.answerList.D];
        $("#answers").empty();
        for(var i = 0; i < 4; i++) {
            var randomNum = Math.floor(Math.random() * Math.floor(answers.length));
            var answerPick = answers.splice(randomNum, 1);
            var newAnswerDiv = $("<div>");
            $(newAnswerDiv).html(answerPick);
            $(newAnswerDiv).addClass("answer-choice");
            $("#answers").append(newAnswerDiv);
            console.log("Answer: " + answerPick);
        }
        if(game.gameStarted) {
            intervalID = setInterval(decrement, 1000);
        }
    });

    //============================== End Firebase Logic ==================================================>>

//============================== Start Game Logic ====================================================>>

    /**
     * Is called when the 'Create Game' button is clicked by the host,
     * creating a new trivia game and swapping the view for other players
     * to the 'New Player' view; sets the 'gameCreated' value on the database
     * to 'true'.
     */
    $("#create").on("click", function(){
        if($("#host-name").val().trim() !== ""){
            game.players.player1.name = $("#host-name").val().trim();
            game.localPlayer = "player1";
            localStorage.setItem("localPlayer", "player1");
            $("#host-name").val("");
            game.playerCount = 4;
            //$("#players").val(0);
            game.isHost = true;
            game.gameCreated = true;
            game.playerNum++;
            localStorage.setItem("playerNum", game.playerNum);
            var updates = {
                players: {
                    player1: {name: game.players.player1.name, answer: "", score: 0},
                    player2: {name: game.players.player2.name, answer: "", score: 0},
                    player3: {name: game.players.player3.name, answer: "", score: 0},
                    player4: {name: game.players.player4.name, answer: "", score: 0},
                },
                playerCount: game.playerCount,
                gameCreated: true,
                playerNum: game.playerNum
            }
            database.ref("game/").update(updates);
            $("#myModal").modal("hide");
            if(game.isHost){
                $("#start").css("display", "block");
            }
        }
    });
    /**
     * Is called when the 'Join Game' button is clicked by a new player,
     * adding the player to the list and sets them to wait for the host 
     * to start the game.
     */
    $("#join").on("click", function(){
        if($("#player-name").val().trim() !== ""){
            database.ref("game/players").once("value").then(function(snapshot){
                game.playerNum++;
                database.ref("game/playerNum").set(game.playerNum);
                var playerList = snapshot.val();
                if(game.playerCount >= 2  && playerList.player2.name === "") {
                    playerList.player2.name = $("#player-name").val().trim();
                    game.localPlayer = "player2";
                    game.playerNum = 2;
                    if(game.playerCount == 2)
                        game.gameFull = true;
                }
                else if(game.playerCount >= 3 && playerList.player3.name === "") {
                    playerList.player3.name = $("#player-name").val().trim();
                    game.localPlayer = "player3";
                    game.playerNum = 3;
                    if(game.playerCount == 3)
                        game.gameFull = true;
                }
                else if(game.playerCount == 4 && playerList.player4.name === "") {
                    playerList.player4.name = $("#player-name").val().trim();
                    game.localPlayer = "player4";
                    game.playerNum = 4;
                    game.gameFull = true;
                }
                database.ref("game/players").update(playerList);
                database.ref("game/gameFull").set(game.gameFull);
                localStorage.setItem("localPlayer", game.localPlayer);
                localStorage.setItem("playerNum", game.playerNum);
                console.log(JSON.stringify(playerList));
                console.log("We tried to join as " + game.localPlayer);
                $("#join-name").val("");
                $("#playerModal").modal("toggle");
            });
        }
    });
    /**
     * Is called when the host clicks the 'Start Game' button, sets the 'gameStarted'
     * value on the database to 'true'.
     */
    $("#start").on("click", function(){
        if(game.playerNum >= 2){
            game.gameStarted = true;
            database.ref("game/gameStarted").set(true);
            if(game.isHost) {
                startGame();
            }
        }
    });
    /**
     * Is called when the 'End Game' button is pressed, resets the game locally and
     * on the database, allowing a new game to be made.  Will only be available to the 
     * game host.
     */
    $("#clear").on("click", function(){
        database.ref("game/").set(gameReset);
        game.reset();
    });
    /**
     * Is called when an answer choice is clicked, will only pass a value when the viewer is a
     * player and not a spectator.
     */
    $(document).on("click", ".answer-choice", function(){
        if(game.localPlayer !== ""){
            var answer = $(this).html();
            console.log(answer);
            database.ref("game/players/" + game.localPlayer + "/answer").set(answer);
            var numAnswered = 0;
            for(var i = 1; i <= game.playerNum; i++) {
                database.ref("game/players/player" + i + "/answer").once("value").then(function(snapshot){
                    if(snapshot.val() !== "") {
                        numAnswered++;
                    }
                    if(numAnswered === game.playerNum) {
                        database.ref("game/allAnswered").set(true);
                        console.log("Tried to set allAnswered");
                    }
                });
            }    
        }
    });

    startGame = function() {
        getNewQuestion();
        $("#start").css("display", "none");
    };  

    window.onbeforeunload = function(e){
        var disconnect = localStorage.getItem("localPlayer");
        var newPlayerNum = localStorage.getItem("playerNum") - 1;
        if(disconnect !== "" && disconnect !== "player1"){
            database.ref("game/players/" + disconnect).update({name: "", answer: "", score: 0});
            if(newPlayerNum <= 0) {
                database.ref("game/").update({playerNum: newPlayerNum, gameCreated: false});
            }
            else {
                database.ref("game/").update({playerNum: newPlayerNum});
            }
        }
        else if(disconnect === "player1"){
            database.ref("game/").set(gameReset);
        }
        localStorage.setItem("localPlayer", "");
        database.ref("unloadTest/bef").set("Yo we beforeloaded");
    }
    
    decrement = function() {
        clearInterval(intervalID);
        if(game.questionData.timerValue > 0){
            game.questionData.timerValue--;
            $("#timer").text(game.questionData.timerValue);
            intervalID = setInterval(decrement, 1000);
        }
        else {
            game.questionData.timerValue = 0;
            timeUp();
        }
    }

    timeUp = function() {
        console.log("Times up");
        var answer = "";
        var score = 0;
        database.ref("game/players/" + game.localPlayer).once("value").then(function(snapshot){
            answer = snapshot.val().answer;
            score = snapshot.val().score;
                if(answer === game.questionData.correctAnswer) {
                    score++;
                    $("#" + game.localPlayer + "-score").text(score);
                    database.ref("game/players/" + game.localPlayer + "/score").set(score);
                }
        });
        game.questionData.questionNum++;
        if(game.questionData.questionNum > 2) {
            setTimeout(endGame, 2000);
        }
        else {
            if(game.isHost) {
                setTimeout(getNewQuestion, 3000);
            }
        }
    }

    endGame = function() {
        var p1score = game.players.player1.score;
        var p2score = game.players.player2.score;
        var p3score = game.players.player3.score;
        var p4score = game.players.player4.score;
        
        if(game.playerNum === 2) {
            if(p1score > p2score) {
                $("#winner-name").text(game.players.player1.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player1.name + ".png");
            }
            else if(p2score > p1score) {
                $("#winner-name").text(game.players.player2.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player2.name + ".png");
            }
            else if(p1score === p2score) {
                $("#winner-name").text("It's a draw!");
                $("#win-avatar").css("display", "none");
            }
        }
        else if(game.playerNum === 3) {
            if(p1score > p2score && p1score > p3score) {
                $("#winner-name").text(game.players.player1.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player1.name + ".png");
            }
            else if(p2score > p1score && p2score > p3score) {
                $("#winner-name").text(game.players.player2.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player2.name + ".png");
            }
            else if(p3score > p1score && p3score > p2score) {
                $("#winner-name").text(game.players.player3.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player3.name + ".png")
            }
            else if(p3score === p1score || p3score === p2score) {
                $("#winner-name").text("It's a draw!");
                $("#win-avatar").css("display", "none");
            }
        }
        else if(game.playerNum === 4) {
            if(p1score > p2score && p1score > p3score && p1score > p4score) {
                $("#winner-name").text(game.players.player1.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player1.name + ".png");
            }
            else if(p2score > p1score && p2score > p3score && p2score > p4score) {
                $("#winner-name").text(game.players.player2.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player2.name + ".png");
            }
            else if(p3score > p1score && p3score > p2score && p3score > p4score) {
                $("#winner-name").text(game.players.player3.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player3.name + ".png")
            }
            else if(p4score > p1score && p4score > p3score && p4score > p2score) {
                $("#winner-name").text(game.players.player4.name + " Wins!");
                $("#win-avatar").attr("src", "https://api.adorable.io/avatars/285/" + game.players.player4.name + ".png")
            }            
            else if(p3score === p1score || p3score === p2score || p3score === p4score) {
                $("#winner-name").text("It's a draw!");
                $("#win-avatar").css("display", "none");
            }

        }
        $("#modal2").modal("show");
    }

    $("#replay").on("click", function(){
        database.ref("game/").set(gameReset);
        $("#myModal").modal("show");
        $("#win-avatar").css("display", "inline");
    });

    $(document).on({
        mouseenter: function() {
            if(game.localPlayer !== "") {
                $(this).css("background", "#040475");
                $(this).css("color", "white");
            }
    },  mouseleave: function() {
            $(this).css("background", "none");
            $(this).css("color", "#040475");
    }
    }, ".answer-choice");

    /**
     * Prints the local game object to the console when a button is pressed, used for debugging.
     */
    /*
    $("button").on("click", function(){
        console.log(game);
    })*/

    //============================== End Game Logic ====================================================>>

});