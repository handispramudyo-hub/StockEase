<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokMasuk;
use App\Models\Barang;
use App\Models\Aktivitas;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class StokMasukController extends Controller
{
    public function index()
    {
        return response()->json(StokMasuk::with('barang')->get());
    }

    public function store(Request $request)
    {
        $stokMasuk = StokMasuk::create($request->all());
        $brg = Barang::find($request->barang_id);

        Aktivitas::create([
            'aktivitas' => "Stok masuk: {$brg?->nama} +{$request->qty} dari {$request->dari_siapa}",
            'waktu' => now(),
        ]);
        if ($brg) $this->cekNotifikasi($brg->fresh());

        return response()->json($stokMasuk, 201);
    }

    public function show($id)
    {
        return response()->json(StokMasuk::with('barang')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $stokMasuk = StokMasuk::findOrFail($id);
        $brg = Barang::find($stokMasuk->barang_id);
        $stokMasuk->update($request->all());

        Aktivitas::create([
            'aktivitas' => "Update stok masuk: {$brg?->nama} qty {$stokMasuk->qty} → {$request->qty} dari {$request->dari_siapa}",
            'waktu' => now(),
        ]);
        if ($brg) $this->cekNotifikasi($brg->fresh());

        return response()->json($stokMasuk);
    }

    public function destroy($id)
    {
        $item = StokMasuk::findOrFail($id);
        $brg = Barang::find($item->barang_id);
        if ($brg) $brg->decrement('stok', $item->qty);
        $item->delete();

        Aktivitas::create([
            'aktivitas' => "Stok masuk {$brg?->nama} -{$item->qty} dihapus",
            'waktu' => now(),
        ]);
        if ($brg) $this->cekNotifikasi($brg->fresh());

        return response()->json(null, 204);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:stok_masuks,id']);
        $items = StokMasuk::whereIn('id', $request->ids)->get();
        foreach ($items as $item) {
            $brg = Barang::find($item->barang_id);
            if ($brg) $brg->decrement('stok', $item->qty);
            $item->delete();
        }

        Aktivitas::create([
            'aktivitas' => count($request->ids) . " stok masuk dihapus",
            'waktu' => now(),
        ]);

        return response()->json(['deleted' => count($request->ids)]);
    }

    private function cekNotifikasi(Barang $barang): void
    {
        if ($barang->stok <= 0) {
            Notifikasi::create([
                'judul' => 'Stok Habis',
                'pesan' => "{$barang->nama} sudah habis",
                'status' => 'unread',
                'waktu' => now(),
            ]);
        } elseif ($barang->stok_minimum > 0 && $barang->stok <= $barang->stok_minimum) {
            Notifikasi::create([
                'judul' => 'Stok Menipis',
                'pesan' => "{$barang->nama} tersisa {$barang->stok} (min. {$barang->stok_minimum})",
                'status' => 'unread',
                'waktu' => now(),
            ]);
        }
    }
}
