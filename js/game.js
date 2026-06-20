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

const directions = [
    { x: -400, y: -600, r: 90 },
    { x: 400, y: -500, r: -90 },
    { x: 0, y: -700, r: 180 }
];

let token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    if (!token) {
        window.location.href = "login.html?error=Devi essere loggato per giocare!";
        return;
    }
    await initGame();
    bindEvents();
});

async function apiFetch(url, method = 'GET', body = null) {
    return ApiRequest(url, {
        method: method,
        body: body ? JSON.stringify(body) : null
    });
}

async function initGame() {
    try {
        const response = await WithLoader(() => apiFetch('api/user/profile.php'));
        if (response.success && response.data) {
            playerFiches = parseInt(response.data.Fiches) || 0;
            if (response.data.Image) {
                $('#player-avatar').attr('src', response.data.Image);
            }
            if (playerFiches === 0) {
                toggleBetControls(true);
                noFish = true;
            } else {
                noFish = false;
            }
            await SetTable();
        } else {
            alert("Errore caricamento profilo: " + (response.error || response.message));
            window.location.href = "login.html";
        }
    } catch (e) {
        console.error(e);
        window.location.href = "login.html";
    }
}

function showOverlay() {
    $("#start-game-btn").removeClass("d-none");
    $("#overlay").removeClass("d-none");
    $("#game-container").removeClass("no-blur");
    $("#bet-input-container").removeClass("d-none");
}

function bindEvents() {
    $("#new-bet-btn").click(showOverlay);
    $("#start-game-btn").click(StartGame);
    $("#hit-btn").click(HitCard);
    $("#stand-btn").click(dealerPlay);
    $("#same-bet-btn").click(() => StartGame());
    $("#return-home-btn").click(() => window.location.href = "index.html");
    $("#double-btn").click(DoubleBet);
    $("#session-end").click(async () => {
        await SaveSessionGame();
        setTimeout(() => {
            const params = new URLSearchParams({ message: "Partita registrata nelle statistiche con successo !" });
            window.location.href = "index.html?" + params.toString();
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

async function SetTable() {
    try {
        const data = await WithLoader(() => ApiRequest('api/game/levels.php'));
        if (data.success) {
            data.data.forEach(table => {
                if (playerFiches >= table.MinFiches) {
                    $("#current-table").text(table.Name);
                    $(".bg-game").css({
                        background: "url(" + table.ImagePath + ") no-repeat center center fixed",
                        "background-size": "cover"
                    });
                }
            });
        }
    } catch (e) {
        console.error(e);
        if (typeof ShowAlert === 'function') ShowAlert(e.message || "Errore nel caricamento dei tavoli", "danger");
    }
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

async function SaveSessionGame() {
    if (sessionSaved) return;
    sessionSaved = true;

    if (totalWinGame + totalDrawGame + totalLoseGame != 0) {
        const finalScore = playerFiches;
        const difference = finalScore - initialplayerFiches;
        let message = difference >= 0 ? `VINCITA: ${difference}` : `PERDITA: ${Math.abs(difference)}`;

        const data = {
            totalWins: totalWinGame,
            totalLosses: totalLoseGame,
            totalDraws: totalDrawGame,
            message: message
        };

        try {
            const response = await WithLoader(() => apiFetch('api/game/save_game.php', 'POST', data));
            if (response.success) {
                totalWinGame = 0;
                totalDrawGame = 0;
                totalLoseGame = 0;
            }
        } catch(e) {
            console.error(e);
            if (typeof ShowAlert === 'function') ShowAlert(e.message || "Errore nel salvataggio della sessione", "danger");
        }
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
}

function StartCardAnimation(card) {
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

async function UpdateScore(message, color, result = null) {
    if (color) $("#score").css("color", color);

    let dataToSend = { Bet: Bet, result: result };
    try {
        const data = await WithLoader(() => apiFetch('api/game/update_score.php', 'POST', dataToSend));
        
        if (!data.success) {
            alert("Errore server: " + (data.error || data.message));
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
        playerFiches = data.data && data.data.Fiches !== undefined ? data.data.Fiches : data.Fiches || playerFiches;
        noFish = (playerFiches == 0);
        
        $("#profit-text").html(`<h2>Punteggio aggiornato : <span id='profit'>${playerFiches}</span></h2>`);
        $("#score").css("color", color);
        $("#profit").css("color", color);

        RevealHiddenCard();

        let type = (result === "win" || result === "double-win") ? "win" : 
                   (result === "danger" || result === "double-danger") ? "danger" : "draw";

        if (typeof ShowAlert === 'function') ShowAlert(message, type);
        else alert(message);

        await CheckLvlTable(beforeFish);
        endGame();
    } catch(e) {
        console.error(e);
        if (typeof ShowAlert === 'function') ShowAlert(e.message || "Errore durante l'aggiornamento del punteggio", "danger");
    }
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

async function CheckLvlTable(beforeFish) {
    try {
        const data = await WithLoader(() => ApiRequest('api/game/levels.php'));
        
        if (!data.success) {
            console.error("Errore nel recupero livelli: " + (data.error || data.message));
            return;
        }

        let levels = data.data;
        levels.sort((a, b) => parseInt(a.MinFiches) - parseInt(b.MinFiches));

        let oldLevelIndex = getLevelByFish(beforeFish, levels);
        let newLevelIndex = getLevelByFish(playerFiches, levels);

        let levelData = levels[newLevelIndex];
        if (!levelData) return;

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
        }

        if (newLevelIndex !== oldLevelIndex) {
            await apiFetch('api/game/update_lvl.php', 'POST', {
                newLevel: newLevelIndex,
                oldLevel: oldLevelIndex
            });
        }
    } catch(e) {
        console.error(e);
        if (typeof ShowAlert === 'function') ShowAlert(e.message || "Errore nel controllo del livello", "danger");
    }
}

function endGame() {
    gameInProgress = false;
    $("#alert-end-game").remove();
    showActions();
    $(".fly-in").removeClass("fly-in");
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

async function StartGame() {
    let betValue = parseInt($("#bet-input").val());
    try {
        const data = await WithLoader(() => apiFetch('api/user/profile.php'));
        if (!data.success) {
            if (typeof ShowAlert === 'function') ShowAlert("Errore: " + (data.error || data.message), "danger");
            return;
        }

        let userData = data.data;
        initialplayerFiches = userData.Fiches;
        hideAll();

        if (userData.Fiches > 0) {
            if (isNaN(betValue) || betValue <= 0) {
                if (typeof ShowAlert === 'function') ShowAlert("Devi inserire un valore di scommessa valido", "danger");
                showOverlay();
                return;
            }
            if (betValue > userData.Fiches) {
                if (typeof ShowAlert === 'function') ShowAlert("Non puoi scommettere più di ciò che possiedi, in questo momento possiedi " + userData.Fiches + " Punti", "danger");
                showOverlay();
                return;
            }
            noFish = false;
        } else {
            $("#bet-input").val(32);
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

    } catch (e) {
        console.error(e);
        if (typeof ShowAlert === 'function') ShowAlert(e.message || "Errore durante l'avvio della partita", "danger");
    }
}

function CardAlreadyDrawn(card) {
    return drawnCards.some(c =>
        c.suit === card.suit && c.value === card.value
    );
}
