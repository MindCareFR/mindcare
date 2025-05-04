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

    // Scopes pour filtrer facilement
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now());
    }

    public function scopePast($query)
    {
        return $query->where('end_time', '<', now());
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Méthodes utilitaires
    public function isPast()
    {
        return $this->end_time < now();
    }

    public function isUpcoming()
    {
        return $this->start_time > now();
    }

    public function isCanceled()
    {
        return $this->status === 'canceled';
    }
}
