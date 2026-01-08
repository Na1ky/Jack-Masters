<?php
include_once("database_management.php");
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header("Content-Type: application/json");

try {
    $connection = OpenDbConnection("blackjack");

    if (!isset($_SESSION["sessionId"])) {
        throw new Exception("Devi essere loggato per giocare");
    }

    if (!isset($_POST["Bet"]) || !isset($_POST["result"])) {
        throw new Exception("Errore nel salvataggio punteggio");
    }

    $Bet = intval($_POST["Bet"]);
    $result = $_POST["result"];

    UpdateProfit($connection, $_SESSION["sessionId"], $Bet, $result);

    $giocatore = GetPlayer($connection, $_SESSION["sessionId"]);
    $_SESSION["Fiches"] = $giocatore["Fiches"];

    echo json_encode([
        "success" => true,
        "Fiches" => $giocatore["Fiches"]
    ]);

} catch (Exception $ex) {
    echo json_encode([
        "success" => false,
        "error" => $ex->getMessage()
    ]);
    exit;
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
?>