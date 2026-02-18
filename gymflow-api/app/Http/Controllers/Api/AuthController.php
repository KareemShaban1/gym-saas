<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Gym;
use App\Models\User;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        $user = User::with('gym')->where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        if ($user->isGymAdmin() && ! $user->gym_id) {
            throw ValidationException::withMessages([
                'email' => ['Your account is not linked to a gym. Please contact support.'],
            ]);
        }
        $token = $user->createToken('gymflow-dashboard')->plainTextToken;
        $payload = [
            'user' => $user,
            'token' => $token,
        ];
        if ($user->gym) {
            $payload['gym'] = $user->gym->load('activeSubscription.plan');
        }
        return response()->json($payload);
    }

    /**
     * Register a new gym (creates gym + first admin user).
     */
    public function registerGym(Request $request)
    {
        $validated = $request->validate([
            'gym_name' => 'required|string|max:255',
            'gym_email' => 'required|email|unique:gyms,email',
            'gym_phone' => 'nullable|string|max:50',
            'gym_address' => 'nullable|string',
            'gym_city' => 'nullable|string|max:100',
            'gym_country' => 'nullable|string|max:100',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $gym = Gym::create([
                'name' => $validated['gym_name'],
                'slug' => Str::slug($validated['gym_name']),
                'email' => $validated['gym_email'],
                'phone' => $validated['gym_phone'] ?? null,
                'address' => $validated['gym_address'] ?? null,
                'city' => $validated['gym_city'] ?? null,
                'country' => $validated['gym_country'] ?? null,
                'status' => 'trial',
            ]);

            $user = User::create([
                'name' => $validated['admin_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['password']),
                'role' => 'gym_admin',
                'gym_id' => $gym->id,
            ]);

            $trialPlan = SubscriptionPlan::where('slug', 'trial')->first();
            if ($trialPlan) {
                Subscription::create([
                    'gym_id' => $gym->id,
                    'subscription_plan_id' => $trialPlan->id,
                    'status' => 'trial',
                    'trial_ends_at' => now()->addDays(14),
                    'starts_at' => now(),
                ]);
            }

            return $user->load('gym');
        });

        $token = $user->createToken('gymflow-dashboard')->plainTextToken;
        $payload = ['user' => $user, 'token' => $token];
        if ($user->gym) {
            $payload['gym'] = $user->gym->load('activeSubscription.plan');
        }
        return response()->json($payload, 201);
    }

    /**
     * Legacy register (optional: create gym admin without gym signup flow).
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'gym_admin',
        ]);
        $token = $user->createToken('gymflow-dashboard')->plainTextToken;
        return response()->json(['user' => $user, 'token' => $token], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load('gym');
        $data = $user->toArray();
        if ($user->gym) {
            $data['gym'] = $user->gym->load('activeSubscription.plan');
        }
        return response()->json($data);
    }
}
