<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aktivitas;
use Illuminate\Http\Request;

class AktivitasController extends Controller
{
    public function index()
    {
        return response()->json(Aktivitas::orderByDesc('waktu')->get());
    }

    public function store(Request $request)
    {
        $aktivitas = Aktivitas::create($request->all());
        return response()->json($aktivitas, 201);
    }
}
