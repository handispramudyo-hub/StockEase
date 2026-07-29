<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokKeluar;
use App\Models\Barang;
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
        return response()->json($stokKeluar, 201);
    }

    public function show($id)
    {
        return response()->json(StokKeluar::with('barang')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $stokKeluar = StokKeluar::findOrFail($id);
        $stokKeluar->update($request->all());
        return response()->json($stokKeluar);
    }

    public function destroy($id)
    {
        $item = StokKeluar::findOrFail($id);
        $brg = Barang::find($item->barang_id);
        if ($brg) $brg->increment('stok', $item->qty);
        $item->delete();
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
        return response()->json(['deleted' => count($request->ids)]);
    }
}
