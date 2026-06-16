<?php
require_once __DIR__ . '/../utils.php';
initApi();
require_once __DIR__ . '/../../php/database_management.php';

try {
    $connection = OpenDbConnection(DBNAME);
    $levels = GetLevels($connection);

    sendJsonResponse(true, $levels, "Livelli recuperati con successo");
} catch (Exception $e) {
    sendJsonResponse(false, null, $e->getMessage(), 500);
} finally {
    if (isset($connection)) {
        CloseDbConnection($connection);
    }
}
