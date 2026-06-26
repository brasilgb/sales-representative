<?php

use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
