const suits = ["hearts", "clubs", "diamonds", "spades"];
const cardPath = "img/cards/";

let playerFiches;
let noFish = false;
let playerCards = [];
let dealerCards = [];
let drawnCards = [];
let Bet;

let gameInProgress = false;
let dealerHiddenCard = null;

let initialplayerFiches = null;
let sessionSaved = false;

let totalWinGame = 0;
let totalLoseGame = 0;
let totalDrawGame = 0;
let finalResults;

const directions = [
    { x: -400, y: -600, r: 90 },
    { x: 400, y: -500, r: -90 },
    { x: 0, y: -700, r: 180 }
];

$(() => {
    ShowHideLoader();
    initGame();
    bindEvents();

    let player = JSON.parse($("main").attr("data-playerCards"));
    let dealer = JSON.parse($("main").attr("data-dealerCards"));
    let bet = $("main").attr("data-Bet");
    Bet = bet;
    if (player.length > 0 && dealer.length > 0 && bet > 0) {
        player.forEach(card => {
            playerCards.push(card);
            drawnCards.push(card);
        });
        dealer.forEach(card => {
            dealerCards.push(card);
            drawnCards.push(card);
        })
        ResumeGame();
    }
});

function initGame() {
    playerFiches = parseInt($("main").attr("data-fiches")) || 0;
    if (playerFiches === 0) {
        toggleBetControls(true);
        noFish = true;
    }
    noFish = false;
    SetTable();
}

function bindEvents() {
    $("#new-bet-btn").click(showOverlay);
    $("#start-game-btn").click(StartGame);
    $("#hit-btn").click(HitCard);
    $("#stand-btn").click(dealerPlay);
    $("#same-bet-btn").click(() => StartGame());
    $("#return-home-btn").click(() => window.location.href = "index.php");
    $("#double-btn").click(DoubleBet);
    $("#session-end").click(() => {
        SaveSessionGame();
        setTimeout(() => {
            const params = new URLSearchParams({ message: "Partita registrata nelle statistiche con successo !" });
            window.location.href = "index.php?" + params.toString();
        }, 500);
    });
    $(".bet-option").click(handleBetOption);
}

function toggleBetControls(hide) {
    ["#lbl-bet", "#bet-input", "#bet-btn"].forEach(sel => $(sel).toggleClass("d-none", hide));
}

