<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Aktivitas extends Model
{
    public $timestamps = false;

    protected $table = 'aktivitas';

    protected $fillable = ['user_id', 'aktivitas', 'waktu'];

    protected function casts(): array
    {
        return [
            'waktu' => 'datetime',
        ];
    }
}
