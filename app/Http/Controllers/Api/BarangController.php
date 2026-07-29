<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\Kategori;
use App\Models\Supplier;
use App\Models\Gudang;
use Illuminate\Http\Request;

class BarangController extends Controller
{
    public function index(Request $request)
    {
        $query = Barang::with(['kategori', 'supplier', 'gudang']);

        if ($request->search) {
            $query->where('nama', 'like', '%' . $request->search . '%');
        }

        if ($request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->all();
        if (empty($data['kode_barang'])) {
            $data['kode_barang'] = 'BRG-' . date('Ymd') . '-' . str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        }
        $barang = Barang::create($data);
        return response()->json($barang, 201);
    }

    public function show($id)
    {
        return response()->json(Barang::with(['kategori', 'supplier', 'gudang'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $barang = Barang::findOrFail($id);
        $barang->update($request->all());
        return response()->json($barang);
    }

    public function destroy($id)
    {
        Barang::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:barangs,id']);
        Barang::whereIn('id', $request->ids)->delete();
        return response()->json(['deleted' => count($request->ids)]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'data' => 'required|array|max:1000',
            'data.*.nama' => 'required|string|max:255',
        ]);

        $kategoriMap = Kategori::all()->keyBy(fn($k) => strtolower(trim($k->nama)));
        $supplierMap = Supplier::all()->keyBy(fn($s) => strtolower(trim($s->nama)));
        $gudangMap = Gudang::all()->keyBy(fn($g) => strtolower(trim($g->nama)));

        $success = 0;
        $errors = [];

        foreach ($request->data as $i => $item) {
            try {
                $nama = trim($item['nama']);
                if (empty($nama)) { $errors[] = "Baris " . ($i + 1) . ": Nama kosong"; continue; }

                $data = [
                    'nama' => $nama,
                    'stok' => (int) ($item['stok'] ?? 0),
                    'stok_minimum' => (int) ($item['stok_minimum'] ?? 0),
                    'harga_beli' => (float) ($item['harga_beli'] ?? 0),
                    'harga_jual' => (float) ($item['harga_jual'] ?? 0),
                    'satuan' => $item['satuan'] ?? 'PCS',
                    'barcode' => $item['barcode'] ?? null,
                    'status' => 'aktif',
                ];

                if (!empty($item['kode_barang'])) {
                    $data['kode_barang'] = $item['kode_barang'];
                } else {
                    $data['kode_barang'] = 'BRG-' . date('Ymd') . '-' . str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
                }

                if (!empty($item['kategori'])) {
                    $k = $kategoriMap[strtolower(trim($item['kategori']))] ?? null;
                    $data['kategori_id'] = $k?->id;
                    if (!$k) $errors[] = "Baris " . ($i + 1) . ": Kategori '{$item['kategori']}' tidak ditemukan";
                }

                if (!empty($item['supplier'])) {
                    $s = $supplierMap[strtolower(trim($item['supplier']))] ?? null;
                    $data['supplier_id'] = $s?->id;
                    if (!$s) $errors[] = "Baris " . ($i + 1) . ": Supplier '{$item['supplier']}' tidak ditemukan";
                }

                if (!empty($item['gudang'])) {
                    $g = $gudangMap[strtolower(trim($item['gudang']))] ?? null;
                    $data['gudang_id'] = $g?->id;
                    if (!$g) $errors[] = "Baris " . ($i + 1) . ": Gudang '{$item['gudang']}' tidak ditemukan";
                }

                $existing = Barang::whereRaw('LOWER(nama) = ?', [strtolower($nama)])->first();
                if ($existing) {
                    $existing->update($data);
                    $success++;
                } else {
                    Barang::create($data);
                    $success++;
                }
            } catch (\Exception $e) {
                $errors[] = "Baris " . ($i + 1) . ": " . $e->getMessage();
            }
        }

        return response()->json([
            'success' => $success,
            'errors' => $errors,
        ]);
    }
}
