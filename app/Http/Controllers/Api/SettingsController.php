<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show($id = null)
    {
        return response()->json(Settings::firstOrCreate(['id' => $id ?? 1]));
    }

    public function update(Request $request, $id = null)
    {
        $settings = Settings::firstOrCreate(['id' => $id ?? 1]);
        $settings->update($request->all());
        return response()->json($settings);
    }
}
