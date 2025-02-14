<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MailLog extends Model
{
  protected $table = 'mail_logs';
  public $timestamps = false;

  protected $fillable = [
    'object',
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