function handleBetOption() {
    let currentVal = parseInt($("#bet-input").val()) || 0;
    const value = $(this).data("bet");
    if (value !== "max") {
        const newVal = currentVal + parseInt(value);
        $("#bet-input").val(Math.min(newVal, playerFiches));
    } else {
        $("#bet-input").val(playerFiches);
    }
}
function SetTable() {
    ShowHideLoader();
    let request = SendRequest("get", "php/get_levels.php");
    request.done((response) => {
        ShowHideLoader();
        if (response.success) {
            response.data.forEach(table => {
                if (playerFiches >= table.MinFiches) {
                    $("#current-table").text(table.Name);
                    $(".bg-game").css({
                        background: "url(" + table.ImagePath + ") no-repeat center center fixed",
                        "background-size": "cover"
                    });
                }
            });
        } else {
            alert("Errore: " + response.error);
        }
    });
    request.fail(error);
}
function showLevelMessage(text) {
    const message = document.getElementById("level-message");
    const overlay = document.getElementById("level-overlay");

    message.querySelector(".message-text").textContent = text;
    overlay.classList.remove("d-none");
    message.classList.remove("d-none");

    setTimeout(() => {
        overlay.classList.add("d-none");
        message.classList.add("d-none");
    }, 4000);
}
function SaveSessionGame() {
    if (sessionSaved)
        return;
    sessionSaved = true;

    if (totalWinGame + totalDrawGame + totalLoseGame != 0) {
        const finalScore = playerFiches;
        const difference = finalScore - initialplayerFiches;
        let message;

        if (difference >= 0) {
            message = `VINCITA: ${difference}`;
        } else {
            message = `PERDITA: ${Math.abs(difference)}`;
        }

        const data = {
            totalWins: totalWinGame,
            totalLosses: totalLoseGame,
            totalDraws: totalDrawGame,
            message: message
        };

        ShowHideLoader();
        let request = SendRequest("post", "php/save_game.php", data);
        request.done((response) => {
            ShowHideLoader();
            if (response.success) {
                totalWinGame = 0;
                totalDrawGame = 0;
                totalLoseGame = 0;
            } else {
                alert("Errore: " + response.error);
            }
        });

        request.fail((jqXHR) => {
            ShowHideLoader();
            error(jqXHR);
        });
    }
}
function DrawCard(who, hidden = false) {
    if (playerCards.length == 2) {
        $("#double-btn").prop("disabled", true);
    }
    let card;
    do {
        card = {
            cardId: null,
            suit: suits[Math.floor(Math.random() * suits.length)],
            value: Math.floor(Math.random() * 13) + 1
        };
    } while (CardAlreadyDrawn(card));

    drawnCards.push(card);

    if (who === "player") {
        playerCards.push(card);
    } else {
        dealerCards.push(card);
    }

    let cardName = GetCardName(card);

    let cardHtml;
    if (who === "dealer" && hidden) {
        dealerHiddenCard = card;
        card.cardId = "hidden-card";
        cardHtml = `<div class="card back fly-in" id="${card.cardId}"><img src='${cardPath}carta_coperta.png'></div>`;
    } else {
        card.cardId = `card-${drawnCards.length}`;
        cardHtml = `<div class="card ${card.suit} fly-in" id="${card.cardId}"><img src='${cardPath}${cardName}_of_${card.suit}.png'></div>`;
    }

    if (who === "player") {
        $("#player").append(cardHtml);
    } else {
        $("#dealer").append(cardHtml);
    }

    StartCardAnimation(card);
    let request = SendRequest("post", "php/save_hand.php", { player: playerCards, dealer: dealerCards, bet: Bet, initialFiches: initialplayerFiches });
    request.fail();
}
function AnimateCard(cardId) {
    const card = document.getElementById(cardId);
    const rand = directions[Math.floor(Math.random() * directions.length)];

    card.style.transition = "none";
    card.style.transform = `translateX(${rand.x}px) translateY(${rand.y}px) rotateX(${rand.r}deg)`;
    card.style.opacity = "0";

    setTimeout(() => {
        card.style.transition = "transform 0.6s ease, opacity 0.6s ease";
        card.style.transform = "translateX(0) translateY(0) rotateX(0)";
        card.style.opacity = "1";
    }, 50);

    setTimeout(() => {
        card.style.transition = "";
        card.style.transform = "";
        card.style.opacity = "";
    }, 700);
}
function GetCardName(card) {
    switch (parseInt(card.value)) {
        case 1: return "ace";
        case 11: return "jack";
        case 12: return "queen";
        case 13: return "king";
        default: return card.value;
    }
}
function CalculateSum(cards) {
    let sum = 0, aces = 0;
    cards.forEach(({ value }) => {
        if (value > 10) {
            sum += 10;
        } else if (value === 1) {
            aces++;
            sum += 11;
        } else {
            sum += value;
        }
    });

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }

    return sum;
}
function HitCard() {
    if (!gameInProgress) return;
    DrawCard("player");
    let sum = CalculateSum(playerCards);
    if (sum > 21) {
        UpdateScore("Hai fatto più di 21, Hai perso!", "red", "danger");
    }
}
function dealerPlay() {
    if (!gameInProgress) return;

    RevealHiddenCard();

    let dealerSum = CalculateSum(dealerCards);
    let playerSum = CalculateSum(playerCards);

    while (true) {
        if (dealerSum < 17) {
            DrawCard("dealer");
            dealerSum = CalculateSum(dealerCards);
        } else if (dealerSum < playerSum) {
            if (Math.random() < 0.5) {
                DrawCard("dealer");
                dealerSum = CalculateSum(dealerCards);
            } else {
                break;
            }
        } else {
            break;
        }
    }

    CheckWinner(playerSum, dealerSum);
}
function RevealHiddenCard() {
    if (dealerHiddenCard) {
        let name = GetCardName(dealerHiddenCard);
        $("#hidden-card").replaceWith(
            `<div class="card ${dealerHiddenCard.suit} animated">
                <img src='${cardPath}${name}_of_${dealerHiddenCard.suit}.png'>
            </div>`
        );
        dealerHiddenCard = null;
    }
}
function CheckWinner(player, dealer) {
    if (dealer > 21 || player > dealer) {
        UpdateScore("Il banco ha fatto " + dealer + ", Hai vinto!", "lightgreen", "win");
    } else if (player < dealer) {
        UpdateScore("Il banco ha fatto " + dealer + ", Hai perso!", "red", "danger");
    } else {
        UpdateScore("Pareggio!", "orange", "draw");
    }
}
function UpdateScore(message, color, result = null) {
    if (color)
        $("#score").css("color", color);

    let dataToSend = { Bet: Bet, result: result };
    ShowHideLoader();
    let request = SendRequest("post", "php/update_score.php", dataToSend);

    request.done((data) => {
        ShowHideLoader();
        if (!data.success) {
            alert("Errore server: " + data.error);
            return;
        }
        if (result === "win") {
            Bet = Bet * 2;
            $("#score-text").html(`<h2>Totale vincita: <span id="score">${Bet}</span></h2>`);
            totalWinGame += 1;
        } else if (result === "double-win") {
            Bet = Bet * 4;
            $("#score-text").html(`<h2>Totale vincita: <span id="score">${Bet}</span></h2>`);
            totalWinGame += 1;
        } else if (result === "double-danger") {
            $("#score-text").html(`<h2>Totale perdita: <span id="score">${playerFiches == 0 ? 0 : Bet * 2}</span></h2>`);
            totalLoseGame += 1;
        } else if (result === "danger") {
            $("#score-text").html(`<h2>Totale perdita: <span id="score">${playerFiches == 0 ? 0 : Bet}</span></h2>`);
            totalLoseGame += 1;
        } else if (result === "draw") {
            $("#score-text").html(`<h2>Punti restituiti: <span id="score">${Bet}</span></h2>`);
            totalDrawGame += 1;
        }

        let beforeFish = playerFiches;
        playerFiches = data.Fiches;
        if (playerFiches != 0)
            noFish = false;
        else
            noFish = true;
        $("#profit-text").html(`<h2>Punteggio aggiornato : <span id='profit'>${playerFiches}</span></h2>`);
        $("#score").css("color", color);
        $("#profit").css("color", color);

        RevealHiddenCard();

        let type;
        if (result === "win" || result === "double-win") {
            type = "win";
        } else if (result === "danger" || result === "double-danger") {
            type = "danger";
        } else {
            type = "draw";
        }

        ShowAlert(message, type);
        CheckLvlTable(beforeFish);
        endGame();
    });

    request.fail((jqXHR) => {
        ShowHideLoader();
        error(jqXHR);
    });
}
function getLevelByFish(fish, levels) {
    let levelIndex = 0;
    for (let i = 0; i < levels.length; i++) {
        if (fish >= parseInt(levels[i].MinFiches)) {
            levelIndex = i;
        } else {
            break;
        }
    }
    return levelIndex;
}
function CheckLvlTable(beforeFish) {
    ShowHideLoader();
    let request = SendRequest("get", "php/get_levels.php");

    request.done((response) => {
        ShowHideLoader();
        if (!response.success) {
            console.error("Errore nel recupero livelli: " + response.error);
            return;
        }

        let levels = response.data;
        levels.sort((a, b) => parseInt(a.MinFiches) - parseInt(b.MinFiches));

        let oldLevelIndex = getLevelByFish(beforeFish, levels);
        let newLevelIndex = getLevelByFish(playerFiches, levels);

        let levelData = levels[newLevelIndex];
        if (!levelData) {
            console.error("Livello non trovato.");
            return;
        }

        let tableName = levelData.Name;
        let bgUrl = levelData.ImagePath;

        $("#current-table").text(tableName);
        $(".bg-game").css({
            background: `url('${bgUrl}') no-repeat center center fixed`,
            "background-size": "cover"
        });

        if (newLevelIndex > oldLevelIndex) {
            showLevelMessage("Hai sbloccato " + tableName + "!");
        } else if (newLevelIndex < oldLevelIndex) {
            showLevelMessage("Sei tornato a " + tableName);
        } else {
            return;
        }

        let updateRequest = SendRequest("post", "php/update_lvl.php", {
            newLevel: newLevelIndex,
            oldLevel: oldLevelIndex
        });

        updateRequest.fail(error);
    });

    request.fail(error);
}

