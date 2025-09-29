<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserPatient extends Model
{
    use HasUuids;

    protected $table = 'user_patients';

    protected $primaryKey = 'uuid';

    public $timestamps = false;

    protected $fillable = [
        'uuid',
        'gender',
        'is_anonymous',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uuid', 'uuid');
    }
}
