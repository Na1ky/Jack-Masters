<?php
session_start();
include_once("php/database_management.php");
if (isset($_SESSION["sessionId"])) {
    header("Location: index.php?error=Accesso già effettuato");
    exit;
}
try {
    $connectionn = OpenDbConnection("blackjack");
    $levels = GetLevels($connectionn);
} catch (Exception $ex) {
    header("Location: login.php?error=Errore " . $ex);
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
    <meta name="description" content="Blackjack è un popolare gioco di carte. Accedi e inizia subito a divertirti!">
    <meta name="keywords" content="Blackjack, gioco di carte, casinò, divertimento">

    <!-- Open Graph -->
    <meta property="og:title" content="BLACKJACK - Accedi">
    <meta property="og:description" content="Gioca a Blackjack, il celebre gioco di carte da casinò. Accedi e inizia subito!">
    <meta property="og:image" content="img/logo.ico">
    <meta property="og:type" content="website">

    <meta name="language" content="it">
    <title>BLACKJACK - Accedi</title>
    <link rel="icon" href="img/logo.png" type="image/x-icon">

    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
    
    <!-- JQuery -->
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>

    <!-- Custom -->
    <link rel="stylesheet" href="css/style.css" />
    <script src="js/script.js"></script>
    <script src="js/login-register.js"></script>
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
                        <li class="nav-item">
                            <a class="btn btn-outline-success btn-sm px-3" href="login.php">Accedi</a>
                        </li>
                        <li class="nav-item">
                            <a class="btn btn-success btn-sm px-3" href="register.php">Registrati</a>
                        </li>
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

    <main data-levels='<?= htmlspecialchars(json_encode($levels), ENT_QUOTES, 'UTF-8') ?>'>
        <!-- Login form -->
        <div class="container d-flex justify-content-center align-items-center min-vh-100">
            <div class="card p-4 text-center text-light" style="max-width: 420px; width: 100%; background-color: #1b1f1d; border: 2px solid green; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);">
                <img src="img/logo.png" alt="Logo Blackjack" width="180" class="mx-auto mb-3">
                <h3 class="fw-bold" style="color: green;">Benvenuto al tavolo!</h3>
                <p class="text-light mb-4" style="color: #c0c0c0;">Inserisci le tue credenziali per accedere</p>

                <form action="php/login_process.php" method="POST">
                    <div class="mb-3 text-start">
                        <label for="email" class="form-label text-success">Email</label>
                        <input type="email" class="form-control bg-dark text-light border-success" name="Email" placeholder="esempio@email.com" required>
                    </div>
                    <div class="mb-3 text-start">
                        <label for="password" class="form-label text-success">Password</label>
                        <input type="password" class="form-control bg-dark text-light border-success" id="password-input" name="Password" placeholder="••••••••" required>

                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" id="toggle-password">
                            <label class="form-check-label text-light" for="toggle-password">Mostra password</label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-lg fw-bold mt-3" style="background-color: green; color: #111;">🎲 Accedi</button>
                </form>

                <p class="mt-4">Non hai un account?
                    <a href="register.php" class="text-decoration-underline" style="color: #ff4136;">Registrati ora</a>
                </p>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="mt-5">
        <div class="container text-center">
            <p>© 2025 Blackjack Game - Tutti i diritti riservati</p>
            <p>
                <a href="pdf/privacy.pdf" class="text-light text-decoration-none me-3">Privacy</a>
                <a href="pdf/contacts.pdf" class="text-light text-decoration-none">Contattaci</a>
            </p>
        </div>
    </footer>
</body>

</html>