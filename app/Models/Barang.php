<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    protected $fillable = [
        'kode_barang', 'barcode', 'nama', 'kategori_id', 'supplier_id', 'gudang_id',
        'harga_beli', 'harga_jual', 'stok', 'stok_minimum', 'satuan', 'gambar', 'status',
    ];

    protected function casts(): array
    {
        return [
            'harga_beli' => 'decimal:2',
            'harga_jual' => 'decimal:2',
            'stok' => 'integer',
            'stok_minimum' => 'integer',
        ];
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function gudang()
    {
        return $this->belongsTo(Gudang::class);
    }
}
