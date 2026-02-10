<?php
// backend/login.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/utils.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$input = json_input();
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

$stmt = $pdo->prepare('SELECT id, password FROM admins WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password'])) {
    respond(['error' => 'Invalid credentials'], 401);
}

$config = require __DIR__ . '/config.php';
$payload = [
    'sub' => $admin['id'],
    'iss' => $config['jwt']['issuer'],
    'iat' => time(),
    'exp' => time() + $config['jwt']['ttl']
];
$token = jwt_encode($payload, $config['jwt']['secret']);

respond(['token' => $token]);
