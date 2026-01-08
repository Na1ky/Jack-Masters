<?php
include_once("database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

$connection = null;

try {
    if (isset($_POST['newLevel'], $_POST['oldLevel'], $_SESSION['sessionId'])) {
        $newLevel = (int)$_POST['newLevel'];
        $oldLevel = (int)$_POST['oldLevel'];
        $connection = OpenDbConnection("blackjack");
        UpdateLvl($connection, $_SESSION["sessionId"], $newLevel);
        echo json_encode(["success" => true, "message" => "Tavolo aggiornato con successo!"]);
    } else {
        throw new Exception("Input non valido");
    }
} catch (Exception $ex) {
    echo json_encode(["success" => false, "error" => $ex->getMessage()]);
    exit;
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
?>