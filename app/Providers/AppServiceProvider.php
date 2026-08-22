<?php

namespace App\Providers;

use App\Listeners\SetTenantIdInSession;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Services\PestControl\PestControlProvisioner;
use App\Services\TenantModuleService;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            Login::class,
            SetTenantIdInSession::class
        );

        TenantModuleService::registerProvisioner(
            TenantModule::KEY_PEST_CONTROL,
            fn (Tenant $tenant) => app(PestControlProvisioner::class)->provisionForTenant($tenant),
        );
    }
}
