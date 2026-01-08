<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define("DBHOST", "localhost");
define("DBUSER", "root");
define("DBPASS", "");

function OpenDbConnection($dbName)
{
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    try {
        $connection = new mysqli(DBHOST, DBUSER, DBPASS, $dbName);
        $connection->set_charset("utf8");
        return $connection;
    } catch (mysqli_sql_exception $ex) {
        throw new Exception("Errore di connessione al DB: " . $ex->getMessage());
    }
}

function CloseDbConnection($connection)
{
    $connection->close();
}

function Login($connection, $email, $password)
{
    $query = "SELECT * FROM users WHERE Email = ?";
    $stmt = $connection->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['Pwd'])) {

            if ($user["SessionId"] != null) {
                header("Location: ../login.php?error=Accesso già eseguito da un altro dispositivo");
                exit;
            }

            session_regenerate_id(true);
            $Session_id = session_id();

            $query = "UPDATE users SET SessionId = ? WHERE Email = ?";
            $stmt = $connection->prepare($query);
            $stmt->bind_param("ss", $Session_id, $email);
            $stmt->execute();

            $_SESSION['sessionId'] = $Session_id;
            $_SESSION["expired"] = time() + (40 * 60);
            return $user;
        }
    }

    return null;
}
function GetUser($connection, $Username)
{
    $query = "SELECT * FROM users WHERE Username = ?";
    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("s", $Username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Utente non trovato.");
    }

    return $result->fetch_assoc();
}
function InsertNewUser($connection, $email, $password, $username)
{

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    $connection->begin_transaction();

    try {
        $query = "INSERT INTO users (Username,SessionId, Pwd, Email) VALUES (?,NULL, ?, ?)";
        $stmt = $connection->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query utenti: " . $connection->error);
        }
        $stmt->bind_param("sss", $username, $passwordHash, $email);
        $stmt->execute();
        $stmt->close();

        $defaultImagePath = 'https://i.imgur.com/VCC4UDV.jpeg';
        $query = "INSERT INTO players (Username, Name, Surname, Fiches, Image, Lvl) VALUES (?, NULL, NULL, 0, ?, 0)";
        $stmt = $connection->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query giocatori: " . $connection->error);
        }
        $stmt->bind_param("ss", $username, $defaultImagePath);
        if (!$stmt->execute()) {
            throw new Exception("Errore durante l'inserimento del giocatore: " . $stmt->error);
        }
        $stmt->close();

        $connection->commit();
    } catch (Exception $e) {
        $connection->rollback();
        throw $e;
    }
}
function GetPlayerFromUsername($connection, $username)
{
    $query = "SELECT * FROM players WHERE Username = ?";
    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Giocatore non trovato.");
    }

    return $result->fetch_assoc();
}
function GetPlayer($connection, $sessionId)
{
    $query = "SELECT * FROM users WHERE SessionId = ?";
    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("s", $sessionId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Utente non trovato.");
    }

    $user = $result->fetch_assoc();

    $query = "SELECT * FROM players WHERE Username = ?";
    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("s", $user["Username"]);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception("Giocatore non trovato.");
    }

    return $result->fetch_assoc();
}
function UpdateProfit($connection, $sessionId, $bet, $result)
{
    $player = GetPlayer($connection, $sessionId);
    $deltaFiches = 0;

    switch ($result) {
        case "win":
            $deltaFiches = $bet * 2;
            break;
        case "danger":
            $deltaFiches = -$bet;
            break;
        case "draw":
            $deltaFiches = 0;
            break;
        case "double-win":
            $deltaFiches = $bet * 4;
            break;
        case "double-danger":
            $deltaFiches = -$bet * 2;
            break;
        default:
            throw new Exception("Risultato non valido.");
    }

    $query = "UPDATE players SET Fiches = Fiches + ? WHERE Username = ?";
    $stmt = $connection->prepare($query);
    $stmt->bind_param("is", $deltaFiches, $player["Username"]);

    if (!$stmt->execute()) {
        throw new Exception("Errore durante l'aggiornamento dei Fiches: " . $stmt->error);
    }

    $queryCheck = "SELECT Fiches FROM players WHERE Username = ?";
    $stmtCheck = $connection->prepare($queryCheck);
    $stmtCheck->bind_param("s", $player["Username"]);
    $stmtCheck->execute();
    $resultCheck = $stmtCheck->get_result();

    if ($row = $resultCheck->fetch_assoc()) {
        if ($row['Fiches'] < 0) {
            $resetQuery = "UPDATE players SET Fiches = 0 WHERE Username = ?";
            $resetStmt = $connection->prepare($resetQuery);
            $resetStmt->bind_param("s", $player["Username"]);
            $resetStmt->execute();
        }
    }

    return true;
}

