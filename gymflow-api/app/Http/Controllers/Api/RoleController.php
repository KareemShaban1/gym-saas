<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $roles = Role::where('gym_id', $gymId)
            ->with('permissions')
            ->orderBy('name')
            ->get();
        return $roles;
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        $validated['gym_id'] = $gymId;
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        $permissionIds = $validated['permission_ids'] ?? [];
        unset($validated['permission_ids']);

        $role = Role::create($validated);
        $role->permissions()->sync($permissionIds);
        return $role->load('permissions');
    }

    public function show(Request $request, Role $role)
    {
        $gymId = $this->requireGymId($request);
        if ($role->gym_id !== $gymId) {
            abort(404);
        }
        return $role->load('permissions');
    }

    public function update(Request $request, Role $role)
    {
        $gymId = $this->requireGymId($request);
        if ($role->gym_id !== $gymId) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255',
            'permission_ids' => 'nullable|array',
            'permission_ids.*' => 'exists:permissions,id',
        ]);

        if (array_key_exists('permission_ids', $validated)) {
            $role->permissions()->sync($validated['permission_ids']);
            unset($validated['permission_ids']);
        }
        $role->update($validated);
        return $role->load('permissions');
    }

    public function destroy(Request $request, Role $role)
    {
        $gymId = $this->requireGymId($request);
        if ($role->gym_id !== $gymId) {
            abort(404);
        }
        if ($role->users()->exists()) {
            return response()->json(['message' => 'Cannot delete role that is assigned to users.'], 422);
        }
        $role->delete();
        return response()->json(null, 204);
    }
}
