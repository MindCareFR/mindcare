<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserReview extends Model
{
    use HasUuids;
    
    protected $table = 'user_reviews';
    
    protected $fillable = [
        'reviewer_uuid',
        'professional_uuid',
        'rating',
        'comment',
        'is_approved',
        'is_anonymous'
    ];
    
    protected $casts = [
        'rating' => 'integer',
        'is_approved' => 'boolean',
        'is_anonymous' => 'boolean'
    ];
    
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_uuid', 'uuid');
    }
    
    public function professional(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professional_uuid', 'uuid');
    }
}