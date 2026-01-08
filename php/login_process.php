<?php
include_once 'database_management.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
try {
    if (!isset($_POST['Email']) || !isset($_POST['Password'])) {
        throw new Exception("Compilare tutti i campi");
    }

    $connection = OpenDbConnection("blackjack");
    $user = Login($connection, $_POST['Email'], $_POST['Password']);

    if ($user != null) {
        header("Location: ../index.php?message=Accesso effettuato con successo!");
        exit();
    } else {
        throw new Exception("Email o password errati");
    }
} catch (Exception $e) {

    header("Location: ../login.php?error=" . urlencode($e->getMessage()));
    exit();
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
