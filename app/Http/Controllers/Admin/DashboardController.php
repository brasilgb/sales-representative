<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $metrics = [
            "users" => User::get(),
            "companies" => Tenant::get()
        ];
        return Inertia::render('admin/dashboard/index', ['metrics' => $metrics]);
    }
}
