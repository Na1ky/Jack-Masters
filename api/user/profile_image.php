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
    if (empty($data)) {
        $data = $_POST;
    }

    if (!isset($data["newImage"]) || trim($data["newImage"]) === "") {
        sendJsonResponse(false, null, "Immagine mancante", 400);
    }

    $connection = OpenDbConnection(DBNAME);
    $player = GetPlayer($connection, $sessionId);
    UpdateImage($connection, $player["Username"], trim($data["newImage"]));

    sendJsonResponse(true, ["Image" => trim($data["newImage"])], "Immagine aggiornata con successo");
} catch (Exception $ex) {
    sendJsonResponse(false, null, $ex->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
