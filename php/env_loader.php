<?php
// Simple .env loader for environments that don't support getenv() from UI
// Usage: include or require this file before database_management.php

function loadEnvFile($filePath = null)
{
    if ($filePath === null) {
        $filePath = __DIR__ . '/../.env';
    }

    if (!file_exists($filePath)) {
        return false; // .env not found, use getenv() or defaults
    }

    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Skip comments and empty lines
        if (strpos(trim($line), '#') === 0 || trim($line) === '') {
            continue;
        }

        // Parse KEY=VALUE format
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Remove quotes if present
            if ((strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) ||
                (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1)
            ) {
                $value = substr($value, 1, -1);
            }

            // Set as environment variable and also in $_ENV for getenv() fallback
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }

    return true;
}

// Auto-load .env if it exists (call only once)
loadEnvFile();
