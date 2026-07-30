<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokKeluar;
use App\Models\Barang;
use App\Models\Aktivitas;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class StokKeluarController extends Controller
{
    public function index()
    {
        return response()->json(StokKeluar::with('barang')->get());
    }

    public function store(Request $request)
    {
        $stokKeluar = StokKeluar::create($request->all());
        $brg = Barang::find($request->barang_id);

        Aktivitas::create([
            'aktivitas' => "Stok keluar: {$brg?->nama} -{$request->qty} ke {$request->tujuan}",
            'waktu' => now(),
        ]);
        if ($brg) $this->cekNotifikasi($brg->fresh());

        return response()->json($stokKeluar, 201);
    }

    public function show($id)
    {
        return response()->json(StokKeluar::with('barang')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $stokKeluar = StokKeluar::findOrFail($id);
        $brg = Barang::find($stokKeluar->barang_id);
        $stokKeluar->update($request->all());

        Aktivitas::create([
            'aktivitas' => "Update stok keluar: {$brg?->nama} qty {$stokKeluar->qty} → {$request->qty} ke {$request->tujuan}",
            'waktu' => now(),
        ]);
        if ($brg) $this->cekNotifikasi($brg->fresh());

        return response()->json($stokKeluar);
    }

    public function destroy($id)
    {
        $item = StokKeluar::findOrFail($id);
        $brg = Barang::find($item->barang_id);
        if ($brg) $brg->increment('stok', $item->qty);
        $item->delete();

        Aktivitas::create([
            'aktivitas' => "Stok keluar {$brg?->nama} +{$item->qty} dikembalikan (hapus)",
            'waktu' => now(),
        ]);
        if ($brg) $this->cekNotifikasi($brg->fresh());

        return response()->json(null, 204);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:stok_keluars,id']);
        $items = StokKeluar::whereIn('id', $request->ids)->get();
        foreach ($items as $item) {
            $brg = Barang::find($item->barang_id);
            if ($brg) $brg->increment('stok', $item->qty);
            $item->delete();
        }

        Aktivitas::create([
            'aktivitas' => count($request->ids) . " stok keluar dihapus",
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
