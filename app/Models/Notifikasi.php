<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    public $timestamps = false;

    protected $table = 'notifikasis';

    protected $fillable = ['judul', 'pesan', 'status', 'waktu'];

    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
        ];
    }
}
