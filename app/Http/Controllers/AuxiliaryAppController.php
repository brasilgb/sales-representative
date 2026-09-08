<?php

namespace App\Http\Controllers;

use App\Models\TenantModule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuxiliaryAppController extends Controller
{
    public function index(Request $request): Response
    {
        $apps = [
            $this->buildApp(
                name: 'VetorPet Android',
                description: 'Agenda, consulta de produtos e emissão de pedidos para vendedores e representantes.',
                filename: 'vetor-pet-app.apk',
            ),
        ];

        // App de Controle de Pragas: só aparece para baixar quando o módulo estiver
        // ativo para o tenant (ativação exclusiva do rootAdmin), mesmo critério usado
        // para exibir o menu "Controle de Pragas" (ver app-sidebar.tsx).
        if ($request->user()?->tenant?->hasActiveModule(TenantModule::KEY_PEST_CONTROL)) {
            $apps[] = $this->buildApp(
                name: 'VetorPet Pragas',
                description: 'Agenda de visitas, check-in/check-out e inspeções para técnicos do Controle de Pragas.',
                filename: 'pest-control-app.apk',
            );
        }

        return Inertia::render('app/auxiliary-apps/index', [
            'apps' => $apps,
        ]);
    }

    private function buildApp(string $name, string $description, string $filename): array
    {
        $path = public_path('apk/'.$filename);
        $available = is_file($path);

        return [
            'name' => $name,
            'description' => $description,
            'filename' => $filename,
            'url' => asset('apk/'.$filename),
            'available' => $available,
            'size' => $available ? $this->formatFileSize((int) filesize($path)) : null,
        ];
    }

    private function formatFileSize(int $bytes): string
    {
        return $bytes >= 1024 * 1024
            ? number_format($bytes / (1024 * 1024), 1, ',', '.').' MB'
            : number_format($bytes / 1024, 1, ',', '.').' KB';
    }
}
