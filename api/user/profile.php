<?php
require_once __DIR__ . '/../utils.php';
initApi();
require_once __DIR__ . '/../../php/database_management.php';

try {
    $connection = OpenDbConnection(DBNAME);
    $username = isset($_GET['Username']) ? trim($_GET['Username']) : '';
    $sessionId = getSessionIdFromHeaders();

    if ($username !== '') {
        $player = GetPlayerFromUsername($connection, $username);
    } else {
        if (!$sessionId) {
            sendJsonResponse(false, null, "Non autorizzato. Token mancante.", 401);
        }
        $player = GetPlayer($connection, $sessionId);
    }

    if ($player != null) {
        $games = GetAllGames($connection, $player['Username']);
        $player['Games'] = $games;
        $player['TotalWins'] = GetAllWin($connection, $player['Username']);
        $player['TotalLosses'] = GetAllLose($connection, $player['Username']);

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
