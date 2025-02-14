<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BusinessLog extends Model
{
  protected $table = 'business_logs';
  public $timestamps = false;

  protected $fillable = [
    'user_id',
    'action_type',
    'description',
    'meta_data',
    'status',
    'created_at'
  ];

  protected $casts = [
    'meta_data' => 'json',
    'created_at' => 'datetime'
  ];
}
