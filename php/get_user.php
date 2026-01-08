<?php
include_once 'database_management.php';
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

try {
    $connectionn = OpenDbConnection("blackjack");

    if (!isset($_SESSION["sessionId"])) {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Sessione non valida"]);
        exit();
    }

    $giocatore = GetPlayer($connectionn, $_SESSION["sessionId"]);

    if ($giocatore === null) {
        http_response_code(404);
        echo json_encode(["success" => false, "error" => "Utente non trovato"]);
    } else {
        echo json_encode(["success" => true, "data" => $giocatore]);
    }
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $ex->getMessage()]);
} finally {
    if (isset($connectionn)) {
        CloseDbConnection($connectionn);
    }
}