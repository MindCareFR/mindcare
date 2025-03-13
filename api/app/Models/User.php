<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasUuids, Notifiable, SoftDeletes;

    protected $table = 'users';

    protected $primaryKey = 'uuid';

    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'email_verified',
        'password',
        'birthdate',
        'phone',
        'token',
        'address',
        'address_complement',
        'zipcode',
        'city',
        'country',
        'role_id',
        'profile_image'
    ];

    protected $hidden = [
        'password',
        'token',
    ];

    protected $casts = [
        'email_verified' => 'boolean',
        'birthdate' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
        'role_name'
    ];

    public function getFullNameAttribute()
    {
        return $this->firstname . ' ' . $this->lastname;
    }

    public function getRoleNameAttribute()
    {
        return $this->role ? $this->role->name : null;
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
    
    public function patientProfile(): HasOne
    {
        return $this->hasOne(UserPatient::class, 'uuid', 'uuid');
    }
    
    public function professionalProfile(): HasOne
    {
        return $this->hasOne(UserProfessional::class, 'uuid', 'uuid');
    }
    
    public function preferences(): HasOne
    {
        return $this->hasOne(UserPreference::class, 'user_uuid', 'uuid');
    }
    
    public function receivedReviews(): HasMany
    {
        return $this->hasMany(UserReview::class, 'professional_uuid', 'uuid');
    }
    
    public function submittedReviews(): HasMany
    {
        return $this->hasMany(UserReview::class, 'reviewer_uuid', 'uuid');
    }
    
    public function isProfessional()
    {
        return $this->role_name === 'ROLE_PRO';
    }
    
    public function isPatient()
    {
        return $this->role_name === 'ROLE_PATIENT';
    }

    public function getPublicProfile()
    {
        $profile = [
            'uuid' => $this->uuid,
            'full_name' => $this->full_name,
            'role' => $this->role_name,
        ];

        if ($this->preferences && $this->preferences->profile_visibility) {
            $visibility = $this->preferences->profile_visibility;
            
            if (!empty($visibility['email']) && $visibility['email']) {
                $profile['email'] = $this->email;
            }
            
            if (!empty($visibility['phone']) && $visibility['phone']) {
                $profile['phone'] = $this->phone;
            }
            
            if (!empty($visibility['address']) && $visibility['address']) {
                $profile['address'] = [
                    'address' => $this->address,
                    'address_complement' => $this->address_complement,
                    'zipcode' => $this->zipcode,
                    'city' => $this->city,
                    'country' => $this->country,
                ];
            }
            
            if ($this->isProfessional() && $this->professionalProfile) {
                $professionalProfile = $this->professionalProfile;
                
                if (!empty($visibility['specialties']) && $visibility['specialties']) {
                    $profile['specialties'] = $professionalProfile->specialties;
                }
                
                if (!empty($visibility['certification']) && $visibility['certification']) {
                    $profile['certification'] = $professionalProfile->certification;
                }
                
                if (!empty($visibility['biography']) && $visibility['biography']) {
                    $profile['biography'] = $professionalProfile->biography;
                }
                
                if (!empty($visibility['education']) && $visibility['education']) {
                    $profile['education'] = $professionalProfile->education;
                }
                
                if (!empty($visibility['experience']) && $visibility['experience']) {
                    $profile['experience'] = $professionalProfile->experience;
                }

                $profile['therapy_domains'] = $professionalProfile->therapyDomains()->pluck('name');
                $profile['availability_hours'] = $professionalProfile->availability_hours;
            }
            
            if ($this->isPatient() && $this->patientProfile) {
                if (!empty($visibility['birthdate']) && $visibility['birthdate']) {
                    $profile['birthdate'] = $this->birthdate;
                }
            }
        }
        
        return $profile;
    }
}