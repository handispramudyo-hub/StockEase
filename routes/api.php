<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\BarangController;
use App\Http\Controllers\Api\StokMasukController;
use App\Http\Controllers\Api\StokKeluarController;
use App\Http\Controllers\Api\AktivitasController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::apiResource('users', UserController::class);
Route::apiResource('kategori', KategoriController::class);
Route::post('/barang/import', [BarangController::class, 'import']);
Route::post('/barang/bulk-delete', [BarangController::class, 'bulkDestroy']);
Route::apiResource('barang', BarangController::class);

Route::get('/stok_masuk', [StokMasukController::class, 'index']);
Route::post('/stok_masuk', [StokMasukController::class, 'store']);
Route::get('/stok_masuk/{id}', [StokMasukController::class, 'show']);
Route::put('/stok_masuk/{id}', [StokMasukController::class, 'update']);
Route::delete('/stok_masuk/{id}', [StokMasukController::class, 'destroy']);
Route::post('/stok_masuk/bulk-delete', [StokMasukController::class, 'bulkDestroy']);

Route::get('/stok_keluar', [StokKeluarController::class, 'index']);
Route::post('/stok_keluar', [StokKeluarController::class, 'store']);
Route::get('/stok_keluar/{id}', [StokKeluarController::class, 'show']);
Route::put('/stok_keluar/{id}', [StokKeluarController::class, 'update']);
Route::delete('/stok_keluar/{id}', [StokKeluarController::class, 'destroy']);
Route::post('/stok_keluar/bulk-delete', [StokKeluarController::class, 'bulkDestroy']);

Route::get('/aktivitas', [AktivitasController::class, 'index']);
Route::post('/aktivitas', [AktivitasController::class, 'store']);

Route::get('/notifikasi', [NotifikasiController::class, 'index']);
Route::patch('/notifikasi/{id}', [NotifikasiController::class, 'update']);

Route::get('/settings/{id?}', [SettingsController::class, 'show']);
Route::patch('/settings/{id?}', [SettingsController::class, 'update']);
Route::put('/settings/{id?}', [SettingsController::class, 'update']);
