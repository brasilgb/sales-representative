<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AuxiliaryAppController extends Controller
{
    public function index(): Response
    {
        $filename = 'vetor-pet-app.apk';
        $path = public_path('apk/'.$filename);
        $available = is_file($path);

        return Inertia::render('app/auxiliary-apps/index', [
            'app' => [
                'name' => 'VetorPet Android',
                'filename' => $filename,
                'url' => asset('apk/'.$filename),
                'available' => $available,
                'size' => $available ? $this->formatFileSize((int) filesize($path)) : null,
            ],
        ]);
    }

    private function formatFileSize(int $bytes): string
    {
        return $bytes >= 1024 * 1024
            ? number_format($bytes / (1024 * 1024), 1, ',', '.').' MB'
            : number_format($bytes / 1024, 1, ',', '.').' KB';
    }
}
