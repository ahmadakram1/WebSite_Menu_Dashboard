<?php
// backend/admin/restaurants.php
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
    $stmt = $pdo->query('SELECT * FROM restaurants');
    respond($stmt->fetchAll());
}

if ($method === 'POST') {
    $input = $_POST ?: json_input();
    $isUpdate = isset($input['_method']) && strtoupper($input['_method']) === 'PUT';
    $logo = save_upload($_FILES['logo'] ?? null, $config['uploads_dir']);

    if ($isUpdate) {
        $id = $input['id'] ?? null;
        if (!$id) {
            respond(['error' => 'Missing id'], 400);
        }
        if ($logo) {
            $stmt = $pdo->prepare('UPDATE restaurants SET name_ar=?, name_en=?, logo=?, phone=?, whatsapp=?, instagram=?, theme_bg=?, theme_card=?, theme_text=?, theme_muted=?, theme_accent=?, theme_accent2=?, theme_border=?, font_family=? WHERE id=?');
            $stmt->execute([
                $input['name_ar'] ?? '',
                $input['name_en'] ?? '',
                $logo,
                $input['phone'] ?? '',
                $input['whatsapp'] ?? '',
                $input['instagram'] ?? '',
                $input['theme_bg'] ?? null,
                $input['theme_card'] ?? null,
                $input['theme_text'] ?? null,
                $input['theme_muted'] ?? null,
                $input['theme_accent'] ?? null,
                $input['theme_accent2'] ?? null,
                $input['theme_border'] ?? null,
                $input['font_family'] ?? null,
                $id
            ]);
        } else {
            $stmt = $pdo->prepare('UPDATE restaurants SET name_ar=?, name_en=?, phone=?, whatsapp=?, instagram=?, theme_bg=?, theme_card=?, theme_text=?, theme_muted=?, theme_accent=?, theme_accent2=?, theme_border=?, font_family=? WHERE id=?');
            $stmt->execute([
                $input['name_ar'] ?? '',
                $input['name_en'] ?? '',
                $input['phone'] ?? '',
                $input['whatsapp'] ?? '',
                $input['instagram'] ?? '',
                $input['theme_bg'] ?? null,
                $input['theme_card'] ?? null,
                $input['theme_text'] ?? null,
                $input['theme_muted'] ?? null,
                $input['theme_accent'] ?? null,
                $input['theme_accent2'] ?? null,
                $input['theme_border'] ?? null,
                $input['font_family'] ?? null,
                $id
            ]);
        }
        respond(['success' => true]);
    }

    $stmt = $pdo->prepare('INSERT INTO restaurants (name_ar, name_en, logo, phone, whatsapp, instagram, theme_bg, theme_card, theme_text, theme_muted, theme_accent, theme_accent2, theme_border, font_family) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $input['name_ar'] ?? '',
        $input['name_en'] ?? '',
        $logo,
        $input['phone'] ?? '',
        $input['whatsapp'] ?? '',
        $input['instagram'] ?? '',
        $input['theme_bg'] ?? null,
        $input['theme_card'] ?? null,
        $input['theme_text'] ?? null,
        $input['theme_muted'] ?? null,
        $input['theme_accent'] ?? null,
        $input['theme_accent2'] ?? null,
        $input['theme_border'] ?? null,
        $input['font_family'] ?? null
    ]);
    respond(['id' => $pdo->lastInsertId()]);
}

if ($method === 'PUT') {
    $input = json_input();
    $id = $input['id'] ?? null;
    if (!$id) {
        respond(['error' => 'Missing id'], 400);
    }
    $stmt = $pdo->prepare('UPDATE restaurants SET name_ar=?, name_en=?, phone=?, whatsapp=?, instagram=?, theme_bg=?, theme_card=?, theme_text=?, theme_muted=?, theme_accent=?, theme_accent2=?, theme_border=?, font_family=? WHERE id=?');
    $stmt->execute([
        $input['name_ar'] ?? '',
        $input['name_en'] ?? '',
        $input['phone'] ?? '',
        $input['whatsapp'] ?? '',
        $input['instagram'] ?? '',
        $input['theme_bg'] ?? null,
        $input['theme_card'] ?? null,
        $input['theme_text'] ?? null,
        $input['theme_muted'] ?? null,
        $input['theme_accent'] ?? null,
        $input['theme_accent2'] ?? null,
        $input['theme_border'] ?? null,
        $input['font_family'] ?? null,
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
    $stmt = $pdo->prepare('DELETE FROM restaurants WHERE id=?');
    $stmt->execute([$id]);
    respond(['success' => true]);
}

respond(['error' => 'Method not allowed'], 405);
