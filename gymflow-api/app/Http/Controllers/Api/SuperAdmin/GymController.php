<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Gym;
use Illuminate\Http\Request;

class GymController extends Controller
{
    public function index(Request $request)
    {
        $query = Gym::with(['activeSubscription.plan', 'users'])
            ->when($request->search, fn ($q, $v) => $q->where('name', 'like', "%{$v}%")->orWhere('email', 'like', "%{$v}%"))
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->orderBy('created_at', 'desc');
        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 15)
            : $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:gyms,email',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'status' => 'required|in:trial,active,suspended,cancelled',
            'timezone' => 'nullable|string|max:50',
        ]);
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        return Gym::create($validated);
    }

    public function show(Gym $gym)
    {
        return $gym->load([
            'activeSubscription.plan',
            'users',
            'branches',
            'subscriptions.plan',
        ]);
    }

    public function update(Request $request, Gym $gym)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:gyms,email,' . $gym->id,
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'status' => 'sometimes|in:trial,active,suspended,cancelled',
            'timezone' => 'nullable|string|max:50',
            'logo' => 'nullable|string',
        ]);
        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }
        $gym->update($validated);
        return $gym->load('activeSubscription.plan');
    }

    public function destroy(Gym $gym)
    {
        $gym->delete();
        return response()->json(['message' => 'Gym deleted']);
    }

    public function stats()
    {
        $totalGyms = Gym::count();
        $activeGyms = Gym::where('status', 'active')->count();
        $trialGyms = Gym::where('status', 'trial')->count();
        return response()->json([
            'total_gyms' => $totalGyms,
            'active_gyms' => $activeGyms,
            'trial_gyms' => $trialGyms,
        ]);
    }
}
