<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserProfessional extends Model
{
    use HasUuids;

    protected $table = 'user_professionals';

    protected $primaryKey = 'uuid';

    public $timestamps = false;

    protected $fillable = [
        'uuid',
        'languages',
        'experience',
        'certification',
        'company_name',
        'medical_identification_number',
        'company_identification_number',
    ];

    protected $casts = [
        'languages' => 'array',
        'experience' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uuid', 'uuid');
    }

    public function therapyDomains(): BelongsToMany
    {
        return $this->belongsToMany(TherapyDomain::class, 'professional_therapy_domain', 'professional_uuid', 'therapy_domain_id');
    }
}
