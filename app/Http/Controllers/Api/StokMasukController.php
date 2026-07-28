<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokMasuk;
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
        StokMasuk::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
