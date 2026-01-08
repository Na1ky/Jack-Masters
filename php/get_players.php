<?php
header('Content-Type: application/json');
require_once("database_management.php");

try {
    $connectionn = OpenDbConnection("blackjack");
    $players = GetAllPlayers($connectionn);

    $data = [];
    foreach ($players as $index => $player) {
        $data[] = [
            $index + 1,
            htmlspecialchars($player['Username']),
            htmlspecialchars($player['Fiches']) . " pts",
            htmlspecialchars(GetFromLvlTable($connectionn, $player['Lvl'])) . " pts",
            htmlspecialchars(GetFromLvlTable($connectionn, $player['TopLevel'])) . " pts",
            '<img src="' . htmlspecialchars($player['Image']) . '" class="ranking-avatar" alt="Avatar">'
        ];
    }

    echo json_encode([
        "success" => true,
        "data" => $data
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,"error" => $e->getMessage()
    ]);
} finally {
    if (isset($connectionn)) {
        CloseDbConnection($connectionn);
    }
}