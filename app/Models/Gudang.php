<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gudang extends Model
{
    protected $fillable = ['nama', 'lokasi'];

    public function barang()
    {
        return $this->hasMany(Barang::class);
    }
}
