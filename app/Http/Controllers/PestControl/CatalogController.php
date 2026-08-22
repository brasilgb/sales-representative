<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Models\PestControl\Lookup;
use App\Models\PestControl\PestSpecies;
use App\Models\PestControl\Product;
use App\Services\PestControl\PestControlPermissions;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Reúne Produtos e Pragas/categorias (os cadastros de referência do módulo)
 * em uma única tela, já que são pequenas listas de apoio, não fluxos
 * operacionais como estabelecimentos e pontos.
 */
class CatalogController extends Controller
{
    public function __construct(private readonly PestControlPermissions $permissions) {}

    public function index(): Response
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.settings.manage'), 403);

        return Inertia::render('app/pest-control/catalog/index', [
            'products' => Product::orderBy('name')->get(),
            'species' => PestSpecies::orderBy('name')->get(),
            'pointCategories' => Lookup::where('group', Lookup::GROUP_POINT_CATEGORY)->orderBy('order')->get(),
            'consumptionTypes' => Lookup::where('group', Lookup::GROUP_CONSUMPTION_TYPE)->orderBy('order')->get(),
        ]);
    }
}
