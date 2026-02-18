<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /**
     * List all permissions (global, read-only for assigning to roles).
     */
    public function index(Request $request)
    {
        $permissions = Permission::orderBy('group')->orderBy('name')->get();
        return $permissions;
    }
}