function endGame() {
    let request = SendRequest("post", "php/save_hand.php", { "endGame": true });
    request.done(() => {
        gameInProgress = false;
        $("#alert-end-game").remove();
        showActions();
        $(".fly-in").removeClass("fly-in");
    })
    request.fail();
}
function showActions() {
    if (noFish) {
        $("#same-bet-btn").text("Punta 32");
        $("#new-bet-btn").text("Indietro");
    } else {
        $("#same-bet-btn").text("Stessa puntata");
        $("#new-bet-btn").text("Nuova puntata");
    }
    $("#same-bet-btn, #session-end, #new-bet-btn").removeClass("d-none");
    $("#hit-btn, #stand-btn, #double-btn").addClass("d-none");
}
function hideActions() {
    $("#same-bet-btn, #session-end, #new-bet-btn").addClass("d-none");
    $("#hit-btn, #stand-btn, #double-btn").removeClass("d-none");
}
function hideAll() {
    $("#hit-btn, #stand-btn").addClass("d-none");
    $("#same-bet-btn, #session-end, #new-bet-btn").addClass("d-none");
}
function DoubleBet() {
    if (!gameInProgress) return;

    DrawCard("player");

    let sum = CalculateSum(playerCards);

    if (sum > 21) {
        UpdateScore("Hai sballato dopo il raddoppio, hai perso il doppio!", "red", "double-danger");
        return;
    }

    RevealHiddenCard();

    let dealerSum = CalculateSum(dealerCards);
    while (dealerSum < 17) {
        DrawCard("dealer");
        dealerSum = CalculateSum(dealerCards);
    }

    if (dealerSum > 21 || sum > dealerSum) {
        UpdateScore("Hai vinto col raddoppio! Guadagni il doppio!", "lightgreen", "double-win");
    } else if (sum < dealerSum) {
        UpdateScore("Hai perso col raddoppio! Perdi il doppio!", "red", "double-danger");
    } else {
        UpdateScore("Pareggio!", "orange", "draw");
    }

    gameInProgress = false;
    showActions();
}
function ResumeGame() {
    if (playerCards.length == 2) {
        $("#double-btn").prop("disabled", true);
    }
    $("#player, #dealer").empty();
    $("#start-game-btn").addClass("d-none");
    $("#overlay").addClass("d-none");
    $("#game-container").addClass("no-blur");
    $("#bet-input-container").addClass("d-none");
    $("#double-btn").attr("disabled", false);
    gameInProgress = true;

    let results = SendRequest("GET", "php/get_user.php");
    results.done((data) => {
        initialplayerFiches = data.data.Fiches;
        $("#profit-text").html(`<h2>Punti disponibili: <span id='profit'>${playerFiches}</span></h2>`);
        $("#score-text").html(`<h2>Puntata attuale: <span id="score">${Bet}</span></h2>`);
        hideActions();      
        playerCards.forEach(card => {
            let cardName = GetCardName(card);
            const imgSrc = `${cardPath}${cardName}_of_${card.suit}.png`;
            const cardDiv = `<div class="card ${card.suit} fly-in" id="${card.cardId}">
                                <img src="${imgSrc}" alt="${cardName} of ${card.suit}">
                             </div>`;
            $("#player").append(cardDiv);
            StartCardAnimation(card);
        });
        dealerCards.forEach(card => {
            let cardName = GetCardName(card);
            let cardDiv;

            if (card.cardId === "hidden-card") {
                dealerHiddenCard = card;
                cardDiv = `<div class="card back fly-in" id="${card.cardId}">
                               <img src='${cardPath}carta_coperta.png' alt="Hidden card">
                           </div>`;
            } else {
                const imgSrc = `${cardPath}${cardName}_of_${card.suit}.png`;
                cardDiv = `<div class="card ${card.suit} fly-in" id="${card.cardId}">
                               <img src="${imgSrc}" alt="${cardName} of ${card.suit}">
                           </div>`;
            }
            $("#dealer").append(cardDiv);
            StartCardAnimation(card);
        });
    })
    results.fail(error);
}

