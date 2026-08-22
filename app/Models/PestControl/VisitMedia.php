<?php

namespace App\Models\PestControl;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class VisitMedia extends Model
{
    protected $table = 'pest_control_visit_media';

    protected $appends = ['url'];

    public const TYPE_PHOTO = 'photo';

    public const TYPE_ATTACHMENT = 'attachment';

    protected $fillable = [
        'tenant_id',
        'visit_id',
        'inspection_id',
        'type',
        'path',
        'caption',
        'taken_at',
        'latitude',
        'longitude',
        'uploaded_by_id',
    ];

    protected function casts(): array
    {
        return [
            'taken_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(VisitInspection::class, 'inspection_id');
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_id');
    }

    public function getUrlAttribute(): ?string
    {
        return $this->path ? Storage::disk('public')->url($this->path) : null;
    }
}
