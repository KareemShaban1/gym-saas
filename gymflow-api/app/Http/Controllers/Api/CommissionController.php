<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Commission::where('gym_id', $gymId)->with(['trainer', 'member'])
            ->when($request->trainer_id, fn ($q, $id) => $q->where('trainer_id', $id))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderBy('date', 'desc');

        if ($request->has('per_page')) {
            return $query->paginate((int) $request->per_page ?: 20);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate([
            'trainer_id' => 'required|exists:trainers,id',
            'member_id' => 'nullable|exists:members,id',
            'type' => 'required|in:session,subscription,bonus',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'status' => 'nullable|in:paid,pending',
            'note' => 'nullable|string',
        ]);
        $validated['gym_id'] = $gymId;
        $validated['status'] = $validated['status'] ?? 'pending';

        \App\Models\Trainer::where('id', $validated['trainer_id'])->where('gym_id', $gymId)->firstOrFail();
        if (! empty($validated['member_id'])) {
            \App\Models\Member::where('id', $validated['member_id'])->where('gym_id', $gymId)->firstOrFail();
        }

        return Commission::create($validated)->load(['trainer', 'member']);
    }

    public function show(Request $request, Commission $commission)
    {
        if ($commission->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $commission->load(['trainer', 'member']);
    }

    public function update(Request $request, Commission $commission)
    {
        if ($commission->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'trainer_id' => 'sometimes|exists:trainers,id',
            'member_id' => 'nullable|exists:members,id',
            'type' => 'sometimes|in:session,subscription,bonus',
            'amount' => 'sometimes|numeric|min:0',
            'date' => 'sometimes|date',
            'status' => 'sometimes|in:paid,pending',
            'note' => 'nullable|string',
        ]);
        if (isset($validated['trainer_id'])) {
            \App\Models\Trainer::where('id', $validated['trainer_id'])->where('gym_id', $commission->gym_id)->firstOrFail();
        }
        $commission->update($validated);

        return $commission->load(['trainer', 'member']);
    }

    public function destroy(Request $request, Commission $commission)
    {
        if ($commission->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $commission->delete();

        return response()->json(['message' => 'Commission deleted']);
    }
}
