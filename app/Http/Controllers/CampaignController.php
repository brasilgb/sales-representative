<?php

namespace App\Http\Controllers;

use App\Http\Requests\CampaignRequest;
use App\Models\Campaign;
use App\Models\Product;
use App\Models\Region;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('app.intelligence.index');
    }

    public function create(): Response
    {
        $this->authorizeCampaignManagement();
        $this->authorizeFeature();

        return Inertia::render('app/campaigns/create-campaign', $this->formData());
    }

    public function store(CampaignRequest $request): RedirectResponse
    {
        $this->authorizeCampaignManagement();
        $this->authorizeFeature();

        $campaign = Campaign::create($this->campaignData($request));
        $campaign->products()->sync($request->validated('product_ids', []));

        return redirect()->route('app.intelligence.index')->with('success', 'Campanha cadastrada com sucesso!');
    }

    public function show(Campaign $campaign): RedirectResponse
    {
        return redirect()->route('app.campaigns.edit', $campaign);
    }

    public function edit(Campaign $campaign): Response
    {
        $this->authorizeCampaignManagement();
        $this->authorizeFeature();

        return Inertia::render('app/campaigns/edit-campaign', [
            ...$this->formData(),
            'campaign' => $campaign->load('products:id'),
        ]);
    }

    public function update(CampaignRequest $request, Campaign $campaign): RedirectResponse
    {
        $this->authorizeCampaignManagement();
        $this->authorizeFeature();

        $campaign->update($this->campaignData($request));
        $campaign->products()->sync($request->validated('product_ids', []));

        return redirect()->route('app.campaigns.edit', $campaign)->with('success', 'Campanha alterada com sucesso!');
    }

    public function destroy(Campaign $campaign): RedirectResponse
    {
        $this->authorizeCampaignManagement();
        $this->authorizeFeature();

        $campaign->delete();

        return redirect()->route('app.intelligence.index')->with('success', 'Campanha excluída com sucesso!');
    }

    private function formData(): array
    {
        return [
            'products' => Product::where('enabled', true)->orderBy('name')->get(['id', 'reference', 'name', 'brand', 'category']),
            'regions' => Region::where('status', true)->orderBy('name')->get(['id', 'name']),
            'brands' => Product::whereNotNull('brand')->distinct()->orderBy('brand')->pluck('brand')->values(),
            'categories' => Product::whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
        ];
    }

    private function campaignData(CampaignRequest $request): array
    {
        $data = $request->validated();
        unset($data['product_ids']);

        if ($data['scope_type'] !== 'product') {
            $data['product_id'] = null;
        }

        if ($data['scope_type'] !== 'region') {
            $data['region_id'] = null;
        }

        if ($data['scope_type'] !== 'brand') {
            $data['brand'] = null;
        }

        if ($data['scope_type'] !== 'category') {
            $data['category'] = null;
        }

        $data['status'] = (bool) ($data['status'] ?? false);

        return $data;
    }

    public function publicCatalog(string $token): Response
    {
        $campaign = Campaign::withoutGlobalScopes()->where('public_token', $token)->where('status', true)->with(['products' => fn ($query) => $query->where('enabled', true), 'tenant'])->firstOrFail();
        abort_if($campaign->starts_at && $campaign->starts_at->isFuture(), 404);
        abort_if($campaign->ends_at && $campaign->ends_at->isPast(), 404);

        return Inertia::render('site/campaigns/show', ['campaign' => $campaign]);
    }

    private function authorizeCampaignManagement(): void
    {
        abort_unless(auth()->user()?->canManageTeam(), 403);
    }

    private function authorizeFeature(): void
    {
        abort_unless(PlanLimits::forTenant()->hasFeature('campaigns'), 403);
    }
}
