<?php

namespace App\Http\Controllers\Admin;

use App\Models\Admin\Setting;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        if (Setting::get()->isEmpty()) {
            Setting::create();
        }
        $settings = Setting::first();
        return Inertia::render('admin/settings/index', ["settings" => $settings]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Setting $setting)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Setting $setting)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
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

        return redirect()->route('admin.settings.index')->with('success', 'Dados das configurções alterados com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Setting $setting)
    {
        //
    }
}
