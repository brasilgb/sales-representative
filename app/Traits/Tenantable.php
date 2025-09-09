<?php

namespace App;


use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
// use App\Helpers\CustomHelpers;

trait Tenantable
{
    protected static function bootTenantable()
    {
        static::addGlobalScope(new TenantScope);
        if (checkTenantId()) {
            static::creating(function ($model) {
                $model->tenant_id = session('tenant_id');
            });
        }
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
    
}
