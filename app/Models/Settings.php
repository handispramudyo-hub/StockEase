<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    protected $table = 'settings';

    protected $fillable = ['nama_aplikasi', 'nama_perusahaan', 'alamat', 'telepon', 'email', 'website', 'logo', 'footer'];
}
