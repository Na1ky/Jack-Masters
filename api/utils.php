<?php
function initApi() {
    ini_set('display_errors', '0'); // Prevents PHP warnings from breaking JSON
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
    if (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
    } else {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $headers[$name] = $value;
            }
        }
    }
    
    $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? null);
    if ($authorization) {
        $matches = array();
        if (preg_match('/Bearer\s(\S+)/', $authorization, $matches)) {
            return $matches[1];
        }
    }
    
    // Fallback on custom header
    return $headers['Session-Id']
        ?? $headers['session-id']
        ?? $headers['Session-id']
        ?? ($_SERVER['HTTP_SESSION_ID'] ?? null);
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
