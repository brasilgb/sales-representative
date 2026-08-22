<?php

namespace App\Models\PestControl;

use App\Models\User;
use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Visit extends Model
{
    use Tenantable;

    protected $table = 'pest_control_visits';

    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_DRAFT = 'draft';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_SYNCED = 'synced';

    public const STATUS_VALIDATED = 'validated';

    public const STATUS_CANCELED = 'canceled';

    protected $fillable = [
        'tenant_id',
        'uuid',
        'establishment_id',
        'technician_id',
        'created_by_id',
        'scheduled_at',
        'service_type',
        'status',
        'checkin_at',
        'checkin_received_at',
        'checkin_latitude',
        'checkin_longitude',
        'checkin_accuracy_meters',
        'checkin_distance_meters',
        'checkin_justification',
        'checkout_at',
        'checkout_received_at',
        'checkout_latitude',
        'checkout_longitude',
        'checkout_accuracy_meters',
        'duration_seconds',
        'notes',
        'summary',
        'canceled_reason',
        'device_id',
        'app_version',
        'offline_capture',
        'form_version',
        'sync_status',
        'approved_by_id',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'checkin_at' => 'datetime',
            'checkin_received_at' => 'datetime',
            'checkin_latitude' => 'decimal:7',
            'checkin_longitude' => 'decimal:7',
            'checkin_accuracy_meters' => 'decimal:2',
            'checkin_distance_meters' => 'decimal:2',
            'checkout_at' => 'datetime',
            'checkout_received_at' => 'datetime',
            'checkout_latitude' => 'decimal:7',
            'checkout_longitude' => 'decimal:7',
            'checkout_accuracy_meters' => 'decimal:2',
            'duration_seconds' => 'integer',
            'offline_capture' => 'boolean',
            'form_version' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Visit $visit) {
            $visit->uuid ??= (string) Str::uuid();
        });
    }

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(VisitInspection::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(VisitMedia::class);
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(VisitSignature::class)->orderByDesc('version');
    }

    public function activeSignature(): ?VisitSignature
    {
        return $this->signatures->firstWhere('superseded', false);
    }

    public function isCheckedIn(): bool
    {
        return $this->checkin_at !== null;
    }

    public function isCheckedOut(): bool
    {
        return $this->checkout_at !== null;
    }
}
