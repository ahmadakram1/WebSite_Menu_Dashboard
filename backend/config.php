<?php
// backend/config.php
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'menu_system',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4'
    ],
    'jwt' => [
        'secret' => 'CHANGE_ME_SUPER_SECRET',
        'issuer' => 'menu_api',
        'ttl' => 3600
    ],
    'uploads_dir' => __DIR__ . '/uploads'
];
