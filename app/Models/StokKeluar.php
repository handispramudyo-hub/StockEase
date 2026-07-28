<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StokKeluar extends Model
{
    protected $table = 'stok_keluars';

    protected $fillable = ['barang_id', 'qty', 'tanggal', 'keterangan', 'tujuan'];

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'qty' => 'integer',
        ];
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class);
    }
}
