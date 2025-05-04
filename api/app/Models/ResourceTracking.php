<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ResourceTracking extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_uuid',
        'resource_type',
        'resource_id',
        'action',
        'duration',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function resource()
    {
        return $this->morphTo();
    }
}