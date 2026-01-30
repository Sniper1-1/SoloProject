<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
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
    // GET /assignments
    echo json_encode(loadData());
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
elseif ($method === 'DELETE' && $assignmentId !== null) {
    // DELETE /assignments/<id>
    $data = loadData();
    $data = array_filter($data, fn($a) => $a['id'] !== $assignmentId);
    saveData(array_values($data));
    
    echo json_encode(['success' => true]);
}
else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
}
?>
