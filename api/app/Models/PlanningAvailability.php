<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PlanningAvailability extends Model
{
    use HasUuids;

    protected $fillable = [
        'professional_uuid',
        'weekly_appointments'
    ];

    protected $casts = [
        'weekly_appointments' => 'array'
    ];

    public function professional()
    {
        return $this->belongsTo(UserProfessional::class, 'professional_uuid', 'uuid');
    }
}