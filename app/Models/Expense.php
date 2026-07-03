<?php

namespace App\Models;

use App\Traits\Tenantable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Expense extends Model
{
    use Tenantable;

    protected $fillable = [
        'user_id',
        'expense_date',
        'category',
        'amount',
        'kilometers',
        'origin',
        'destination',
        'receipt_path',
        'description',
    ];

    protected $appends = ['receipt_url'];

    protected function casts(): array
    {
        return [
            'expense_date' => 'date:Y-m-d',
            'amount' => 'decimal:2',
            'kilometers' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getReceiptUrlAttribute(): ?string
    {
        return $this->receipt_path ? Storage::disk('public')->url($this->receipt_path) : null;
    }

    public function scopeVisibleTo(Builder $query, ?User $user = null): Builder
    {
        $user ??= auth()->user();

        if (! $user || $user->canManageTeam()) {
            return $query;
        }

        return $query->where('user_id', $user->id);
    }
}
