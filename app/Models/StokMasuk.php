<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StokMasuk extends Model
{
    protected $table = 'stok_masuks';

    protected $fillable = ['barang_id', 'qty', 'tanggal', 'keterangan', 'dari_siapa'];

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
