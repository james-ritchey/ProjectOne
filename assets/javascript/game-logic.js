$(document).ready(function(){

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
        }
    }

    var gameReset = {
        players: { player1: "", player2: "", player3: "", player4: ""},
        answerChoices: { player1: "", player2: "", player3: "", player4: ""},
        scores: { player1: 0, player2: 0, player3: 0, player4: 0},  
        playerCount: 0,
        gameCreated: false,
        gameStarted: false,
        gameFull: false
    }

    var config = {
        apiKey: "AIzaSyAvhHsfODB_Ig0MUCq6dn71JURli3SLJzI",
        authDomain: "triviagame-e40d7.firebaseapp.com",
        databaseURL: "https://triviagame-e40d7.firebaseio.com",
        projectId: "triviagame-e40d7",
        storageBucket: "triviagame-e40d7.appspot.com",
        messagingSenderId: "34711059818"
    };
    firebase.initializeApp(config);

    var database = firebase.database();
    //database.ref("game/").set(gameReset);

    database.ref("game/").once("value").then(function(snapshot){
        game.players = snapshot.val().players;
        game.scores = snapshot.val().scores;
        game.answerChoices = snapshot.val().answerChoices;
        game.playerCount = snapshot.val().playerCount;
        game.gameCreated = snapshot.val().gameCreated;
        game.gameStarted = snapshot.val().gameStarted;
        game.gameFull = snapshot.val().gameFull;
        
        if(snapshot.val().gameCreated && !(snapshot.val().gameFull)){
            $("#new-player").css("display", "block"); 
            var newList = $("<ul>");
            for(var i = 1; i <= game.playerCount; i++){
                database.ref("game/players/player" + i).once("value").then(function(snapshot){
                    var newPlayer = $("<li>");
                    $(newPlayer).text(snapshot.val());
                    $(newList).append($(newPlayer));
                });
            }  
            $("#player-list").append($(newList));
        }
        else if(snapshot.val().gameCreated && snapshot.val().gameFull){
            $("#spectator").css("display", "block");
            var newList = $("<ul>");
            for(var i = 1; i <= game.playerCount; i++){
                database.ref("game/players/player" + i).once("value").then(function(snapshot){
                    var newPlayer = $("<li>");
                    $(newPlayer).text(snapshot.val());
                    $(newList).append($(newPlayer));
                });
            }  
            $("#player-list").append($(newList));
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
    });

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

    database.ref("game/players").on("value", function(snapshot){
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

    database.ref("game/gameStarted").on("value", function(snapshot){
        game.gameStarted = snapshot.val();
        if(game.gameStarted){
            $("#game").css("display", "block");
        }
        else{
            $("#game").css("display", "none");
        }
    });

    $("#create").on("click", function(){
        game.players.player1 = $("#name").val().trim();
        game.localPlayer = "player1";
        $("#name").val("");
        game.playerCount = $("#players").val().trim();
        $("#players").val(0);
        game.isHost = true;
        game.gameCreated = true;
        game.playerNum = 1;
        var updates = {
            players: {
                player1: game.players.player1,
                player2: game.players.player2,
                player3: game.players.player3,
                player4: game.players.player4
            },
            playerCount: game.playerCount,
            gameCreated: true,
        }
        database.ref("game/").update(updates);
        $("#new-host").css("display", "none");
        $("#current-host").css("display", "block");
    });

    $("#join").on("click", function(){
        database.ref("game/players").once("value").then(function(snapshot){
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
            $("#join-name").val("");
            database.ref("game/players").update(playerList);
            database.ref("game/gameFull").set(game.gameFull);
        });
    });

    $("#start").on("click", function(){
        game.gameStarted = true;
        database.ref("game/gameStarted").set(true);
    });

    $("#clear").on("click", function(){
        database.ref("game/").set(gameReset);
        game.reset();
    });

    $(".answer-choice").on("click", function(){
        if(game.localPlayer !== ""){
            var answer = $(this).attr("value");
            database.ref("game/answerChoices/" + game.localPlayer).set(answer);
        }
    });
});