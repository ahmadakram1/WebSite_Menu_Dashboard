<?php
// backend/admin/items.php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../utils.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$config = require __DIR__ . '/../config.php';
require_auth($config);

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM items');
    respond($stmt->fetchAll());
}

if ($method === 'POST') {
    $input = $_POST ?: json_input();
    $isUpdate = isset($input['_method']) && strtoupper($input['_method']) === 'PUT';
    $image = save_upload($_FILES['image'] ?? null, $config['uploads_dir']);

    if ($isUpdate) {
        $id = $input['id'] ?? null;
        if (!$id) {
            respond(['error' => 'Missing id'], 400);
        }
        if ($image) {
            $stmt = $pdo->prepare('UPDATE items SET name_ar=?, name_en=?, price=?, description_ar=?, description_en=?, image=?, category_id=? WHERE id=?');
            $stmt->execute([
                $input['name_ar'] ?? '',
                $input['name_en'] ?? '',
                $input['price'] ?? 0,
                $input['description_ar'] ?? '',
                $input['description_en'] ?? '',
                $image,
                $input['category_id'] ?? null,
                $id
            ]);
        } else {
            $stmt = $pdo->prepare('UPDATE items SET name_ar=?, name_en=?, price=?, description_ar=?, description_en=?, category_id=? WHERE id=?');
            $stmt->execute([
                $input['name_ar'] ?? '',
                $input['name_en'] ?? '',
                $input['price'] ?? 0,
                $input['description_ar'] ?? '',
                $input['description_en'] ?? '',
                $input['category_id'] ?? null,
                $id
            ]);
        }
        respond(['success' => true]);
    }

    $stmt = $pdo->prepare('INSERT INTO items (name_ar, name_en, price, description_ar, description_en, image, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $input['name_ar'] ?? '',
        $input['name_en'] ?? '',
        $input['price'] ?? 0,
        $input['description_ar'] ?? '',
        $input['description_en'] ?? '',
        $image,
        $input['category_id'] ?? null
    ]);
    respond(['id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT') {
    $input = json_input();
    $id = $input['id'] ?? null;
    if (!$id) {
        respond(['error' => 'Missing id'], 400);
    }
    $stmt = $pdo->prepare('UPDATE items SET name_ar=?, name_en=?, price=?, description_ar=?, description_en=?, category_id=? WHERE id=?');
    $stmt->execute([
        $input['name_ar'] ?? '',
        $input['name_en'] ?? '',
        $input['price'] ?? 0,
        $input['description_ar'] ?? '',
        $input['description_en'] ?? '',
        $input['category_id'] ?? null,
        $id
    ]);
    respond(['success' => true]);
}

if ($method === 'DELETE') {
    $input = json_input();
    $id = $input['id'] ?? null;
    if (!$id) {
        respond(['error' => 'Missing id'], 400);
    }
    $stmt = $pdo->prepare('DELETE FROM items WHERE id=?');
    $stmt->execute([$id]);
    respond(['success' => true]);
}

respond(['error' => 'Method not allowed'], 405);
