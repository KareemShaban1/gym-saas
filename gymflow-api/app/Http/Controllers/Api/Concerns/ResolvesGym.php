<?php

namespace App\Http\Controllers\Api\Concerns;

use Illuminate\Http\Request;

trait ResolvesGym
{
    /**
     * Resolve gym ID for the current request. Super admin can pass ?gym_id= to view a gym; otherwise use auth user's gym_id.
     */
    protected function gymId(Request $request): ?int
    {
        $user = $request->user();
        if ($user->isSuperAdmin() && $request->filled('gym_id')) {
            return (int) $request->gym_id;
        }
        return $user->gym_id;
    }

    /**
     * Require gym context (for gym dashboard). Returns 403 if no gym.
     */
    protected function requireGymId(Request $request): int
    {
        $gymId = $this->gymId($request);
        if (! $gymId) {
            abort(403, 'Gym context required. Only gym accounts can access this.');
        }
        return $gymId;
    }
}
