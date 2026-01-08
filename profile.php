<?php
include_once("php/database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!isset($_GET["Username"])) {
    header("Location: index.php?error=Bisogna specificare il giocatore");
    exit;
}
try {
    $connectionn = OpenDbConnection("blackjack");
    $currentTime = time();
    if (isset($_SESSION["sessionId"])) {
        if (isset($_SESSION["expired"]) && $currentTime > $_SESSION["expired"] && isset($_SESSION["sessionId"])) {
            DeleteSession($connectionn, $_SESSION["sessionId"]);
            session_unset();
            session_destroy();
            header("Location: index.php?error=Sessione scaduta");
            exit;
        }
        $mainPlayer = GetPlayer($connectionn, $_SESSION["sessionId"]);
    }
    $player = GetPlayerFromUsername($connectionn, $_GET["Username"]);
    $user = GetUser($connectionn, $player["Username"]);
    $currentTable = GetFromLvlTable($connectionn, $player["Lvl"]);
    $topTable = GetFromLvlTable($connectionn, $player["TopLevel"]);
    $games = array_reverse(GetAllGames($connectionn, $_GET["Username"]));
    $totalWin = GetAllWin($connectionn, $_GET["Username"]);
    $totalLose = GetAllLose($connectionn, $_GET["Username"]);
} catch (Exception $ex) {
    header("Location: index.php?error=" . $ex->getMessage());
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
    <meta name="description" content="Blackjack è un gioco di carte popolare. Ecco le tue statistiche">
    <meta name="keywords" content="Blackjack, gioco di carte, casinò, divertimento">

    <!-- Open Graph -->
    <meta property="og:title" content="BLACKJACK - Home">
    <meta property="og:description" content="Blackjack è un gioco di carte popolare. Ecco le tue statistiche">
    <meta property="og:image" content="img/logo.ico">
    <meta property="og:type" content="website">
    
    <meta name="language" content="it">
    <title>BLACKJACK - Home</title>
    <link rel="icon" href="img/logo.png" type="image/x-icon">
    
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.4/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.dataTables.min.css" />
    
    <!-- JQuery -->
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    
    <!-- Custom -->
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/profile.css">
    <script src="js/script.js" type="application/javascript"></script>
    <script src="js/profile.js" type="application/javascript"></script>

</head>

<body class="text-light">
    <!-- Initial loader -->
    <div class="loader">
        <img id="img-loader" src="img/loader.gif" alt="Caricamento...">
    </div>
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
                            <li class="nav-item"><a class="nav-link" href="profile.php?Username=<?= $mainPlayer['Username'] ?>">Statistiche</a></li>
                            <li class="nav-item d-flex align-items-center gap-2">
                                <img
                                    id="navbarAvatar"
                                    class="navbar-avatar"
                                    src="<?= $mainPlayer["Image"] ?>"
                                    alt="Avatar utente" />
                                <a href="php/logout.php" class="btn btn-danger btn-sm px-3">Esci</a>
                            </li>
                        <?php endif; ?>

                    </ul>
                </div>
            </div>
        </nav>
    </header>

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

    <main class="container my-5">
        <h1 class="text-center mb-4">Profilo Giocatore: <?= htmlspecialchars($player["Username"]) ?></h1>

        <div class="row g-4 align-items-stretch">
            <!-- image and username section -->
            <div class="col-md-4">
                <div class="card bg-dark border-light h-100 shadow-lg text-light d-flex flex-column">
                    <div class="card-header text-center fs-4 border-bottom border-success">
                        <h3><i class="bi bi-person-circle"></i> <?= htmlspecialchars($player["Username"]) ?></h3>
                    </div>
                    <div class="image-wrapper card-body d-flex flex-column align-items-center justify-content-center flex-grow-1">
                        <div class="image-settings <?= (isset($_SESSION["sessionId"]) && $_SESSION["sessionId"] === $user["SessionId"]) ? 'editable' : '' ?>" id="image-settings" data-player=<?= $player['Username'] ?>>
                            <img id="profile-image" src="<?= $player["Image"] ?>" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">

                            <?php if (isset($_SESSION["sessionId"]) && $_SESSION["sessionId"] === $user["SessionId"]): ?>
                                <div class="edit-icon">✏️</div>
                                <input type="file" id="file-input" style="display:none" accept="image/*">
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>

            <!-- info section -->
            <div class="col-md-8 d-flex flex-column">
                <div class="card bg-dark border-light shadow-lg text-light h-100 d-flex flex-column">
                    <div class="card-header fs-4 border-bottom border-success">Dettagli del Giocatore</div>
                    <div class="card-body flex-grow-1">
                        <?php $isOwner = isset($_SESSION["sessionId"]) && $_SESSION["sessionId"] === $user["SessionId"]; ?>
                        <div id="profile-view">
                            <div class="row mb-3">
                                <h5 class="col-4 fw-bold text-success">Nome:</h5>
                                <h6 class="col-8" id="view-nome"><?= htmlspecialchars($player["Name"] ?? 'Non impostato') ?></h6>
                            </div>
                            <div class="row mb-3">
                                <h5 class="col-4 fw-bold text-success">Cognome:</h5>
                                <h6 class="col-8" id="view-cognome"><?= htmlspecialchars($player["Surname"] ?? 'Non impostato') ?></h6>
                            </div>
                            <div class="row mb-3">
                                <h5 class="col-4 fw-bold text-success">Email:</h5>
                                <h6 class="col-8" id="view-email"><?= htmlspecialchars($user["Email"] ?? 'Non impostato') ?></h6>
                            </div>
                            <div class="row mb-3">
                                <h5 class="col-4 fw-bold text-success">Fiches totali</h5>
                                <h6 class="col-8" id="view-saldo"><?= number_format($player["Fiches"]) ?></h6>
                            </div>
                            <div class="row mb-3">
                                <h5 class="col-4 fw-bold text-success">Tavolo corrente</h5>
                                <h6 class="col-8" id="view-saldo"><?= htmlspecialchars($currentTable) . " (" . (number_format($player["Lvl"]) + 1) . ")" ?></h6>
                            </div>
                            <div class="row mb-3">
                                <h5 class="col-4 fw-bold text-success">Tavolo Più alto</h5>
                                <h6 class="col-8" id="view-saldo"><?= htmlspecialchars($topTable) . " (" . (number_format($player["TopLevel"]) + 1) . ")"  ?></h6>
                            </div>
                            <?php if ($isOwner): ?>
                                <div class="text-end">
                                    <button id="btn-edit" class="btn btn-success">Modifica</button>
                                </div>
                            <?php endif; ?>
                        </div>
                        <form method="post" action="php/update_profile.php" id="profile-edit" style="display:none;">
                            <div class="mb-3 row">
                                <label for="name" class="col-sm-4 col-form-label fw-bold text-success">Nome</label>
                                <div class="col-sm-8">
                                    <input type="text" class="form-control" id="name" name="name" value="<?= htmlspecialchars($player["Name"] ?? '') ?>" placeholder="Non impostato" />
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="surname" class="col-sm-4 col-form-label fw-bold text-success">Cognome</label>
                                <div class="col-sm-8">
                                    <input type="text" class="form-control" id="surname" name="surname" value="<?= htmlspecialchars($player["Surname"] ?? '') ?>" placeholder="Non impostato" />
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="username" class="col-sm-4 col-form-label fw-bold text-success">Username</label>
                                <div class="col-sm-8">
                                    <input type="username" class="form-control" id="username" name="username" value="<?= htmlspecialchars($user["Username"] ?? '') ?>" required />
                                </div>
                            </div>
                            <div class="mb-3 row">
                                <label for="email" class="col-sm-4 col-form-label fw-bold text-success">Email</label>
                                <div class="col-sm-8">
                                    <input type="email" class="form-control" id="email" name="email" value="<?= htmlspecialchars($user["Email"] ?? '') ?>" required />
                                </div>
                            </div>
                            <input type="hidden" name="oldUsername" value="<?= htmlspecialchars($player["Username"]) ?>">
                            <div class="text-end">
                                <button type="submit" class="btn btn-success me-2">Salva</button>
                                <button type="button" id="btn-cancel" class="btn btn-secondary">Annulla</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- games session section -->
        <section class="mt-5">
            <div class="card bg-dark border-light shadow-lg text-light">
                <div class="card-header fs-4 border-bottom border-success" style="display: flex; justify-content: space-between; align-items: center;">
                    <h3>Statistiche sessioni</h3>
                    <div style="display: flex; gap: 1rem;">
                        <h3>Vittorie: <?= $totalWin ?></h3>
                        <h3>Perse: <?= $totalLose ?></h3>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <div class="table-responsive">
                            <table id="games-table" class="table table-dark table-hover table-bordered w-100" data-games='<?= htmlspecialchars(json_encode($games)) ?>'>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Esito</th>
                                        <th>Vittorie</th>
                                        <th>Perse</th>
                                        <th>Pareggi</th>
                                    </tr>
                                </thead>
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="text-center bg-dark text-light py-4 mt-5 border-top border-secondary">
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