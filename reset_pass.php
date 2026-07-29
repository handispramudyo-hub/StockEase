<?php
$db = new PDO('mysql:host=localhost;dbname=hank7435_tamaDB', 'hank7435_tamaDB', 'tamaganteng');
$hash = password_hash('password', PASSWORD_BCRYPT);
$db->exec("UPDATE users SET password=" . $db->quote($hash) . " WHERE email=" . $db->quote('admin@tama.com'));
echo "Password untuk admin@tama.com direset ke: password\n";
