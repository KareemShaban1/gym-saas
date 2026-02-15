<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSuperAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Unauthorized. Super admin only.'], 403);
        }

        return $next($request);
    }
}
