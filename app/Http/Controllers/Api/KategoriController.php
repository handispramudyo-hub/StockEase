<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use App\Models\Aktivitas;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    public function index()
    {
        return response()->json(Kategori::all());
    }

    public function store(Request $request)
    {
        $kategori = Kategori::create($request->all());
        Aktivitas::create([
            'aktivitas' => "Kategori {$kategori->nama} ditambahkan",
            'waktu' => now(),
        ]);
        return response()->json($kategori, 201);
    }

    public function show($id)
    {
        return response()->json(Kategori::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $kategori = Kategori::findOrFail($id);
        $namaLama = $kategori->nama;
        $kategori->update($request->all());
        Aktivitas::create([
            'aktivitas' => "Kategori {$namaLama} diperbarui menjadi {$kategori->nama}",
            'waktu' => now(),
        ]);
        return response()->json($kategori);
    }

    public function destroy($id)
    {
        $kategori = Kategori::findOrFail($id);
        Aktivitas::create([
            'aktivitas' => "Kategori {$kategori->nama} dihapus",
            'waktu' => now(),
        ]);
        $kategori->delete();
        return response()->json(null, 204);
    }
}
