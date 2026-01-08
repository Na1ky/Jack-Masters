<?php
include_once("database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

try {
    if (!isset($_POST["newImage"]) || !isset($_POST["user"]))
        throw new Exception("Errore paramentri mancanti");
    if(!isset($_SESSION["sessionId"]))
        throw new Exception("Devi essere loggato");
    $connectionn = OpenDbConnection("blackjack");
    UpdateImage($connectionn, $_POST["user"], $_POST["newImage"]);
    echo json_encode(["success" => true]);
} catch (Exception $ex) {
    echo json_encode([
        "success" => false,
        "error" => $ex->getMessage()
    ]);
    exit;
} finally {
    if(isset($connectionn))
    CloseDbConnection($connectionn);
}
