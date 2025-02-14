<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TherapyDomain extends Model
{
  protected $table = 'therapy_domains';

  protected $fillable = [
    'name',
    'description',
    'is_active'
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'created_at' => 'datetime',
    'updated_at' => 'datetime'
  ];

  public function professionals(): BelongsToMany
  {
    return $this->belongsToMany(UserProfessional::class, 'professional_therapy_domain', 'therapy_domain_id', 'professional_uuid');
  }
}
