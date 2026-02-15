<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::with(['gym', 'creator'])
            ->when($request->gym_id, function ($q, $id) {
                if ($id === 'platform') {
                    return $q->whereNull('gym_id');
                }
                return $q->where('gym_id', $id);
            })
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->when($request->published !== null, fn ($q) => $q->where('is_published', $request->boolean('published')))
            ->orderBy('created_at', 'desc');
        return $request->has('per_page')
            ? $query->paginate((int) $request->per_page ?: 20)
            : $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'gym_id' => 'nullable|exists:gyms,id',
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'type' => 'required|in:info,warning,urgent,success',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'is_published' => 'boolean',
        ]);
        $validated['created_by'] = $request->user()->id;
        $validated['is_published'] = $validated['is_published'] ?? true;
        return Announcement::create($validated)->load(['gym', 'creator']);
    }

    public function show(Announcement $announcement)
    {
        return $announcement->load(['gym', 'creator']);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $validated = $request->validate([
            'gym_id' => 'nullable|exists:gyms,id',
            'title' => 'sometimes|string|max:255',
            'body' => 'nullable|string',
            'type' => 'sometimes|in:info,warning,urgent,success',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'is_published' => 'boolean',
        ]);
        $announcement->update($validated);
        return $announcement->load(['gym', 'creator']);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted']);
    }
}
