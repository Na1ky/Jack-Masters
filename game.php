<?php
include_once("php/database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (isset($_SESSION["sessionId"])) {
    try {
        $connectionn = OpenDbConnection("blackjack");
        $currentTime = time();
        if ($currentTime > $_SESSION["expired"] && isset($_SESSION["sessionId"])) {
            DeleteSession($connectionn, $_SESSION["sessionId"]);
            session_unset();
            session_destroy();
            header("Location: index.php?error=Sessione scaduta");
            exit;
        }
        $player = GetPlayer($connectionn, $_SESSION["sessionId"]);
    } catch (Exception $ex) {
        header("Location: index.php?error=" . $ex->getMessage());
    } finally {
        CloseDbConnection($connectionn);
    }
} else {
    header("Location: login.php?error=Devi essere loggato per giocare!");
    exit;
}
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Meta description for search engines and social media -->
    <meta name="description" content="Blackjack è un popolare gioco di carte." />
    <meta name="keywords" content="Blackjack, gioco di carte, casinò, divertimento" />
    <meta name="author" content="Il tuo nome o azienda" />

    <!-- Open Graph -->
    <meta property="og:title" content="BLACKJACK - Login" />
    <meta property="og:description" content="Blackjack è un popolare gioco di carte. Accedi per iniziare a giocare e divertirti." />
    <meta property="og:image" content="img/logo.ico" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="it_IT" />

    <title>BLACKJACK - GIOCO</title>
    <link href="img/logo.png" rel="icon" type="image/x-icon" />

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

    <!-- JQuery -->
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>

    <!-- Custom -->
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/game.css" />
    <script src="js/script.js" type="application/javascript"></script>
    <script src="js/game.js" type="application/javascript"></script>
</head>

<body>

    <!-- Initial loader -->
    <div class="loader">
        <img id="img-loader" src="img/loader.gif" alt="Caricamento...">
    </div>
    <!-- System messages -->
    <section class="container">
        <?php if (isset($_GET["message"])): ?>
            <script>
                ShowAlert(<?= json_encode($_GET["message"]) ?>, "info");
            </script>
        <?php elseif (isset($_GET["error"])): ?>
            <script>
                ShowAlert(<?= json_encode($_GET["error"]) ?>, "danger");
            </script>
        <?php endif; ?>
    </section>

    <div id="level-overlay" class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 d-none" style="z-index: 1050;"></div>
    <div id="level-message" class="position-fixed top-50 start-50 translate-middle rounded-3 text-center text-white fw-semibold px-4 py-3 shadow-lg d-none p-5">
        <span class="message-text"></span>
    </div>

    <main class="bg-game"
        data-fiches="<?= htmlspecialchars($player["Fiches"]) ?>"
        data-playerCards='<?= htmlspecialchars(json_encode($_SESSION['playerCards'] ?? [])) ?>'
        data-dealerCards='<?= htmlspecialchars(json_encode($_SESSION['dealerCards'] ?? [])) ?>'
        data-Bet='<?=$_SESSION['Bet'] ?>'>
        <!-- Bet Overlay -->
        <div id="overlay" class="d-flex flex-column justify-content-center align-items-center p-3 text-center" style="min-height: 100vh;">
            <div class="bet-input-container mb-4">
                <h2 class="text-center mb-3" id="current-table" style="color: gold; font-weight: bold; text-shadow: 1px 1px 4px black;"></h2>
                <h5 class="text-white text-center mb-2">
                    Punti correnti: <span style="color: gold;" id="current-score"><?= $player["Fiches"] ?></span>
                </h5>
                <label for="bet-input" class="form-label text-white fs-5" id="lbl-bet">Inserisci la tua puntata</label>
                <input type="number" id="bet-input" class="form-control-lg text-center" min="1">
            </div>

            <div id="bet-btn" class="d-flex flex-wrap justify-content-center gap-2 mb-4">
                <button class="bet-option bet-option-10" data-bet="10">10</button>
                <button class="bet-option bet-option-50" data-bet="50">50</button>
                <button class="bet-option bet-option-100" data-bet="100">100</button>
                <button class="bet-option bet-option-500" data-bet="500">500</button>
                <button class="bet-option bet-option-max" data-bet="max">MAX</button>
            </div>

            <div class="d-flex flex-column flex-md-row justify-content-center gap-3">
                <button id="start-game-btn">Inizia Partita</button>
                <button id="return-home-btn">Torna alla home</button>
            </div>
        </div>

        <!-- Game -->
        <section class="game-container pt-5 ps-2 pe-2" id="game-container">
            <!-- Dealer -->
            <div id="dealer-cards" class="mb-4">
                <h3 class="text-light mb-3">Carte del Banco</h3>
                <div class="card-row" id="dealer"></div>
            </div>

            <!-- Player -->
            <div id="player-cards" class="mb-5">
                <h3 class="text-light mb-3">Le Tue Carte</h3>
                <div class="card-row" id="player"></div>
            </div>

            <!-- Profile -->
            <div id="profile-image" class="d-none d-lg-block">
                <?php
                echo "<img src='" . $player["Image"] . "' alt='Immagine Profilo' class='rounded-circle' width='150'>";
                ?>
            </div>

            <!-- Score + btn -->
            <div class="row p-5 justify-content-between align-items-center">
                <div class="col-lg-6 col-12 d-flex flex-column justify-content-lg-start mb-3">
                    <h2 class="text-light text-lg-start text-center" id="profit-text">
                        Punti disponibili: <span id="profit" style="color: gold;">0</span>
                    </h2>
                    <h2 class="text-light text-lg-start text-center" id="score-text">
                        Puntata attuale: <span id="score" style="color: gold;">0</span>
                    </h2>
                </div>
                <div class="col-lg-6 col-12 d-flex justify-content-lg-end justify-content-center mb-3">
                    <button id="hit-btn" class="btn btn-success btn-lg d-none">Chiedi carta</button>
                    <button id="double-btn" class="btn btn-warning btn-lg ms-3 d-none">Raddoppia</button>
                    <button id="stand-btn" class="btn btn-danger btn-lg ms-3 d-none">Stai</button>
                    <button id="same-bet-btn" class="btn btn-primary btn-lg d-none">Stessa puntata</button>
                    <button id="new-bet-btn" class="btn btn-secondary btn-lg ms-3 d-none">Nuova puntata</button>
                    <button id="session-end" class="btn btn-success btn-lg ms-3 d-none">Fine sessione</button>
                </div>
            </div>
        </section>
    </main>
</body>

</html>