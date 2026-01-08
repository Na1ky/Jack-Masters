<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header("Content-Type: application/json");
if (!isset($_POST["endGame"])) {
    if (!isset($_POST["player"]) || !isset(($_POST["dealer"])) || !isset(($_POST["bet"]))) {
        echo json_encode(["success" => false, "error" => "Campi mancanti"]);
    }
    $_SESSION["playerCards"] = $_POST["player"];
    $_SESSION["dealerCards"] = $_POST["dealer"];
    $_SESSION["Bet"] = $_POST["bet"];
    echo json_encode(["success" => true]);
} else {
    $_SESSION["playerCards"] = null;
    $_SESSION["dealerCards"] = null;
    $_SESSION["Bet"] = null;
    echo json_encode(["success" => true]);
}
?>