<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Gym;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscription::with(['gym', 'plan'])
            ->when($request->gym_id, fn ($q, $id) => $q->where('gym_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('created_at', 'desc');
        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'gym_id' => 'required|exists:gyms,id',
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'status' => 'required|in:trial,active,past_due,cancelled,expired',
            'trial_ends_at' => 'nullable|date',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);
        return Subscription::create($validated)->load(['gym', 'plan']);
    }

    public function show(Subscription $subscription)
    {
        return $subscription->load(['gym', 'plan']);
    }

    public function update(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'subscription_plan_id' => 'sometimes|exists:subscription_plans,id',
            'status' => 'sometimes|in:trial,active,past_due,cancelled,expired',
            'trial_ends_at' => 'nullable|date',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
        ]);
        $subscription->update($validated);
        return $subscription->load(['gym', 'plan']);
    }
}
