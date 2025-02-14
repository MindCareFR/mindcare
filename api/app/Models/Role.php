<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
  protected $table = 'roles';

  protected $fillable = [
    'name'
  ];

  public function users(): HasMany
  {
    return $this->hasMany(UserPatient::class);
  }

  public function professionals(): HasMany
  {
    return $this->hasMany(UserProfessional::class);
  }
}
