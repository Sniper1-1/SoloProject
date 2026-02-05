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

if ($method === 'GET') {
    $data = loadData();

    // STATS ONLY
    if (isset($_GET['stats'])) {
        $total = count($data);

        $completed = count(array_filter($data, fn($a) => $a['status'] === 'Completed'));
        $inProgress = count(array_filter($data, fn($a) => $a['status'] === 'In Progress'));
        $notStarted = count(array_filter($data, fn($a) => $a['status'] === 'Not Started'));

        echo json_encode([
            'total' => $total,
            'completed' => $completed,
            'inProgress' => $inProgress,
            'notStarted' => $notStarted
        ]);
        exit;
    }

    // NORMAL PAGED DATA
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;

    $total = count($data);
    $start = ($page - 1) * $limit;
    $pagedData = array_slice($data, $start, $limit);

    echo json_encode([
        'data' => $pagedData,
        'total' => $total,
        'page' => $page,
        'limit' => $limit
    ]);
}
 
elseif ($method === 'POST') {
    // POST /assignments
    $input = json_decode(file_get_contents('php://input'), true);
    
    $required = ['course', 'name', 'status'];
    foreach ($required as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "$field required"]);
            exit;
        }
    }
    
    $data = loadData();
    $newId = 1;
    if (!empty($data)) {
        $newId = max(array_column($data, 'id')) + 1;
    }
    
    $input['id'] = $newId;
    $data[] = $input;
    saveData($data);
    
    http_response_code(201);
    echo json_encode($input);
}
elseif ($method === 'PUT' && $assignmentId !== null) {
    // PUT /assignments/<id>
    $input = json_decode(file_get_contents('php://input'), true);
    $data = loadData();
    
    $found = false;
    foreach ($data as &$assignment) {
        if ($assignment['id'] === $assignmentId) {
            $assignment = array_merge($assignment, $input);
            $found = true;
            break;
        }
    }
    
    if ($found) {
        saveData($data);
        echo json_encode($assignment);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
    }
}
//deleting specific
elseif ($method === 'DELETE' && $assignmentId !== null) {
    // DELETE /assignments/<id>
    $data = loadData();
    $data = array_filter($data, fn($a) => $a['id'] !== $assignmentId);
    saveData(array_values($data));
    
    echo json_encode(['success' => true]);
}
//deleting all
elseif ($method === 'DELETE' && $assignmentId === null) {
    // DELETE ALL (PURGE)
    saveData([]);
    echo json_encode(['success' => true]);
}

else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>
