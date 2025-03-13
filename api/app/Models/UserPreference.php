<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class UserPreference extends Model
{
    use HasUuids;
    
    protected $table = 'user_preferences';
    
    protected $primaryKey = 'user_uuid';
    
    public $incrementing = false;
    
    protected $fillable = [
        'user_uuid',
        'app_notifications',
        'push_notifications',
        'email_notifications',
        'profile_visibility'
    ];
    
    protected $casts = [
        'app_notifications' => 'array',
        'push_notifications' => 'array',
        'email_notifications' => 'array',
        'profile_visibility' => 'array'
    ];
    
    // Définir des valeurs par défaut pour les préférences
    public static function getDefaultAppNotifications()
    {
        return [
            'messages' => true,
            'appointments' => true,
            'reminders' => true,
            'updates' => true
        ];
    }
    
    public static function getDefaultPushNotifications()
    {
        return [
            'messages' => true,
            'appointments' => true,
            'reminders' => true,
            'updates' => false
        ];
    }
    
    public static function getDefaultEmailNotifications()
    {
        return [
            'messages' => true,
            'appointments' => true,
            'reminders' => true,
            'updates' => true,
            'newsletter' => true
        ];
    }
    
    public static function getDefaultProfileVisibility($role)
    {
        if ($role === 'professional') {
            return [
                'full_name' => true,
                'phone' => true,
                'email' => true,
                'address' => true,
                'certification' => true,
                'specialties' => true,
                'biography' => true,
                'education' => true,
                'experience' => true
            ];
        } else {
            return [
                'full_name' => true,
                'email' => false,
                'phone' => false,
                'address' => false,
                'birthdate' => false
            ];
        }
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_uuid', 'uuid');
    }
}