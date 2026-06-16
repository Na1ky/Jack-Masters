<?php
function initApi() {
    // CORS Headers per Vercel e Test Locali
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, Session-Id");

    // Handle Preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

function getSessionIdFromHeaders() {
    $headers = apache_request_headers();
    
    if (isset($headers['Authorization'])) {
        $matches = array();
        if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
            return $matches[1];
        }
    }
    
    // Fallback on custom header
    if (isset($headers['Session-Id'])) {
        return $headers['Session-Id'];
    }

    return null;
}

function sendJsonResponse($success, $data = null, $message = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        "success" => $success,
        "data" => $data,
        "message" => $message
    ]);
    exit();
}
