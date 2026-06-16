<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$envDbHost = 'gateway01.eu-central-1.prod.aws.tidbcloud.com';
$envDbUser = '3muWTejsin7j8c9.root';
$envDbPass = '23FtZcNIiTWN3pgu';
$envDbName = 'blackjack';
$envDbPort = 4000;

echo "Attempting regular connection...\n";
try {
    $connection = new mysqli($envDbHost, $envDbUser, $envDbPass, $envDbName, $envDbPort);
    echo "Regular connection successful.\n";
} catch (Exception $e) {
    echo "Regular connection failed: " . $e->getMessage() . "\n";
}

echo "Attempting SSL connection...\n";
try {
    $conn = mysqli_init();
    $conn->options(MYSQLI_OPT_SSL_VERIFY_SERVER_CERT, true);
    // Use true for SSL verify, or if cafile is missing, use MYSQLI_CLIENT_SSL only
    $success = $conn->real_connect($envDbHost, $envDbUser, $envDbPass, $envDbName, $envDbPort, NULL, MYSQLI_CLIENT_SSL);
    if ($success) {
        echo "SSL connection successful.\n";
    } else {
        echo "SSL connection failed: " . mysqli_connect_error() . "\n";
    }
} catch (Exception $e) {
    echo "SSL connection exception: " . $e->getMessage() . "\n";
}
