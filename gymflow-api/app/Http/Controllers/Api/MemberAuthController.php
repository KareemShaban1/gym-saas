<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MemberAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $member = Member::with(['gym', 'trainer', 'branch', 'gymPlan'])
            ->where('email', $request->email)->first();

        if (! $member || ! $member->password || ! Hash::check($request->password, $member->password)) {
            throw ValidationException::withMessages([
                'email' => [__('The provided credentials are incorrect.')],
            ]);
        }

        $member->tokens()->where('name', 'member-portal')->delete();
        $token = $member->createToken('member-portal')->plainTextToken;

        return response()->json([
            'member' => $member,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $member = $request->user()->load(['gym', 'trainer', 'branch', 'gymPlan']);
        return response()->json($member);
    }
}
