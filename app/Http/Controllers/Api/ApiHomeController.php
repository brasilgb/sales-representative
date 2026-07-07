<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Region;
use App\Models\User;

class ApiHomeController extends Controller
{
    public function getAllData()
    {
        $currentUser = auth()->user();

        $users = $currentUser?->canManageTeam()
            ? User::get()
            : User::whereKey($currentUser?->id)->get();
        $orders = Order::visibleTo()->with('customer.region')->get();
        $products = Product::get();
        $customers = Customer::visibleTo()->with('region')->get();
        $regions = $currentUser?->canManageTeam()
            ? Region::where('status', true)->orderBy('name')->get()
            : $currentUser?->regions()->where('status', true)->orderBy('name')->get();
        $flex = Order::visibleTo()->sum('flex');
        $discount = Order::visibleTo()->sum('discount');
        $campaigns = Campaign::active()
            ->select(['id', 'name', 'audience_type', 'region_id', 'starts_at', 'ends_at', 'public_token'])
            ->when(! $currentUser?->canManageTeam(), function ($query) use ($currentUser) {
                $regionIds = $currentUser?->regions()->pluck('regions.id') ?? collect();

                $query->where(function ($query) use ($regionIds) {
                    $query->where('audience_type', 'all')
                        ->orWhere(function ($query) use ($regionIds) {
                            $query->where('audience_type', 'region')->whereIn('region_id', $regionIds);
                        });
                });
            })
            ->with('region:id,name')
            ->withCount('products')
            ->orderBy('ends_at')
            ->get()
            ->map(fn (Campaign $campaign) => [
                ...$campaign->toArray(),
                'public_url' => route('campaigns.public', $campaign->public_token),
            ]);

        $dataApp = [
            'user' => $users,
            'orders' => $orders,
            'products' => $products,
            'customers' => $customers,
            'regions' => $regions,
            'flex' => $flex,
            'discount' => $discount,
            'campaigns' => $campaigns,
        ];

        return response()->json([
            'success' => true,
            'data' => $dataApp,
        ]);
    }
}
