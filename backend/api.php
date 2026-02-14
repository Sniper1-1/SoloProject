<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200);
    exit;
}
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection using environment variables
$host = getenv("DB_HOST");
$db   = getenv("DB_NAME");
$user = getenv("DB_USER");
$pass = getenv("DB_PASSWORD");

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$db;charset=utf8mb4",
        $user,
        $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$DATA_FILE = "data.json";

function loadData() {
    global $DATA_FILE;
    if (!file_exists($DATA_FILE)) {
        return [];
    }
    return json_decode(file_get_contents($DATA_FILE), true);
}

function saveData($data) {
    global $DATA_FILE;
    file_put_contents($DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));
$id = end($parts);

// Check if last part is a number (assignment ID)
$assignmentId = is_numeric($id) ? (int)$id : null;

// requests handling
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['stats'])) {

    $page  = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;

    // Get total count
    $total = $pdo->query("SELECT COUNT(*) FROM assignments")->fetchColumn();

    // Get paged data
    $stmt = $pdo->prepare("SELECT * FROM assignments ORDER BY id LIMIT :limit OFFSET :offset");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "data" => $data,
        "total" => (int)$total,
        "page" => $page
    ]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $input = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        INSERT INTO assignments (course, name, dueDate, status)
        VALUES (:course, :name, :dueDate, :status)
    ");

    $stmt->execute([
        ":course" => $input['course'],
        ":name" => $input['name'],
        ":dueDate" => $input['dueDate'],
        ":status" => $input['status']
    ]);

    echo json_encode(["success" => true]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {

    $id = basename($_SERVER['REQUEST_URI']);
    $input = json_decode(file_get_contents("php://input"), true);

    $stmt = $pdo->prepare("
        UPDATE assignments
        SET course = :course,
            name = :name,
            dueDate = :dueDate,
            status = :status
        WHERE id = :id
    ");

    $stmt->execute([
        ":course" => $input['course'],
        ":name" => $input['name'],
        ":dueDate" => $input['dueDate'],
        ":status" => $input['status'],
        ":id" => $id
    ]);

    echo json_encode(["success" => true]);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {

    $id = basename($_SERVER['REQUEST_URI']);

    $stmt = $pdo->prepare("DELETE FROM assignments WHERE id = :id");
    $stmt->execute([":id" => $id]);

    echo json_encode(["success" => true]);
    exit;
}

//deleting all
elseif ($method === 'DELETE' && $assignmentId === null) {
    // DELETE ALL (PURGE)
    $pdo->exec("DELETE FROM assignments");
    echo json_encode(['success' => true]);
    exit;
}
elseif (isset($_GET['stats'])) {

    $total = $pdo->query("SELECT COUNT(*) FROM assignments")->fetchColumn();
    $completed = $pdo->query("SELECT COUNT(*) FROM assignments WHERE status='Completed'")->fetchColumn();
    $inProgress = $pdo->query("SELECT COUNT(*) FROM assignments WHERE status='In Progress'")->fetchColumn();
    $notStarted = $pdo->query("SELECT COUNT(*) FROM assignments WHERE status='Not Started'")->fetchColumn();

    echo json_encode([
        "Total Assignments" => (int)$total,
        "Completed Assignments" => (int)$completed,
        "In Progress Assignments" => (int)$inProgress,
        "Not Started Assignments" => (int)$notStarted
    ]);
    exit;
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>
