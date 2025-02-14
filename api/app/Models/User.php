<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
		'role_id'
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

	public function notifications(): HasMany
	{
		return $this->hasMany(Notification::class);
	}

	public function role(): BelongsTo
	{
		return $this->belongsTo(Role::class);
	}
}
