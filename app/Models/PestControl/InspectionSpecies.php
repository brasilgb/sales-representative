<?php

namespace App\Models\PestControl;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Linha de "praga encontrada" dentro de uma inspeção, com contagem de vivos
 * e mortos por espécie. Não usa Tenantable: o isolamento por tenant vem da
 * inspeção/visita pai (a tabela nem tem tenant_id).
 */
class InspectionSpecies extends Model
{
    protected $table = 'pest_control_inspection_species';

    protected $fillable = [
        'inspection_id',
        'species_id',
        'live_count',
        'dead_count',
    ];

    protected function casts(): array
    {
        return [
            'live_count' => 'integer',
            'dead_count' => 'integer',
        ];
    }

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(VisitInspection::class, 'inspection_id');
    }

    public function species(): BelongsTo
    {
        return $this->belongsTo(PestSpecies::class, 'species_id');
    }
}
