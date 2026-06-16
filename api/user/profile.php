<?php
require_once '../utils.php';
initApi();
require_once '../../php/database_management.php';

try {
    $sessionId = getSessionIdFromHeaders();
    if (!$sessionId) {
        sendJsonResponse(false, null, "Non autorizzato. Token mancante.", 401);
    }

    $connection = OpenDbConnection(DBNAME);
    $player = GetPlayer($connection, $sessionId);

    if ($player != null) {
        // Rimuoviamo dati sensibili se necessario, ma GetPlayer restituisce da 'players'
        sendJsonResponse(true, $player, "Profilo recuperato");
    } else {
        sendJsonResponse(false, null, "Utente non trovato", 404);
    }
} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 401); // Di solito l'eccezione in GetPlayer è "Utente non trovato"
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
