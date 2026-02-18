<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class GymUserController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = User::where('gym_id', $gymId)
            ->with('roleDefinition')
            ->whereIn('role', ['gym_admin', 'gym_staff'])
            ->when($request->search, fn ($q, $search) => $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->orderBy('created_at', 'desc');

        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:gym_admin,gym_staff',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        if ($validated['role'] === 'gym_staff') {
            if (empty($validated['role_id'])) {
                return response()->json(['message' => 'Role is required for staff users.'], 422);
            }
            $role = Role::where('id', $validated['role_id'])->where('gym_id', $gymId)->first();
            if (! $role) {
                return response()->json(['message' => 'Invalid role for this gym.'], 422);
            }
        } else {
            $validated['role_id'] = null;
        }

        $validated['gym_id'] = $gymId;
        $validated['password'] = Hash::make($validated['password']);
        unset($validated['role']); // we set it below
        $user = User::create(array_merge($validated, ['role' => $request->input('role', 'gym_staff')]));

        return $user->load('roleDefinition');
    }

    public function show(Request $request, User $user)
    {
        $gymId = $this->requireGymId($request);
        if ($user->gym_id !== $gymId) {
            abort(404);
        }
        return $user->load('roleDefinition');
    }

    public function update(Request $request, User $user)
    {
        $gymId = $this->requireGymId($request);
        if ($user->gym_id !== $gymId) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'sometimes|string|in:gym_admin,gym_staff',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        if (isset($validated['role']) && $validated['role'] === 'gym_staff' && ! empty($validated['role_id'])) {
            $role = Role::where('id', $validated['role_id'])->where('gym_id', $gymId)->first();
            if (! $role) {
                return response()->json(['message' => 'Invalid role for this gym.'], 422);
            }
        }
        if (isset($validated['role']) && $validated['role'] === 'gym_admin') {
            $validated['role_id'] = null;
        }
        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);
        return $user->load('roleDefinition');
    }

    public function destroy(Request $request, User $user)
    {
        $gymId = $this->requireGymId($request);
        if ($user->gym_id !== $gymId) {
            abort(404);
        }
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }
        $user->delete();
        return response()->json(null, 204);
    }
}