function InsertSessionGame($connection, $username, $totalWin, $totalLose, $totalDraws, $message)
{
    try {
        $totalGames = $totalWin + $totalLose + $totalDraws;

        $query = "INSERT INTO games (Username, TotalMatch, Wins, Loses, Draw, results, Date)
                  VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $connection->prepare($query);
        if (!$stmt) {
            throw new Exception("Preparazione query fallita: " . $connection->error);
        }

        $now = (new DateTime())->format('Y-m-d');

        $stmt->bind_param("siiiiss", $username, $totalGames, $totalWin, $totalLose, $totalDraws, $message, $now);
        $stmt->execute();
        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        error_log("Errore inserimento sessione: " . $e->getMessage());
        throw new Exception("Errore durante il salvataggio della sessione di gioco.");
    }
}
function UpdateLvl($connection, $sessionId, $newLevel)
{
    $connection->begin_transaction();
    try {
        $player = GetPlayer($connection, $sessionId);
        if ($player["TopLevel"] < $newLevel) {
            $query = "UPDATE players SET TopLevel = ? WHERE Username = ?";
            $stmt = $connection->prepare($query);
            if (!$stmt) {
                throw new Exception("Errore nella preparazione della query utenti: " . $connection->error);
            }
            $stmt->bind_param("is", $newLevel, $player["Username"]);
            if (!$stmt->execute()) {
                throw new Exception("Errore nell'esecuzione della query: " . $stmt->error);
            }
            $stmt->close();
        }
        $query = "UPDATE players SET Lvl = ? WHERE Username = ?";
        $stmt = $connection->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query utenti: " . $connection->error);
        }
        $stmt->bind_param("is", $newLevel, $player["Username"]);
        if (!$stmt->execute()) {
            throw new Exception("Errore nell'esecuzione della query: " . $stmt->error);
        }
        $stmt->close();
        $connection->commit();
    } catch (Exception $e) {
        $connection->rollback();
        throw $e;
    }
}
function GetLevels($connectionn)
{
    $query = "SELECT * FROM levels";
    $result = $connectionn->query($query);

    if ($result === false) {
        throw new Exception("Errore durante la query dei livelli: " . $connectionn->error);
    }

    $levels = [];
    while ($row = $result->fetch_assoc()) {
        $levels[] = $row;
    }

    return $levels;
}
function DeleteSession($connection, $sessionId)
{
    $stmt = $connection->prepare("UPDATE users SET SessionId = null WHERE SessionId = ?");
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }
    $stmt->bind_param("s", $sessionId);
    if (!$stmt->execute()) {
        throw new Exception("Errore nell'eliminazione della sessione: " . $stmt->error);
    }
    $stmt->close();
}
function GetAllPlayers($connection)
{
    $query = "SELECT * FROM players ORDER BY Fiches DESC";
    $result = $connection->query($query);

    if ($result === false) {
        throw new Exception("Errore nella query dei giocatori: " . $connection->error);
    }

    $players = [];
    while ($row = $result->fetch_assoc()) {
        $players[] = $row;
    }

    return $players;
}
function GetFromLvlTable($connection, $level)
{
    $query = "SELECT Name FROM levels WHERE Lvl = ?";

    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("i", $level);
    $stmt->execute();
    $result = $stmt->get_result();

    $row = $result->fetch_assoc();
    $stmt->close();

    if (!$row) {
        throw new Exception("Livello non trovato.");
    }

    return $row['Name'];
}
function UpdatePlayer($connection, $sessionId, $email, $name, $surname, $newusername, $oldUsername)
{
    $connection->begin_transaction();
    try {
        $query = "UPDATE users SET Email = ?, Username = ? WHERE SessionId = ?";
        $stmt = $connection->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query utenti: " . $connection->error);
        }
        $stmt->bind_param("sss", $email, $newusername, $sessionId);
        $stmt->execute();
        $stmt->close();

        $name = isset($name) && trim($name) !== "" ? $name : null;
        $surname = isset($surname) && trim($surname) !== "" ? $surname : null;

        $query = "UPDATE players SET Name = ?, Surname = ?, Username = ? WHERE Username = ?";
        $stmt = $connection->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query players: " . $connection->error);
        }
        $stmt->bind_param("ssss", $name, $surname, $newusername, $oldUsername);
        if (!$stmt->execute()) {
            throw new Exception("Errore nell'esecuzione della query players: " . $stmt->error);
        }
        $stmt->close();

        $connection->commit();
    } catch (Exception $e) {
        $connection->rollback();
        throw $e;
    }
}
function GetAllGames($connection, $Username) {
    $query = "SELECT * FROM games WHERE Username = ?";

    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("s", $Username);
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    $stmt->close();
    return $rows;
}
function UpdateImage($connection, $user, $newImage){
    $query = "UPDATE players SET Image = ? WHERE Username = ?";
    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $stmt->bind_param("ss", $newImage, $user);
    $stmt->execute();
    $stmt->close();
}
function GetAllWin($connection, $user){
    $query = "SELECT COUNT(*) as totalWins FROM games WHERE Username = ? AND Results LIKE ?";

    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $search = "%VINCITA%";
    $stmt->bind_param("ss", $user, $search);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    $stmt->close();

    return $row['totalWins'];
}

function GetAllLose($connection, $user){
    $query = "SELECT COUNT(*) as totalLose FROM games WHERE Username = ? AND Results LIKE ?";

    $stmt = $connection->prepare($query);
    if (!$stmt) {
        throw new Exception("Preparazione query fallita: " . $connection->error);
    }

    $search = "%PERDITA%";
    $stmt->bind_param("ss", $user, $search);
    $stmt->execute();

    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    $stmt->close();

    return $row['totalLose'];
}