<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionLog extends Model
{
  protected $table = 'session_logs';
  public $timestamps = false;

  protected $fillable = [
    'message',
    'user_uuid',
    'created_at'
  ];

  protected $casts = [
    'created_at' => 'datetime'
  ];

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_uuid', 'uuid');
  }
}
