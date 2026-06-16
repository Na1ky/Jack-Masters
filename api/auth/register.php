<?php
require_once '../utils.php';
initApi();
require_once '../../php/database_management.php';

try {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data)) {
        $data = $_POST;
    }

    if (!isset($data['Username']) || !isset($data['Email']) || !isset($data['Password']) || !isset($data['ConfirmPassword'])) {
        sendJsonResponse(false, null, "Compilare tutti i campi", 400);
    }

    if ($data['Password'] !== $data['ConfirmPassword']) {
        sendJsonResponse(false, null, "Le password non corrispondono", 400);
    }

    if (strlen($data['Password']) < 8) {
        sendJsonResponse(false, null, "La password deve essere lunga almeno 8 caratteri", 400);
    }

    $connection = OpenDbConnection(DBNAME);
    
    // Controlla se username esiste
    $query = "SELECT Username FROM users WHERE Username = ?";
    $stmt = $connection->prepare($query);
    $stmt->bind_param("s", $data['Username']);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendJsonResponse(false, null, "Username già in uso", 400);
    }

    // Controlla se email esiste
    $query = "SELECT Email FROM users WHERE Email = ?";
    $stmt = $connection->prepare($query);
    $stmt->bind_param("s", $data['Email']);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        sendJsonResponse(false, null, "Email già in uso", 400);
    }

    InsertNewUser($connection, $data['Email'], $data['Password'], $data['Username']);

    // Log the user in immediately
    $user = LoginApi($connection, $data['Email'], $data['Password']);
    if ($user != null) {
        unset($user['Pwd']);
        sendJsonResponse(true, ["sessionId" => $user["SessionId"], "user" => $user], "Registrazione completata con successo!");
    } else {
        sendJsonResponse(true, null, "Registrazione completata, effettua il login.");
    }

} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
