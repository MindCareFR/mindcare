<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemLog extends Model
{
  protected $table = 'system_logs';
  public $timestamps = false;

  protected $fillable = [
    'message',
    'relation',
    'created_at'
  ];

  protected $casts = [
    'relation' => 'uuid',
    'created_at' => 'datetime'
  ];
}
