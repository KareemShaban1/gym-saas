<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\ResolvesGym;
use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ResolvesGym;

    public function index(Request $request)
    {
        $gymId = $this->requireGymId($request);
        $memberIds = Member::where('gym_id', $gymId)->pluck('id');
        $query = Payment::with('member')->whereIn('member_id', $memberIds)
            ->when($request->member_id, fn ($q, $id) => $q->where('member_id', $id))
            ->when($request->category, fn ($q, $c) => $q->where('category', $c))
            ->when($request->from_date, fn ($q, $d) => $q->where('date', '>=', $d))
            ->when($request->to_date, fn ($q, $d) => $q->where('date', '<=', $d))
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
            'member_id' => 'required|exists:members,id',
            'category' => 'required|in:subscription,coin_purchase,personal_training,supplement,merchandise,other',
            'amount' => 'required|numeric|min:0',
            'method' => 'required|in:cash,card,bank_transfer,mobile_wallet',
            'date' => 'required|date',
            'note' => 'nullable|string',
        ]);
        \App\Models\Member::where('id', $validated['member_id'])->where('gym_id', $gymId)->firstOrFail();
        return Payment::create($validated)->load('member');
    }

    public function show(Request $request, Payment $payment)
    {
        if ($payment->member->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        return $payment->load('member');
    }

    public function update(Request $request, Payment $payment)
    {
        if ($payment->member->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $validated = $request->validate([
            'member_id' => 'sometimes|exists:members,id',
            'category' => 'sometimes|in:subscription,coin_purchase,personal_training,supplement,merchandise,other',
            'amount' => 'sometimes|numeric|min:0',
            'method' => 'sometimes|in:cash,card,bank_transfer,mobile_wallet',
            'date' => 'sometimes|date',
            'note' => 'nullable|string',
        ]);

        $payment->update($validated);

        return $payment->load('member');
    }

    public function destroy(Request $request, Payment $payment)
    {
        if ($payment->member->gym_id !== $this->requireGymId($request)) {
            abort(404);
        }
        $payment->delete();

        return response()->json(['message' => 'Payment deleted']);
    }
}
