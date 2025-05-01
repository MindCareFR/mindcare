<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'professional_uuid',
        'patient_uuid',
        'start_time',
        'end_time',
        'status',
        'notes',
        'prescription'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function professional(): BelongsTo
    {
        return $this->belongsTo(UserProfessional::class, 'professional_uuid', 'uuid');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(UserPatient::class, 'patient_uuid', 'uuid');
    }
}