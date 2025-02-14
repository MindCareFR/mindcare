<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class UserProfessional extends User
{
  protected $table = 'user_professionals';

  protected $fillable = [
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

  public function therapyDomains(): BelongsToMany
  {
    return $this->belongsToMany(TherapyDomain::class, 'professional_therapy_domain', 'professional_uuid', 'therapy_domain_id');
  }
}
