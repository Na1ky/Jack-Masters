<?php
require_once __DIR__ . '/../utils.php';
initApi();
require_once __DIR__ . '/../../php/database_management.php';

try {
    $sessionId = getSessionIdFromHeaders();
    if (!$sessionId) {
        sendJsonResponse(false, null, "Non autorizzato", 401);
    }

    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) $data = $_POST;

    if (!isset($data['newLevel'])) {
        sendJsonResponse(false, null, "Input non valido", 400);
    }

    $newLevel = (int)$data['newLevel'];
    $connection = OpenDbConnection(DBNAME);
    UpdateLvl($connection, $sessionId, $newLevel);

    sendJsonResponse(true, null, "Tavolo aggiornato con successo!");
} catch (Exception $ex) {
    sendJsonResponse(false, null, $ex->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
