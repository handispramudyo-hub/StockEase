<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function ($any = null) {
    $publicPath = public_path($any);

    if ($any && file_exists($publicPath) && is_file($publicPath)) {
        $ext = pathinfo($publicPath, PATHINFO_EXTENSION);
        $mimes = [
            'js' => 'application/javascript',
            'css' => 'text/css',
            'html' => 'text/html',
            'svg' => 'image/svg+xml',
            'json' => 'application/json',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
        ];
        $mime = $mimes[$ext] ?? 'application/octet-stream';
        return response(file_get_contents($publicPath), 200, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }

    $indexPath = public_path('build/index.html');
    if (file_exists($indexPath)) {
        return response(file_get_contents($indexPath), 200, [
            'Content-Type' => 'text/html',
        ]);
    }

    return 'React app not built yet. Run npm run build.';
})->where('any', '.*');
