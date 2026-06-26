<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\Tenantable;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    public const ROLE_OWNER = 1;

    public const ROLE_SELLER = 2;

    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, Tenantable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'telephone',
        'whatsapp',
        'password',
        'roles',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }

    public function regions(): BelongsToMany
    {
        return $this->belongsToMany(Region::class)->withTimestamps();
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->tenant_id === null;
    }

    public function isOwner(): bool
    {
        return (int) $this->roles === self::ROLE_OWNER;
    }

    public function isSeller(): bool
    {
        return (int) $this->roles === self::ROLE_SELLER;
    }

    public function canManageTeam(): bool
    {
        return $this->isSuperAdmin() || $this->isOwner();
    }
}
