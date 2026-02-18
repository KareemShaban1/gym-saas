<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class TrainerAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $trainer = Trainer::with(['gym', 'gyms'])->where('email', $request->email)->first();

        if (! $trainer || ! $trainer->password || ! Hash::check($request->password, $trainer->password)) {
            throw ValidationException::withMessages([
                'email' => [__('The provided credentials are incorrect.')],
            ]);
        }

        $trainer->tokens()->where('name', 'trainer-portal')->delete();
        $token = $trainer->createToken('trainer-portal')->plainTextToken;

        return response()->json([
            'trainer' => $trainer,
            'token' => $token,
        ]);
    }

    /**
     * Register as personal trainer (no gym). Creates trainer with gym_id = null.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:trainers,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'required|string|max:50',
            'gender' => 'required|string|in:male,female',
            'specialty' => 'required|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['gym_id'] = null;
        $validated['hire_date'] = now();
        $validated['status'] = 'Active';
        $validated['commission_rate'] = 0;
        $validated['monthly_salary'] = 0;

        $trainer = Trainer::create($validated);

        $trainer->tokens()->where('name', 'trainer-portal')->delete();
        $token = $trainer->createToken('trainer-portal')->plainTextToken;

        return response()->json([
            'trainer' => $trainer->load(['gym', 'gyms']),
            'token' => $token,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load(['gym', 'gyms']));
    }
}
