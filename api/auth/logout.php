<?php
require_once __DIR__ . '/../utils.php';
initApi();
require_once __DIR__ . '/../../php/database_management.php';

try {
    $sessionId = getSessionIdFromHeaders();
    if ($sessionId) {
        $connection = OpenDbConnection(DBNAME);
        DeleteSession($connection, $sessionId);
        sendJsonResponse(true, null, "Logout effettuato con successo");
    } else {
        sendJsonResponse(true, null, "Già disconnesso");
    }
} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
