<?php
include_once 'database_management.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    if (!isset($_POST['Email']) || !isset($_POST['Password']) || !isset($_POST['Username'])) {
        throw new Exception("Compilare tutti i campi");
    }

    $connection = OpenDbConnection("blackjack");
    InsertNewUser($connection, $_POST['Email'], $_POST['Password'], $_POST['Username']);

    header("Location: ../login.php?message=" . urlencode("Registrazione avvenuta con successo, ora puoi accedere"));
    exit();
} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    if (stripos($errorMsg, 'Duplicate entry') !== false && stripos($errorMsg, 'PRIMARY') !== false) {
        $error = "Username già esistente";
    } elseif (stripos($errorMsg, 'Duplicate entry') !== false && stripos($errorMsg, 'Email') !== false) {
        $error = "Email già registrata";
    } else {
        $error = "Errore durante l'inserimento utente: " . $errorMsg;
    }
    header("Location: ../register.php?error=" . urlencode("Errore: " . $error));
    exit();
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
?>