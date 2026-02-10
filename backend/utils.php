<?php
// backend/utils.php
function json_input() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond($data, int $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function save_upload($file, $uploads_dir) {
    if (!is_dir($uploads_dir)) {
        @mkdir($uploads_dir, 0777, true);
    }
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_', true) . '.' . $ext;
    $target = rtrim($uploads_dir, '/\\') . DIRECTORY_SEPARATOR . $filename;
    if (!move_uploaded_file($file['tmp_name'], $target)) {
        return null;
    }
    return $filename;
}
