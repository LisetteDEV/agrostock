<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(Illuminate\Http\Request::capture());

try {
    $cmd = App\Models\Commande::with(['transformateur.user'])->first();
    echo "SUCCESS\n";
    echo json_encode(['cmd' => $cmd]);
} catch (\Exception $e) {
    echo "ERROR\n";
    echo $e->getMessage();
}
