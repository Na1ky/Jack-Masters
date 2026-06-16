<?php
require_once '../utils.php';
initApi();
require_once '../../php/database_management.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Fallback to $_POST if json_decode is empty (e.g., standard form post)
    if (empty($data)) {
        $data = $_POST;
    }

    if (!isset($data['Email']) || !isset($data['Password'])) {
        sendJsonResponse(false, null, "Compilare tutti i campi", 400);
    }

    $connection = OpenDbConnection(DBNAME);
    $user = LoginApi($connection, $data['Email'], $data['Password']);

    if ($user != null) {
        // Rimuoviamo la password dalla risposta per sicurezza
        unset($user['Pwd']);
        sendJsonResponse(true, ["sessionId" => $user["SessionId"], "user" => $user], "Accesso effettuato con successo!");
    } else {
        sendJsonResponse(false, null, "Email o password errati", 401);
    }
} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
