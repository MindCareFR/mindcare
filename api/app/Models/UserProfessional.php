<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserProfessional extends Model
{
    use HasUuids;
    
    protected $table = 'user_professionals';
    
    protected $primaryKey = 'uuid';
    
    public $incrementing = false;
    
    public $timestamps = false;

    protected $fillable = [
        'uuid',
        'languages',
        'experience',
        'certification',
        'specialties',
        'availability_hours',
        'biography',
        'education',
        'company_name',
        'medical_identification_number',
        'company_identification_number',
    ];

    protected $casts = [
        'languages' => 'array',
        'experience' => 'integer',
        'specialties' => 'array',
        'availability_hours' => 'array',
        'education' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uuid', 'uuid');
    }

    public function therapyDomains(): BelongsToMany
    {
        return $this->belongsToMany(TherapyDomain::class, 'professional_therapy_domain', 'professional_uuid', 'therapy_domain_id');
    }
    
    public function reviews(): HasMany
    {
        return $this->hasMany(UserReview::class, 'professional_uuid', 'uuid');
    }
    
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->where('is_approved', true)->avg('rating') ?? 0;
    }
    
    public function getReviewsCountAttribute()
    {
        return $this->reviews()->where('is_approved', true)->count();
    }
}