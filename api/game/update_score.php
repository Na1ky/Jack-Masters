<?php
require_once '../utils.php';
initApi();
require_once '../../php/database_management.php';

try {
    $sessionId = getSessionIdFromHeaders();
    if (!$sessionId) {
        sendJsonResponse(false, null, "Non autorizzato", 401);
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) $data = $_POST;

    if (!isset($data["Bet"]) || !isset($data["result"])) {
        sendJsonResponse(false, null, "Errore nel salvataggio punteggio", 400);
    }

    $connection = OpenDbConnection(DBNAME);
    $Bet = intval($data["Bet"]);
    $result = $data["result"];

    UpdateProfit($connection, $sessionId, $Bet, $result);
    $giocatore = GetPlayer($connection, $sessionId);

    sendJsonResponse(true, ["Fiches" => $giocatore["Fiches"]], "Punteggio aggiornato");
} catch (Exception $ex) {
    sendJsonResponse(false, null, $ex->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
