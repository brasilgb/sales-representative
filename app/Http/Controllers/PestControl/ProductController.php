<?php

namespace App\Http\Controllers\PestControl;

use App\Http\Controllers\Controller;
use App\Models\PestControl\Product;
use App\Services\PestControl\PestControlAuditLogger;
use App\Services\PestControl\PestControlPermissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function __construct(
        private readonly PestControlPermissions $permissions,
        private readonly PestControlAuditLogger $auditLogger,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $this->authorize();
        $data = $this->validated($request);

        $product = Product::create($data);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'product.created', $product, $data);

        return back()->with('success', 'Produto cadastrado com sucesso!');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $this->authorize();
        $data = $this->validated($request, $product);

        $product->update($data);
        $this->auditLogger->log($request->user()->tenant, $request->user(), 'product.updated', $product, $data);

        return back()->with('success', 'Produto atualizado com sucesso!');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->authorize();

        if ($product->controlPoints()->exists()) {
            return back()->with('error', 'Não é possível excluir um produto vinculado a pontos de controle.');
        }

        $this->auditLogger->log($request->user()->tenant, $request->user(), 'product.deleted', $product);
        $product->delete();

        return back()->with('success', 'Produto excluído com sucesso!');
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('pest_control_products', 'name')->ignore($product?->id)->where('tenant_id', $request->user()->tenant_id),
            ],
            'registration_number' => ['nullable', 'string', 'max:100'],
            'default_consumption_type' => ['nullable', 'string', 'max:50'],
            'unit' => ['nullable', 'string', 'max:20'],
            'active' => ['nullable', 'boolean'],
        ]);
    }

    private function authorize(): void
    {
        abort_unless($this->permissions->has(auth()->user(), 'pest_control.settings.manage'), 403);
    }
}
