<?php
include_once("database_management.php");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

try {
    $connection = OpenDbConnection("blackjack");
    $levels = GetLevels($connection);
    echo json_encode(["success" => true, "data" => $levels]);
} catch (Exception $ex) {
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $ex->getMessage()]);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
?>