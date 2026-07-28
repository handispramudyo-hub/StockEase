<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Barang;
use App\Models\StokMasuk;
use App\Models\StokKeluar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalBarang = Barang::count();

        $totalNilaiStok = Barang::sum(DB::raw('stok * harga_jual'));

        $stokMasukHariIni = StokMasuk::whereDate('tanggal', today())->sum('qty');

        $stokKeluarHariIni = StokKeluar::whereDate('tanggal', today())->sum('qty');

        $stokMenipis = Barang::where('stok', '<=', DB::raw('stok_minimum'))
            ->where('stok', '>', 0)
            ->count();

        $stokHabis = Barang::where('stok', 0)->count();

        return response()->json([
            'total_barang' => $totalBarang,
            'total_nilai_stok' => $totalNilaiStok,
            'stok_masuk_hari_ini' => $stokMasukHariIni,
            'stok_keluar_hari_ini' => $stokKeluarHariIni,
            'stok_menipis' => $stokMenipis,
            'stok_habis' => $stokHabis,
        ]);
    }
}
