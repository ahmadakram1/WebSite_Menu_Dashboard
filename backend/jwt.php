<?php
// backend/jwt.php
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret) {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];
    $segments = [];
    $segments[] = base64url_encode(json_encode($header));
    $segments[] = base64url_encode(json_encode($payload));
    $signing_input = implode('.', $segments);
    $signature = hash_hmac('sha256', $signing_input, $secret, true);
    $segments[] = base64url_encode($signature);
    return implode('.', $segments);
}

function jwt_decode(string $jwt, string $secret) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) {
        return null;
    }
    [$header_b64, $payload_b64, $sig_b64] = $parts;
    $signing_input = $header_b64 . '.' . $payload_b64;
    $signature = base64url_decode($sig_b64);
    $expected = hash_hmac('sha256', $signing_input, $secret, true);
    if (!hash_equals($expected, $signature)) {
        return null;
    }
    $payload = json_decode(base64url_decode($payload_b64), true);
    return $payload;
}
