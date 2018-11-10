$(document).ready(function(){
    /**
     * Object that stores the local game variables and updates based
     * on database changes
     */
    var game = {
        players: { player1: "", player2: "", player3: "", player4: ""},
        answerChoices: { player1: "", player2: "", player3: "", player4: ""},
        scores: { player1: 0, player2: 0, player3: 0, player4: 0}, 
        localPlayer: "",
        isHost: false,
        playerCount: 0,
        gameCreated: false,
        gameStarted: false,
        gameFull: false,
        playerNum: 0,
        allAnswered: false,
        reset: function() {
            this.players = { player1: "", player2: "", player3: "", player4: ""};
            this.answerChoices = { player1: "", player2: "", player3: "", player4: ""};
            this.scores = { player1: 0, player2: 0, player3: 0, player4: 0};
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
        players: {player1: "", player2: "", player3: "", player4: ""},
        answerChoices: { player1: "", player2: "", player3: "", player4: ""},
        scores: {player1: 0, player2: 0, player3: 0, player4: 0},  
        playerCount: 0,
        playerNum: 0,
        gameCreated: false,
        gameStarted: false,
        gameFull: false,
        allAnswered: false,
        questionData: {
            correctAnswer: "",
            answerList: {A: "no", B: "nope", C: "AH", D: "nono"},
            question: "",
            questionNum: 1
        }
    }
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
        game.scores = snapshot.val().scores;
        game.answerChoices = snapshot.val().answerChoices;
        game.playerCount = snapshot.val().playerCount;
        game.gameCreated = snapshot.val().gameCreated;
        game.gameStarted = snapshot.val().gameStarted;
        game.gameFull = snapshot.val().gameFull;
        game.playerNum = snapshot.val().playerNum;
        
        if(snapshot.val().gameCreated && !(snapshot.val().gameFull)){
            $("#new-player").css("display", "block"); 
        }
        else if(snapshot.val().gameCreated && snapshot.val().gameFull){
            $("#spectator").css("display", "block");
        }
        else if(!snapshot.val().gameCreated){
            $("#new-host").css("display", "block");
        }
        $("#player-list > ul").empty();
        var newList = $("<ul>");
        for(var i = 1; i <= game.playerCount; i++){
            database.ref("game/players/player" + i).once("value").then(function(snapshot){
                var newPlayer = $("<li>");
                $(newPlayer).text(snapshot.val());
                $(newList).append($(newPlayer));
            });
        }
        $("#player-list").append($(newList));
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
                $("#new-player").css("display", "block");
                $("#new-host").css("display", "none");
                $("#spectator").css("display", "none");

            }
            else if(game.gameCreated && game.gameFull) {
                $("#new-player").css("display", "none");
                $("#new-host").css("display", "none");
                $("#spectator").css("display", "block");
            }
            else {
                $("#new-player").css("display", "none");
                $("#new-host").css("display", "block");
                $("#spectator").css("display", "none");
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
            $("#new-player").css("display", "block");
            $("#new-host").css("display", "none");
            $("#spectator").css("display", "none");

        }
        else if(game.gameCreated && game.gameFull) {
            $("#new-player").css("display", "none");
            $("#new-host").css("display", "none");
            $("#spectator").css("display", "block");
        }
        else {
            $("#new-player").css("display", "none");
            $("#new-host").css("display", "block");
            $("#spectator").css("display", "none");
        }
    });
    /**
     * Is called when the players value changes on the database,
     * updating the displayed list of players
     */
    database.ref("game/players").on("value", function(snapshot){
        game.players = snapshot.val();
        $("#player-list > ul").empty();
        var newList = $("<ul>");
        for(var i = 1; i <= game.playerCount; i++){
            database.ref("game/players/player" + i).once("value").then(function(snapshot){
                var newPlayer = $("<li>");
                $(newPlayer).text(snapshot.val());
                $(newList).append($(newPlayer));
            });
        }
        $("#player-list").append($(newList));
        console.log("We know the players changed to " + JSON.stringify(game.players));
    });

    database.ref("game/playerNum").on("value", function(snapshot){
        game.playerNum = snapshot.val();
        if(game.playerNum >= 2) {
            $("#start").text("Start Game");
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
            $("#game").css("display", "block");
        }
        else{
            $("#game").css("display", "none");
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
     * Is called when the 'Create Game' button is clicked by the host,
     * creating a new trivia game and swapping the view for other players
     * to the 'New Player' view; sets the 'gameCreated' value on the database
     * to 'true'.
     */
    $("#create").on("click", function(){
        game.players.player1 = $("#name").val().trim();
        game.localPlayer = "player1";
        $("#name").val("");
        game.playerCount = $("#players").val().trim();
        $("#players").val(0);
        game.isHost = true;
        game.gameCreated = true;
        game.playerNum++;
        var updates = {
            players: {
                player1: game.players.player1,
                player2: game.players.player2,
                player3: game.players.player3,
                player4: game.players.player4
            },
            playerCount: game.playerCount,
            gameCreated: true,
            playerNum: game.playerNum
        }
        database.ref("game/").update(updates);
        $("#new-host").css("display", "none");
        $("#current-host").css("display", "block");
    });
    /**
     * Is called when the 'Join Game' button is clicked by a new player,
     * adding the player to the list and sets them to wait for the host 
     * to start the game.
     */
    $("#join").on("click", function(){
        if($("#join-name").val().trim() !== ""){
            database.ref("game/players").once("value").then(function(snapshot){
                game.playerNum++;
                database.ref("game/playerNum").set(game.playerNum);
                var playerList = snapshot.val();
                if(game.playerCount >= 2  && playerList.player2 === "") {
                    playerList.player2 = $("#join-name").val().trim();
                    game.localPlayer = "player2";
                    game.playerNum = 2;
                    if(game.playerCount == 2)
                        game.gameFull = true;
                }
                else if(game.playerCount >= 3 && playerList.player3 === "") {
                    playerList.player3 = $("#join-name").val().trim();
                    game.localPlayer = "player3";
                    game.playerNum = 3;
                    if(game.playerCount == 3)
                        game.gameFull = true;
                }
                else if(game.playerCount == 4 && playerList.player4 === "") {
                    playerList.player4 = $("#join-name").val().trim();
                    game.localPlayer = "player4";
                    game.playerNum = 4;
                    game.gameFull = true;
                }
                database.ref("game/players").update(playerList);
                database.ref("game/gameFull").set(game.gameFull);
                console.log(JSON.stringify(playerList));
                console.log("We tried to join as " + $("#join-name").val().trim());
                $("#join-name").val("");
                $("#new-player").css("display", "none");
            });
        }
    });
    /**
     * Is called when the host clicks the 'Start Game' button, sets the 'gameStarted'
     * value on the database to 'true'.
     */
    $("#start").on("click", function(){
        if($(this).text() === "Start Game"){
            game.gameStarted = true;
            database.ref("game/gameStarted").set(true);
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
    $(".answer-choice").on("click", function(){
        if(game.localPlayer !== ""){
            var answer = $(this).attr("value");
            database.ref("game/answerChoices/" + game.localPlayer).set(answer);
            var numAnswered = 0;
            for(var i = 1; i <= game.playerNum; i++) {
                database.ref("game/answerChoices/player" + i).once("value").then(function(snapshot){
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
    /**
     * Prints the local game object to the console when a button is pressed, used for debugging.
     */
    /*
    $("button").on("click", function(){
        console.log(game);
    })*/
});