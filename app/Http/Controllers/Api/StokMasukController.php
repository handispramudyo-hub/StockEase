<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokMasuk;
use App\Models\Barang;
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
        return response()->json($stokMasuk, 201);
    }

    public function show($id)
    {
        return response()->json(StokMasuk::with('barang')->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $stokMasuk = StokMasuk::findOrFail($id);
        $stokMasuk->update($request->all());
        return response()->json($stokMasuk);
    }

    public function destroy($id)
    {
        $item = StokMasuk::findOrFail($id);
        $brg = Barang::find($item->barang_id);
        if ($brg) $brg->decrement('stok', $item->qty);
        $item->delete();
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
        return response()->json(['deleted' => count($request->ids)]);
    }
}
