<?php

namespace App\Models;

class UserPatient extends User
{
  protected $table = 'user_patients';

  protected $fillable = [
    'gender',
    'is_anonymous',
  ];

  protected $casts = [
    'is_anonymous' => 'boolean',
  ];
}
