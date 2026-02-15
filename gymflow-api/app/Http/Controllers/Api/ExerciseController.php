<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Exercise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class ExerciseController extends Controller
{
    use ResolvesGym;

    private function fileRules(): array
    {
        return [
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'video' => 'nullable|file|mimes:mp4,webm,mov|max:51200',
            'gif' => 'nullable|file|mimes:gif|max:10240',
        ];
    }

    private function storeMedia(Request $request, int $gymId, int $exerciseId): array
    {
        $basePath = 'exercises/gym_' . $gymId . '/ex_' . $exerciseId;
        $urls = [];

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store($basePath, 'public');
            $urls['image_url'] = URL::asset(Storage::url($path));
        }
        if ($request->hasFile('video')) {
            $path = $request->file('video')->store($basePath, 'public');
            $urls['video_url'] = URL::asset(Storage::url($path));
        }
        if ($request->hasFile('gif')) {
            $path = $request->file('gif')->store($basePath, 'public');
            $urls['gif_url'] = URL::asset(Storage::url($path));
        }

        return $urls;
    }

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $query = Exercise::whereNull('gym_id')
            ->orWhere('gym_id', $gymId)
            ->orderBy('muscle_group')
            ->orderBy('name')
            ->when($request->muscle_group, fn ($q, $g) => $q->where('muscle_group', $g));

        if ($request->has('per_page')) {
            return $query->paginate((int) $request->per_page ?: 50);
        }
        return $query->get();
    }

    public function store(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $validated = $request->validate(array_merge([
            'name' => 'required|string|max:255',
            'muscle_group' => 'required|string|max:100',
            'equipment' => 'required|string|max:100',
            'description' => 'nullable|string',
        ], $this->fileRules()));
        $validated['gym_id'] = $gymId;
        $validated['is_global'] = false;

        $exercise = Exercise::create($validated);
        $media = $this->storeMedia($request, $gymId, $exercise->id);
        if (! empty($media)) {
            $exercise->update($media);
        }

        return $exercise->fresh();
    }

    public function show(Request $request, Exercise $exercise)
    {
        $gymId = $this->requireGymId($request);
        if ($exercise->gym_id !== null && $exercise->gym_id !== $gymId) {
            abort(404);
        }
        return $exercise;
    }

    public function update(Request $request, Exercise $exercise)
    {
        $gymId = $this->requireGymId($request);
        if ($exercise->gym_id !== $gymId) {
            abort(404);
        }
        $validated = $request->validate(array_merge([
            'name' => 'sometimes|string|max:255',
            'muscle_group' => 'sometimes|string|max:100',
            'equipment' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
        ], $this->fileRules()));
        $media = $this->storeMedia($request, $gymId, $exercise->id);
        $exercise->update(array_merge($validated, $media));

        return $exercise->fresh();
    }

    public function destroy(Request $request, Exercise $exercise)
    {
        $gymId = $this->requireGymId($request);
        if ($exercise->gym_id !== $gymId) {
            abort(404);
        }
        $exercise->delete();

        return response()->json(['message' => 'Exercise deleted']);
    }
}
