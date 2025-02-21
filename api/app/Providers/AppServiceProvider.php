<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use App\Services\EncryptionService;
use App\Services\GovernmentApiService;
use App\Services\AccountValidationService;
use Illuminate\Support\Facades\File;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
    }

    public function boot()
    {
    }
}