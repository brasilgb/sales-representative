<?php

namespace App\Models\PestControl;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VisitMedia extends Model
{
    protected $table = 'pest_control_visit_media';

    protected $appends = ['url'];

    public const TYPE_PHOTO = 'photo';

    public const TYPE_ATTACHMENT = 'attachment';

    // Categorias de evidência do app do técnico (ver app-tecnico.md, seção
    // EVIDÊNCIAS). Opcional: evidências antigas do painel web não têm uma.
    public const CATEGORY_INFESTATION = 'infestacao';

    public const CATEGORY_PRODUCT = 'produto';

    public const CATEGORY_DEVICE = 'dispositivo';

    public const CATEGORY_DAMAGE = 'dano';

    public const CATEGORY_INACCESSIBLE_POINT = 'ponto_inacessivel';

    public const CATEGORY_SITE_CONDITION = 'situacao_local';

    public const CATEGORY_SERVICE_COMPLETED = 'servico_concluido';

    protected $fillable = [
        'tenant_id',
        'uuid',
        'visit_id',
        'inspection_id',
        'type',
        'category',
        'path',
        'content_hash',
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

    protected static function booted(): void
    {
        static::creating(function (VisitMedia $media) {
            $media->uuid ??= (string) Str::uuid();
        });
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
