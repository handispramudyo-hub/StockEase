<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $fillable = ['nama', 'warna'];

    public function barang()
    {
        return $this->hasMany(Barang::class);
    }
}
