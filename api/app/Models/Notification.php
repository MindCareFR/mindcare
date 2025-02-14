<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
  protected $table = 'notifications';

  protected $fillable = [
    'user_type',
    'value',
    'user_uuid'
  ];

  protected $casts = [
    'created_at' => 'datetime',
    'deleted_at' => 'datetime',
  ];

  use SoftDeletes;

  public function user(): BelongsTo
  {
    return $this->belongsTo(User::class, 'user_uuid', 'uuid');
  }
}
