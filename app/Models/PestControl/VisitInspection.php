<?php

namespace App\Models\PestControl;

use App\Models\User;
use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VisitInspection extends Model
{
    use Tenantable;

    protected $table = 'pest_control_visit_inspections';

    protected $appends = ['photo_url'];

    // Legenda de consumo identificada nos documentos originais.
    public const CONSUMPTION_NONE = '0';

    public const CONSUMPTION_HALF = '0.5';

    public const CONSUMPTION_FULL = '1';

    public const CONSUMPTION_SPOILED = 'E';

    protected $fillable = [
        'tenant_id',
        'uuid',
        'visit_id',
        'control_point_id',
        'technician_id',
        'inspected_at',
        'product_id',
        'consumption_type',
        'consumption_code',
        'replaced',
        'device_condition',
        'live_count',
        'dead_count',
        'notes',
        'photo_path',
        'latitude',
        'longitude',
        'not_inspected',
        'not_inspected_reason',
    ];

    protected function casts(): array
    {
        return [
            'inspected_at' => 'datetime',
            'replaced' => 'boolean',
            'live_count' => 'integer',
            'dead_count' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'not_inspected' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (VisitInspection $inspection) {
            $inspection->uuid ??= (string) Str::uuid();
        });
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function controlPoint(): BelongsTo
    {
        return $this->belongsTo(ControlPoint::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function speciesFound(): HasMany
    {
        return $this->hasMany(InspectionSpecies::class, 'inspection_id');
    }

    public function media(): HasMany
    {
        return $this->hasMany(VisitMedia::class, 'inspection_id');
    }

    public function requiresReplacement(): bool
    {
        return in_array($this->consumption_code, [self::CONSUMPTION_FULL, self::CONSUMPTION_SPOILED], true);
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null;
    }
}
