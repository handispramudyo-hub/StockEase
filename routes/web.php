<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Response;

Route::get('/{any?}', function ($any = null) {
    $publicPath = public_path($any);

    if ($any && file_exists($publicPath) && is_file($publicPath)) {
        $mime = mime_content_type($publicPath);
        return response()->file($publicPath, ['Content-Type' => $mime]);
    }

    $indexPath = public_path('build/index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }

    return 'React app not built yet. Run npm run build.';
})->where('any', '.*');
