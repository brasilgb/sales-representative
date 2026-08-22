<?php

namespace App\Models\PestControl;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class VisitSignature extends Model
{
    protected $table = 'pest_control_visit_signatures';

    protected $appends = ['signature_url'];

    protected $fillable = [
        'tenant_id',
        'visit_id',
        'version',
        'responsible_name',
        'responsible_role',
        'responsible_document',
        'signature_path',
        'compliance_text',
        'notes',
        'signed_at',
        'latitude',
        'longitude',
        'content_hash',
        'superseded',
        'captured_by_id',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'signed_at' => 'datetime',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'superseded' => 'boolean',
        ];
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function capturedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'captured_by_id');
    }

    public function getSignatureUrlAttribute(): ?string
    {
        return $this->signature_path ? Storage::disk('public')->url($this->signature_path) : null;
    }
}
