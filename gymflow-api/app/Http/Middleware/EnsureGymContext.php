<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureGymContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        if ($user->isSuperAdmin()) {
            return $next($request);
        }
        if (! $user->gym_id) {
            return response()->json(['message' => 'No gym assigned to this account.'], 403);
        }
        return $next($request);
    }
}
