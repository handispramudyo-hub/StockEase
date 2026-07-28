<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StokKeluar;
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
        StokKeluar::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
