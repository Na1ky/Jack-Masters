<?php
include_once("php/database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
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
        $player = GetPlayer($connectionn, $_SESSION["sessionId"]);
    }
    $levels = GetLevels($connectionn);
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
    <meta name="description" content="Blackjack è un gioco di carte popolare. Inizia a giocare per divertirti!">
    <meta name="keywords" content="Blackjack, gioco di carte, casinò, divertimento">

    <!-- Open Graph -->
    <meta property="og:title" content="BLACKJACK - Home">
    <meta property="og:description" content="Blackjack è un gioco di carte popolare. Inizia a giocare per divertirti!">
    <meta property="og:image" content="img/logo.ico">
    <meta property="og:type" content="website">

    <meta name="language" content="it">
    <title>BLACKJACK - Home</title>
    <link rel="icon" href="img/logo.png" type="image/x-icon">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>

    <!-- JQuery -->
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>

    <!-- Custom -->
    <link rel="stylesheet" href="css/style.css" />
    <link rel="stylesheet" href="css/index.css" />
    <script src="js/script.js" type="application/javascript"></script>
    <script src="js/index.js" type="application/javascript"></script>
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
                            <li class="nav-item"><a class="nav-link" href="profile.php?Username=<?= htmlspecialchars($player['Username']) ?>">Statistiche</a></li>
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

    <main class="py-5">
        <section class="container">

            <!-- HERO Section -->
            <div class="row align-items-center mb-5 bg-blackjack-hero shadow p-5 bg-dark">
                <div class="col-md-6 mb-4 mb-md-0 text-center text-md-start">
                    <img src="img/hero-section-background.png" alt="Tavolo Blackjack" class="img-fluid rounded shadow-lg" loading="lazy" />
                </div>
                <div class="col-md-6 d-flex flex-column justify-content-center align-items-start text-light">
                    <h1 class="hero-title mb-3">Sblocca Tavoli Leggendari!</h1>
                    <p class="hero-subtitle">
                        Vinci partite, guadagna punti e accedi a tavoli sempre più esclusivi. Riuscirai a sbloccarli tutti?
                    </p>
                    <?php if (!isset($_SESSION["sessionId"])): ?>
                        <a href="register.php" class="btn btn-success btn-lg px-5 me-3">
                            <i class="bi bi-person-plus-fill me-2"></i>Inizia a Giocare
                        </a>
                        <p class="mt-3 fs-6">
                            Hai già un account?
                            <a href="login.php" class="text-info text-decoration-underline">Accedi qui</a>
                        </p>
                    <?php else: ?>
                        <a href="game.php" class="btn btn-primary btn-lg px-5 me-3">
                            <i class="bi bi-controller me-2"></i>Continua la scalata!
                        </a>
                        <p class="mt-3 fs-6">Bentornato, <strong><?= htmlspecialchars($player["Username"]) ?></strong>! Nuove sfide ti aspettano.</p>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Features Cards -->
            <div class="row text-light mb-5">
                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-0 shadow-lg p-4">
                        <i class="bi bi-cards-fill"></i>
                        <h5 class="card-title">🎴 Esperienza Evolutiva</h5>
                        <p class="card-text">Ogni partita ti avvicina al prossimo livello. Nuovi tavoli, nuovi stili di gioco!</p>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-0 shadow-lg p-4">
                        <i class="bi bi-graph-up-arrow"></i>
                        <h5 class="card-title">📈 Progresso Visibile</h5>
                        <p class="card-text">Il tuo punteggio determina il tuo status. Più vinci, più sblocchi.</p>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card h-100 border-0 shadow-lg p-4">
                        <i class="bi bi-gem"></i>
                        <h5 class="card-title">💎 Tavoli da Collezionare</h5>
                        <p class="card-text">Dai classici ai rari: sblocca tutti i tavoli e mostra il tuo stile!</p>
                    </div>
                </div>
            </div>

            <!-- How works -->
            <div class="text-center text-light mb-5">
                <h2 class="mb-4">🃏 Come Funziona BLACKJACK</h2>
                <div class="row justify-content-center">
                    <div class="col-md-4 mb-4">
                        <div class="card bg-dark border-success shadow-sm h-100">
                            <div class="card-body">
                                <h5 class="card-title text-success">1. Registrati e Inizia</h5>
                                <p class="card-text">Accedi per iniziare a giocare e iniziare la tua scalata verso tavoli sempre più prestigiosi.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card bg-dark border-success shadow-sm h-100">
                            <div class="card-body">
                                <h5 class="card-title text-success">2. Vinci e Guadagna Punti</h5>
                                <p class="card-text">Ogni vittoria ti dà punti. Più ne hai, più tavoli esclusivi sblocchi!</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 mb-4">
                        <div class="card bg-dark border-success shadow-sm h-100">
                            <div class="card-body">
                                <h5 class="card-title text-success">3. Sblocca Tutti i Tavoli</h5>
                                <p class="card-text">Dalla sala verde alla sala dorata... ce la farai a conquistarle tutte?</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <section class="container mb-5">
                <h2 class="text-light text-center mb-4 fs-1">🎯 Livelli Disponibili</h2>

                <div id="level-display" class="text-center mb-5 p-4">
                    <?php
                    $firstLevel = $levels[0];
                    ?>
                    <img id="main-level-image" src="<?= htmlspecialchars($firstLevel["ImagePath"]) ?>" alt="<?= htmlspecialchars($firstLevel["Name"]) ?>"
                        class="img-fluid rounded shadow-lg mb-3"
                        style="max-height: 450px; max-width: 100%; object-fit: contain;">
                    <h3 class="text-light mb-2 fs-2 fw-bold" id="main-level-name"><?= htmlspecialchars($firstLevel["Name"]) ?></h3>
                    <p class="text-light fs-5" id="main-level-desc"><?= htmlspecialchars($firstLevel["Desc"]) ?></p>
                    <p class="text-light fs-5"><strong>Fiches richieste:</strong> <?= number_format($firstLevel["MinFiches"]) ?></p>
                </div>

                <div class="level-thumbnails d-flex overflow-auto py-2 gap-4">
                    <?php foreach ($levels as $level):
                        $isUnlocked = isset($player) && $player["Fiches"] >= $level["MinFiches"];
                        $opacity = $isUnlocked ? "1" : "0.5";
                    ?>
                        <div class="thumb-wrapper"
                            style="flex: 0 0 auto; cursor: pointer; opacity: <?= $opacity ?>;"
                            data-name="<?= htmlspecialchars($level["Name"]) ?>"
                            data-desc="<?= htmlspecialchars($level["Desc"]) ?>"
                            data-fiches="<?= $level["MinFiches"] ?>">
                            <img src="<?= htmlspecialchars($level["ImagePath"]) ?>" alt="<?= htmlspecialchars($level["Name"]) ?>"
                                class="rounded shadow"
                                style="height: 100px; width: auto; object-fit: cover;">
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>


            <h1 class="text-center">ANTEPRIMA DEL GIOCO</h1>
            <!-- Preview Carousel -->
            <div
                id="carouselBlackjack"
                class="carousel slide mb-5 shadow-lg rounded"
                data-bs-ride="carousel">
                <div class="carousel-inner rounded">
                    <div class="carousel-item active">
                        <img
                            src="img/preview1.png"
                            class="d-block w-100"
                            alt="Anteprima Gioco 1"
                            loading="lazy" />
                    </div>
                    <div class="carousel-item">
                        <img
                            src="img/preview2.png"
                            class="d-block w-100"
                            alt="Anteprima Gioco 2"
                            loading="lazy" />
                    </div>
                    <div class="carousel-item">
                        <img
                            src="img/preview3.png"
                            class="d-block w-100"
                            alt="Anteprima Gioco 3"
                            loading="lazy" />
                    </div>
                    <div class="carousel-item">
                        <img
                            src="img/preview4.png"
                            class="d-block w-100"
                            alt="Anteprima Gioco 4"
                            loading="lazy" />
                    </div>
                    <div class="carousel-item">
                        <img
                            src="img/preview5.png"
                            class="d-block w-100"
                            alt="Anteprima Gioco 5"
                            loading="lazy" />
                    </div>
                    <div class="carousel-item">
                        <img
                            src="img/preview6.png"
                            class="d-block w-100"
                            alt="Anteprima Gioco 6"
                            loading="lazy" />
                    </div>
                </div>
                <button
                    class="carousel-control-prev"
                    type="button"
                    data-bs-target="#carouselBlackjack"
                    data-bs-slide="prev">
                    <span
                        class="carousel-control-prev-icon"
                        aria-hidden="true"></span>
                    <span class="visually-hidden">Precedente</span>
                </button>
                <button
                    class="carousel-control-next"
                    type="button"
                    data-bs-target="#carouselBlackjack"
                    data-bs-slide="next">
                    <span
                        class="carousel-control-next-icon"
                        aria-hidden="true"></span>
                    <span class="visually-hidden">Successivo</span>
                </button>
            </div>
        </section>
    </main>
    <!-- Footer -->
    <footer class="text-center">
        <div class="container">
            <p>© 2025 Blackjack Game - Tutti i diritti riservati</p>
            <p>
                <a href="pdf/privacy.pdf" class="text-light text-decoration-none me-3">Privacy</a>
                <a href="pdf/contacts.pdf" class="text-light text-decoration-none">Contattaci</a>
            </p>
        </div>
    </footer>
</body>

</html>