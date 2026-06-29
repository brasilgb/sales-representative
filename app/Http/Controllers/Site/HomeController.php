<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\Admin\Plan;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('site/home/index', [
            'plans' => Plan::with('periods')->where('is_public', true)->orderBy('price')->get(),
        ]);
    }
}
