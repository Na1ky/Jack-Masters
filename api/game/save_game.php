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

    if (!isset($data["totalWins"]) || !isset($data["totalLosses"]) || !isset($data["totalDraws"]) || !isset($data["message"])) {
        sendJsonResponse(false, null, "Parametri mancanti", 400);
    }

    $connection = OpenDbConnection(DBNAME);
    $player = GetPlayer($connection, $sessionId);

    $totalWin = filter_var($data["totalWins"], FILTER_VALIDATE_INT);
    $totalLose = filter_var($data["totalLosses"], FILTER_VALIDATE_INT);
    $totalDraws = filter_var($data["totalDraws"], FILTER_VALIDATE_INT);
    $message = trim($data["message"]);

    if ($totalWin === false || $totalLose === false || $totalDraws === false) {
        sendJsonResponse(false, null, "Parametri non validi", 400);
    }

    InsertSessionGame($connection, $player["Username"], $totalWin, $totalLose, $totalDraws, $message);

    sendJsonResponse(true, null, "Sessione salvata con successo");
} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
