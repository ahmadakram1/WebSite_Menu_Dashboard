<?php
// backend/public/menu.php
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$restaurantId = $_GET['restaurant_id'] ?? null;
if (!$restaurantId) {
    respond(['error' => 'Missing restaurant_id'], 400);
}

$stmt = $pdo->prepare('SELECT * FROM restaurants WHERE id = ?');
$stmt->execute([$restaurantId]);
$restaurant = $stmt->fetch();

if (!$restaurant) {
    respond(['error' => 'Restaurant not found'], 404);
}


$categoriesStmt = $pdo->prepare('SELECT * FROM categories');
$categoriesStmt->execute();
$categories = $categoriesStmt->fetchAll();

$itemsStmt = $pdo->prepare('SELECT * FROM items');
$itemsStmt->execute();
$items = $itemsStmt->fetchAll();

respond([
    'restaurant' => $restaurant,
    'categories' => $categories,
    'items' => $items
]);
