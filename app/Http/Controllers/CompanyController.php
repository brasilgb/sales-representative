<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CompanyController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('app/company/index', [
            'company' => $request->user()->tenant,
            'canEdit' => $request->user()->canManageTeam(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->canManageTeam(), 403);

        $tenant = $request->user()->tenant;
        $data = $request->validate([
            'company' => ['required', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'cnpj' => [
                'required',
                'string',
                'cpf_ou_cnpj',
                Rule::unique('tenants', 'cnpj')->ignore($tenant->id),
            ],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'whatsapp' => ['required', 'string', 'max:20'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'state' => ['nullable', 'string', 'max:50'],
            'city' => ['nullable', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:80'],
            'number' => ['nullable', 'string', 'max:50'],
            'complement' => ['nullable', 'string', 'max:80'],
        ], [], [
            'company' => 'razão social',
            'cnpj' => 'CPF/CNPJ',
            'email' => 'e-mail',
            'phone' => 'telefone',
        ]);

        if ($request->hasFile('logo')) {
            if ($tenant->logo) {
                Storage::disk('public')->delete($tenant->logo);
            }

            $data['logo'] = $request->file('logo')->store('company-logos', 'public');
        } else {
            unset($data['logo']);
        }

        $tenant->update($data);

        return redirect()->route('app.company.index')->with('success', 'Dados da empresa atualizados com sucesso!');
    }
}
