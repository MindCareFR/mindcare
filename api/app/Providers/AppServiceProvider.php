<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use App\Services\EncryptionService;
use App\Services\GovernmentApiService;
use App\Services\AccountValidationService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register()
    {
        $this->app->singleton(EncryptionService::class);
        $this->app->singleton(GovernmentApiService::class);
        $this->app->singleton(AccountValidationService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        if (config('schema.auto_migrate')) {
            Schema::sync(config('schema.schema'));
        }
    }
}
