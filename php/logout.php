<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
include_once("database_management.php");

try {
    if (!isset($_SESSION["sessionId"])) {
        throw new Exception("Nessuna sessione attiva.");
    }

    $connectionn = OpenDbConnection("blackjack");
    DeleteSession($connectionn, $_SESSION["sessionId"]);

    session_unset();
    session_destroy();

    header("Location: ../index.php?message=" . urlencode("Logout effettuato con successo"));
    exit;
} catch (Exception $ex) {
    header("Location: ../index.php?error=" . urlencode("Errore durante il logout: " . $ex->getMessage()));
    exit;
} finally {
    if (isset($connectionn)) {
        CloseDbConnection($connectionn);
    }
}
