<?php
session_start();
require_once "php/database_management.php";
try {
    $connectionn = OpenDbConnection("blackjack");
    $currentTime = time();
    if (isset($_SESSION["expired"]) && $currentTime > $_SESSION["expired"] && isset($_SESSION["sessionId"])) {
        DeleteSession($connectionn, $_SESSION["sessionId"]);
        session_unset();
        session_destroy();
        header("Location: classification.php?error=Sessione scaduta");
        exit;
    }
    if (isset($_SESSION["sessionId"]))
        $player = GetPlayer($connectionn, $_SESSION["sessionId"]);
} catch (Exception $ex) {
    header("Location: classification.php?error=Errore: " . $ex->getMessage());
} finally {
    CloseDbConnection($connectionn);
}
?>
<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Meta description for search engines and social media -->
    <meta name="description" content="Blackjack è un gioco di carte popolare. Scopri la classifica!">
    <meta name="keywords" content="Blackjack, gioco di carte, casinò, divertimento">

    <!-- Open Graph -->
    <meta property="og:title" content="BLACKJACK - Home">
    <meta property="og:description" content="Blackjack è un gioco di carte popolare. Scopri la classifica!">
    <meta property="og:image" content="img/logo.ico">
    <meta property="og:type" content="website">
    <meta name="language" content="it">

    <title>BLACKJACK - Classifica</title>
    <link rel="icon" href="img/logo.png" type="image/x-icon">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.dataTables.min.css" />
    
    <!-- JQuery -->
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/classification.css">
    <script src="js/script.js"></script>
    <script src="js/classification.js"></script>

</head>

<body class="text-light">
    <!-- Initial loader -->
    <div class="loader">
        <img id="img-loader" src="img/loader.gif" alt="Caricamento...">
    </div>

    <!-- System messages -->
    <section class="container">
        <?php if (isset($_GET["message"])): ?>
            <script>
                ShowAlert(<?=json_encode($_GET["message"]) ?>, "info");
            </script>
        <?php elseif (isset($_GET["error"])): ?>
            <script>
                ShowAlert(<?=json_encode($_GET["error"]) ?>, "danger");
            </script>
        <?php endif; ?>
    </section>

    <header>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark py-3">
            <div class="container">
                <a class="navbar-brand d-flex align-items-center gap-2" href="index.php">
                    <img src="img/logo.png" alt="Logo Blackjack" width="32" height="32" />
                    <span class="site-title">BLACK JACK</span>
                </a>

                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent"
                    aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarContent">
                    <ul class="navbar-nav ms-auto align-items-center gap-3">
                        <li class="nav-item"><a class="nav-link" href="index.php">Home</a></li>
                        <li class="nav-item"><a class="nav-link" href="game.php">Gioca</a></li>
                        <li class="nav-item"><a class="nav-link" href="classification.php">Classifica</a></li>
                        <?php if (!isset($_SESSION["sessionId"])): ?>
                            <li class="nav-item">
                                <a class="btn btn-outline-success btn-sm px-3" href="login.php">Accedi</a>
                            </li>
                            <li class="nav-item">
                                <a class="btn btn-success btn-sm px-3" href="register.php">Registrati</a>
                            </li>
                        <?php else: ?>
                            <li class="nav-item"><a class="nav-link" href="profile.php?Username=<?= $player['Username'] ?>">Statistiche</a></li>
                            <li class="nav-item d-flex align-items-center gap-2">
                                <img
                                    id="navbarAvatar"
                                    class="navbar-avatar"
                                    src="<?= $player["Image"] ?>"
                                    alt="Avatar utente" />
                                <a href="php/logout.php" class="btn btn-danger btn-sm px-3">Esci</a>
                            </li>
                        <?php endif; ?>

                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <!-- Player table -->
    <main class="py-5">
        <div class="container-lg my-5">
            <h1 class="text-center mb-4" id="title">Classifica Giocatori</h1>
            <div class="table-container">
                <div class="table-responsive">
                    <table id="players-table" class="table table-dark table-hover table-bordered w-100">
                        <thead>
                            <tr>
                                <th>Posizione</th>
                                <th>Giocatore</th>
                                <th>Punteggio</th>
                                <th>Tavolo Corrente</th>
                                <th>Tavolo Più Alto</th>
                                <th>Avatar</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
    </main>

    <footer class="text-center mt-5">
        <div class="container">
            <p>© 2025 Blackjack Game - Tutti i diritti riservati</p>
            <p>
                <a href="pdf/privacy.pdf" class="text-light text-decoration-none me-3">Privacy</a>
                <a href="pdf/contacts.pdf" class="text-light text-decoration-none">Contattaci</a>
            </p>
        </div>
    </footer>
    <script src="https://cdn.datatables.net/1.13.4/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.4/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js"></script>
</body>

</html>