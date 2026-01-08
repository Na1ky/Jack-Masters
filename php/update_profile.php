<?php
include_once("database_management.php");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    if (!isset($_SESSION["sessionId"])) {
        throw new Exception("Devi essere loggato");
    }
    if (!isset($_POST["email"]) || !isset($_POST["username"]) || !isset($_POST["oldUsername"])) {
        throw new Exception("Compilare i campi");
    }
    
    $connection = OpenDbConnection("blackjack");
    
    if (!filter_var($_POST["email"], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email non valida");
    }

    UpdatePlayer($connection, $_SESSION["sessionId"], $_POST["email"], $_POST["name"], $_POST["surname"], $_POST["username"], $_POST["oldUsername"]);
    header("Location: ../profile.php?Username=" . urlencode($_POST["username"]) . "&message=" . urlencode("Giocatore modificato con successo!"));
    exit;
} catch (Exception $ex) {
    $errorMsg = $ex->getMessage();
    if (stripos($errorMsg, 'Duplicate entry') !== false && stripos($errorMsg, 'PRIMARY') !== false) {
        $error = "Username già esistente";
    } elseif (stripos($errorMsg, 'Duplicate entry') !== false && stripos($errorMsg, 'Email') !== false) {
        $error = "Email già registrata";
    } else {
        $error = "Errore durante l'inserimento utente: " . $errorMsg;
    }

    if (isset($_POST['username']) || isset($_POST['oldUsername'])) {
        header("Location: ../profile.php?Username=" . urlencode($_POST['oldUsername']) . "&error=" . urlencode($error));
        exit;
    } else {
        header("Location: ../index.php?error=" . urlencode($error));
        exit;
    }
} finally {
    if(isset($connection))
        CloseDbConnection($connection);
}
?>
