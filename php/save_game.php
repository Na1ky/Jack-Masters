<?php
include_once("database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header("Content-Type: application/json");

try {
    if (
        !isset($_SESSION["sessionId"]) ||
        !isset($_POST["totalWins"]) ||
        !isset($_POST["totalLosses"]) ||
        !isset($_POST["totalDraws"]) ||
        !isset($_POST["message"])
    ) {
        throw new Exception("Devi giocare per accedere a questa pagina.");
    }

    $connection = OpenDbConnection("blackjack");

    $player = GetPlayer($connection, $_SESSION["sessionId"]);
    if ($player === null) {
        throw new Exception("Utente non trovato.");
    }

    $totalWin = filter_var($_POST["totalWins"], FILTER_VALIDATE_INT);
    $totalLose = filter_var($_POST["totalLosses"], FILTER_VALIDATE_INT);
    $totalDraws = filter_var($_POST["totalDraws"], FILTER_VALIDATE_INT);
    $message = trim($_POST["message"]);

    if ($totalWin === false || $totalLose === false || $totalDraws === false) {
        throw new Exception("Parametri di gioco non validi.");
    }

    InsertSessionGame($connection, $player["Username"], $totalWin, $totalLose, $totalDraws, $message);

    echo json_encode(["success" => true, "message" => "Sessione salvata con successo"]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit;
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
?>