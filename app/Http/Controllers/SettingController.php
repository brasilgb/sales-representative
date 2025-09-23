<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Admin\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        if (Setting::get()->isEmpty()) {
            Setting::create();
        }
        $settings = Setting::first();
        return Inertia::render('app/settings/index', ["settings" => $settings]);
    }

    public function update(Request $request, Setting $setting)
    {
        $data = $request->all();

        $storePath = public_path('storage/logos');
        if ($request->hasfile('logo')) {
            $fileName = time() . '.' . $request->logo->extension();
            $request->logo->move($storePath, $fileName);
            if (file_exists($storePath . DIRECTORY_SEPARATOR . $setting->logo && $setting->logo)) {
                unlink($storePath . DIRECTORY_SEPARATOR . $setting->logo);
            }
        }
        // $data['logo'] = $request->hasfile('logo') ? $fileName : $setting->logo;
        Setting::where('id', $setting->id)->update([
            'name' =>  $data['name'],
            'logo' => $request->hasfile('logo') ? $fileName : $setting->logo
        ]);

        return redirect()->route('app.settings.index')->with('success', 'Dados das configurções alterados com sucesso!');
    }
}