function StartCardAnimation(card) {
    const cardElem = document.getElementById(card.cardId);
    void cardElem.offsetWidth;

    setTimeout(() => {
        const cardElem = document.getElementById(card.cardId);
        if (cardElem) {
            void cardElem.offsetWidth;
            setTimeout(() => {
                cardElem.classList.remove("fly-in");
            }, 200);
        }
    }, 0);
}
function StartGame() {
    let betValue = parseInt($("#bet-input").val());
    ShowHideLoader();
    let results = SendRequest("GET", "php/get_user.php");
    results.done((data) => {
        ShowHideLoader();
        if (!data.success) {
            ShowAlert("Errore: " + data.error, "danger");
            return;
        }

        let userData = data.data;

        initialplayerFiches = userData.Fiches;
        hideAll();
        if (userData.Fiches > 0) {
            if (isNaN(betValue) || betValue <= 0) {
                ShowAlert("Devi inserire un valore di scommessa valido", "danger");
                showOverlay();
                return;
            }
            if (betValue > userData.Fiches) {
                ShowAlert("Non puoi scommettere più di ciò che possiedi, in questo momento possiedi " + userData.Fiches + " Punti", "danger");
                showOverlay();
                return;
            }

            noFish = false;
        } else {
            $("#bet-input").val(32)
            betValue = 32;
            noFish = true;
        }
        Bet = betValue;
        $("#profit-text").html(`<h2>Punti disponibili: <span id='profit'>${playerFiches}</span></h2>`);
        $("#score-text").html(`<h2>Puntata attuale: <span id="score">${Bet}</span></h2>`);
        playerCards = [];
        dealerCards = [];
        drawnCards = [];
        dealerHiddenCard = null;
        gameInProgress = false;

        $("#player, #dealer").empty();
        $("#start-game-btn").addClass("d-none");
        $("#overlay").addClass("d-none");
        $("#game-container").addClass("no-blur");
        $("#bet-input-container").addClass("d-none");
        $("#double-btn").attr("disabled", false);
        gameInProgress = true;

        const cardsToDraw = [
            ["dealer", true],
            ["player", false],
            ["dealer", false],
            ["player", false]
        ];

        cardsToDraw.forEach((params, index) => {
            setTimeout(() => {
                DrawCard(params[0], params[1]);
            }, index * 800);
        });
        setTimeout(() => {
            hideActions();
        }, 3200);
        $("#score").css("color", "white");
        $("#profit").css("color", "white");
        setTimeout(() => {
            let playerSum = CalculateSum(playerCards);
            if (playerSum === 21) {
                UpdateScore("Hai fatto Blackjack! Hai vinto!", "lightgreen", "win");
            }
        }, 3300);

    });
    results.fail(error);
}
function showOverlay() {
    $("#start-game-btn").removeClass("d-none");
    $("#overlay").removeClass("d-none");
    $("#game-container").removeClass("no-blur");
    $("#bet-input-container").removeClass("d-none");
    $("#current-score").text(playerFiches);
    if (playerFiches != 0)
        ["#lbl-bet", "#bet-input", "#bet-btn"].forEach(sel => $(sel).removeClass("d-none"));
    else
        toggleBetControls(true);
}
function CardAlreadyDrawn(card) {
    return drawnCards.some(c =>
        c.suit === card.suit && c.value === card.value
    );
}
