// ------- Objet Joeur
var Joueur = function(zoneScorePlayer) {
    this.score = 0;
    this.buzz = false;
    this.authBuzz = true;
    this.zoneScorePlayer = zoneScorePlayer
}

Joueur.prototype = {
    scoreUpdate: function(points) {
        this.score = this.score + points;
        this.zoneScorePlayer.textContent = this.score;
        return this;
    },

    aBuzze: function() {
        if (this.authBuzz) {
            this.buzz = true
        }
    }

}


// ------- Objet Level

var Level = function(level, img) {
    this.level = level;
    this.img = img;
    this.displayedImg = document.getElementById("displayedImg");
    this.displayedCountDown = document.getElementById("countDown");
    this.end = 0;
    this.isPaused = false;
    this.timeAvailable = 4000;
    this.timeElapsed = 0;

    this.displayImg();
    this.interval = this.countDown(this);

}

Level.prototype = {

    displayImg: function() {
        this.displayedImg.setAttribute('src', this.img);
        return this;
    },

    endLevel: function() {
        this.end = 1;
        return this;
    },

    setTimeEnd: function() {
        this.timeEnd.setTime(this.now.getTime() + this.timeAvailable);
        return this;
    },

    clearInterval: function() {
        clearInterval(this.interval);
    },

    displayCountDown: function(text) {
        this.displayedCountDown.innerHTML = text;
    },

    countDown: function(niveau) {
        x = setInterval(function() {

            distance = niveau.timeAvailable - niveau.timeElapsed;
            if (!niveau.isPaused) {
                niveau.timeElapsed += 10;
            }

            var seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (distance < 0) {
                niveau.end = 0;
                clearInterval(x);
                niveau.displayCountDown("Vous etes des gros nazes ?");
            } else {
                niveau.displayCountDown(seconds);
            }

        }, 10)

        return (x)
    }

}




// ------- Objet Partie


var Partie = function(divStart) {
    this.joueur_1 = new Joueur(document.getElementById("scorePlayer1"));
    this.joueur_2 = new Joueur(document.getElementById("scorePlayer2"));
    this.joueurHighlight = Array();
    this.divStart = divStart;
    this.level = 0;
    this.niveau = 0;
    this.spreadsheet = "https://spreadsheets.google.com/feeds/list/1neBPd5rdfK2MvMv-iSksqSMRvBJFSjkcSRNBj8sJMko/od6/public/values?alt=json";

    this.imgs = Array();
    this.getImgs();

    $(this.divStart).on('click', this.nouveauLevel.bind(this));
    $(document).on('keydown', this.keypressActions.bind(this));
}

Partie.prototype = {

    getImgs: function() {
        var tmp = this.imgs;
        $.getJSON(this.spreadsheet, function(data) {
            for (var el in data.feed.entry) {
                tmp.push({
                    key: el,
                    value: data.feed.entry[el].gsx$imgurl.$t + " " + data.feed.entry[el].gsx$charactername.$t
                });
            }
            return null;
        });
        return this;
    },


    extractImgUrlFromDict: function() {
        var imgToExtract = this.imgs[this.level].value;
        var img;
        img = imgToExtract.substr(0, imgToExtract.indexOf(" ", 0));
        return img;
    },

    nouveauLevel: function() {

        this.playersAuthBuzz([this.joueur_1, this.joueur_2], true)
        this.resethighlightPlayer();
        this.joueur_1.buzz = this.joueur_2.buzz = false;

        // nouveau level
        if (this.niveau != 0) {
            this.niveau.clearInterval();
        }
        this.niveau = new Level(this.level, this.extractImgUrlFromDict());

        // fin du level
        this.level = this.level + 1;
    },

    highlightPlayer: function(player) {
        player.zoneScorePlayer.classList.toggle("playerHighlighted");

        return this;
    },

    resethighlightPlayer: function() {
        this.joueurHighlight.forEach(p => this.highlightPlayer(p));
        this.joueurHighlight = Array();
        return this;
    },

    scoreUp: function(player) {
        player.scoreUpdate(1)
    },

    playersAuthBuzz: function(players, state) {
        players.forEach(function(p) {
            p.authBuzz = state;
        })
    },

    keypressActions: function(e) {
        console.log("keypressActions");
        console.log(e.which);

        switch (e.which) {
            case 37: // left arrow key // score player 1
                if (this.niveau.isPaused && this.joueur_1.buzz) {
                    this.scoreUp(this.joueur_1);
                    this.nouveauLevel();
                }
                break;

            case 39: // right arrow key // score player 2
                if (this.niveau.isPaused && this.joueur_2.buzz) {
                    this.scoreUp(this.joueur_2);
                    this.nouveauLevel();
                }
                break;

            case 38: // pause
                this.niveau.isPaused = !this.niveau.isPaused;
                this.joueur_1.buzz = this.joueur_2.buzz = false;
                this.playersAuthBuzz([this.joueur_1, this.joueur_2], true);
                this.resethighlightPlayer();
                break;

            case 81: // Q key || player 1 buzzer
                if (!this.niveau.isPaused && this.joueur_1.authBuzz) {
                    this.joueur_1.buzz = true;
                    this.niveau.isPaused = !this.niveau.isPaused
                    this.playersAuthBuzz([this.joueur_1, this.joueur_2], false)
                    this.highlightPlayer(this.joueur_1);
                    this.joueurHighlight = [this.joueur_1]
                }
                break;

            case 77: // M key || player 2 buzzer
                if (!this.niveau.isPaused && this.joueur_2.authBuzz) {
                    this.joueur_2.buzz = true;
                    this.niveau.isPaused = !this.niveau.isPaused
                    this.playersAuthBuzz([this.joueur_1, this.joueur_2], false)
                    this.highlightPlayer(this.joueur_2);
                    this.joueurHighlight = [this.joueur_2];
                }
                break;

            case 13: // niveau suivant
                this.nouveauLevel();
                break;

        }

    }

}


// Initialisation de la partie

var startGameButton = document.getElementById("startGame");
var nextGameButton = document.getElementById("nextGame");
var displayedImg = document.getElementById("displayedImg");

var P = new Partie(
    divStart = document.getElementById("startGame")
);
