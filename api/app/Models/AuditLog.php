<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
  protected $table = 'audit_logs';
  public $timestamps = false;

  protected $fillable = [
    'user_id',
    'entity_type',
    'entity_id',
    'action',
    'old_values',
    'new_values',
    'ip_address',
    'user_agent',
    'created_at'
  ];

  protected $casts = [
    'old_values' => 'json',
    'new_values' => 'json',
    'created_at' => 'datetime'
  ];
}
