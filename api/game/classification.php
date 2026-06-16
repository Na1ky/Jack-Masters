<?php
require_once __DIR__ . '/../utils.php';
initApi();
require_once __DIR__ . '/../../php/database_management.php';

try {
    $connection = OpenDbConnection(DBNAME);
    $players = GetAllPlayers($connection);

    // Potremmo voler rimuovere l'email o altri dati sensibili se GetAllPlayers li includesse,
    // ma la tabella players contiene solo Fiches, Livello, Nome, ecc. che sono pubblici per la classifica.
    sendJsonResponse(true, $players, "Classifica recuperata con successo");
} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
