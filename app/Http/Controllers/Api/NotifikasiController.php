<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    public function index()
    {
        return response()->json(Notifikasi::orderByDesc('waktu')->get());
    }

    public function update(Request $request, $id)
    {
        $notifikasi = Notifikasi::findOrFail($id);
        $notifikasi->update($request->all());
        return response()->json($notifikasi);
    }
}
