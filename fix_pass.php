<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$users = App\Models\User::all();
foreach ($users as $u) {
    $info = password_get_info($u->password);
    if ($info['algo'] === 0) {
        $u->password = bcrypt($u->password);
        $u->save();
        echo "Fixed: " . $u->email . "\n";
    } else {
        echo "OK: " . $u->email . "\n";
    }
}
echo "DONE\n";
