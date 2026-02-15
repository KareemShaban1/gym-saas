<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class MemberPortalPasswordController extends Controller
{
    use ResolvesGym;

    /**
     * Set or update a member's portal password (so they can log in to the member dashboard).
     */
    public function update(Request $request, Member $member)
    {
        $gymId = $this->requireGymId($request);
        if ($member->gym_id !== $gymId) {
            abort(404);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $member->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Portal password set. Member can now sign in at the member portal.']);
    }
}
