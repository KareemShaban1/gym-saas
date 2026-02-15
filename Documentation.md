# Integrating Laravel Backend with GymFlow Frontend
This guide explains how to connect a **Laravel** backend API to this React/Vite frontend dashboard.
---
## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Laravel Setup](#laravel-setup)
3. [API Routes Structure](#api-routes-structure)
4. [CORS Configuration](#cors-configuration)
5. [Authentication](#authentication)
6. [Connecting Frontend to Laravel](#connecting-frontend-to-laravel)
7. [Example: Members API](#example-members-api)
8. [Environment Configuration](#environment-configuration)
9. [Deployment](#deployment)
---
## Architecture Overview
```
┌──────────────────────┐        HTTP/JSON         ┌──────────────────────┐
│   React Frontend     │  ◄──────────────────────► │   Laravel Backend    │
│   (Vite + TS)        │      REST API             │   (PHP 8.2+)        │
│   Port: 5173         │                           │   Port: 8000         │
└──────────────────────┘                           └──────────────────────┘
                                                           │
                                                           ▼
                                                   ┌──────────────┐
                                                   │  MySQL/PgSQL │
                                                   └──────────────┘
```
---
## Laravel Setup
### 1. Create a new Laravel project
```bash
composer create-project laravel/laravel gymflow-api
cd gymflow-api
```
### 2. Install Laravel Sanctum (for API authentication)
```bash
php artisan install:api
```
### 3. Configure your database in `.env`
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gymflow
DB_USERNAME=root
DB_PASSWORD=secret
```
---
## API Routes Structure
Define your API routes in `routes/api.php`:
```php
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\AuthController;
// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::apiResource('members', MemberController::class);
    Route::apiResource('trainers', TrainerController::class);
    Route::apiResource('branches', BranchController::class);
    Route::apiResource('payments', PaymentController::class);
    Route::apiResource('workouts', WorkoutController::class);
    Route::get('/attendance', [AttendanceController::class, 'index']);
    Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut']);
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/revenue', [ReportController::class, 'revenue']);
    Route::get('/reports/member-growth', [ReportController::class, 'memberGrowth']);
});
```
---
## CORS Configuration
Update `config/cors.php` to allow requests from the frontend:
```php
<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',    // Vite dev server
        'https://your-production-domain.com',
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```
---
## Authentication
### Laravel AuthController Example
```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        $user = User::where('email', $request->email)->first();
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        $token = $user->createToken('gymflow-dashboard')->plainTextToken;
        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
    public function user(Request $request)
    {
        return $request->user();
    }
}
```
---
## Connecting Frontend to Laravel
### 1. Create an API client
Create `src/lib/api.ts` in the frontend:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
class ApiClient {
  private token: string | null = null;
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    return response.json();
  }
  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  }
  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  put<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
export const api = new ApiClient();
```
### 2. Create React Query hooks
Create `src/hooks/useMembers.ts`:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Member } from '@/data/members';
export function useMembers() {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => api.get<Member[]>('/members'),
  });
}
export function useMember(id: number) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: () => api.get<Member>(`/members/${id}`),
  });
}
export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Member>) => api.post<Member>('/members', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Member> & { id: number }) =>
      api.put<Member>(`/members/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
```
### 3. Using hooks in components
Replace static data imports with API hooks:
```typescript
// Before (static data)
import { initialMembers } from "@/data/members";
const [members, setMembers] = useState(initialMembers);
// After (Laravel API)
import { useMembers, useCreateMember } from "@/hooks/useMembers";
const { data: members = [], isLoading } = useMembers();
const createMember = useCreateMember();
const handleAdd = (data: Partial<Member>) => {
  createMember.mutate(data);
};
```
---
## Example: Members API
### Laravel Migration
```bash
php artisan make:model Member -mcr
```
`database/migrations/xxxx_create_members_table.php`:
```php
Schema::create('members', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('phone');
    $table->enum('plan', ['Monthly', 'Coin-Based', 'Bundle']);
    $table->enum('status', ['Active', 'Inactive', 'Frozen']);
    $table->date('joined');
    $table->date('expiry')->nullable();
    $table->integer('coins')->default(0);
    $table->integer('sessions_left')->default(0);
    $table->decimal('paid', 10, 2)->default(0);
    $table->foreignId('branch_id')->nullable()->constrained();
    $table->timestamps();
});
```
### Laravel Model
```php
<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Member extends Model
{
    protected $fillable = [
        'name', 'email', 'phone', 'plan',
        'status', 'joined', 'expiry',
        'coins', 'sessions_left', 'paid', 'branch_id',
    ];
    protected $casts = [
        'joined' => 'date',
        'expiry' => 'date',
        'paid' => 'decimal:2',
    ];
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}
```
### Laravel Controller
```php
<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\Request;
class MemberController extends Controller
{
    public function index(Request $request)
    {
        return Member::when($request->search, function ($q, $search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        })
        ->when($request->status, fn($q, $s) => $q->where('status', $s))
        ->when($request->plan, fn($q, $p) => $q->where('plan', $p))
        ->orderBy('created_at', 'desc')
        ->paginate(20);
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:members',
            'phone' => 'required|string',
            'plan' => 'required|in:Monthly,Coin-Based,Bundle',
            'status' => 'required|in:Active,Inactive,Frozen',
            'joined' => 'required|date',
            'expiry' => 'nullable|date|after:joined',
            'coins' => 'integer|min:0',
            'sessions_left' => 'integer|min:0',
            'paid' => 'numeric|min:0',
        ]);
        return Member::create($validated);
    }
    public function show(Member $member)
    {
        return $member->load('branch', 'attendances');
    }
    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'email|unique:members,email,' . $member->id,
            'phone' => 'string',
            'plan' => 'in:Monthly,Coin-Based,Bundle',
            'status' => 'in:Active,Inactive,Frozen',
        ]);
        $member->update($validated);
        return $member;
    }
    public function destroy(Member $member)
    {
        $member->delete();
        return response()->json(['message' => 'Member deleted']);
    }
}
```
---
## Environment Configuration
### Frontend `.env`
Create a `.env` file in the frontend project root:
```env
VITE_API_URL=http://localhost:8000/api
```
For production:
```env
VITE_API_URL=https://api.yourdomain.com/api
```
> **Note:** Only `VITE_` prefixed variables are exposed to the frontend.
---
## Deployment
### Option 1: Same Server
```
yourdomain.com          → React (built with `npm run build`)
api.yourdomain.com      → Laravel API
```
Serve the React build with Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/gymflow-frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/gymflow-api/public;
    index index.php;
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```
### Option 2: Separate Hosting
| Component | Hosting |
|-----------|---------|
| Frontend  | Lovable (publish), Vercel, Netlify |
| Backend   | Laravel Forge, DigitalOcean, AWS |
| Database  | PlanetScale, AWS RDS, managed MySQL |
---
## Summary
| Step | Action |
|------|--------|
| 1 | Set up Laravel project with Sanctum |
| 2 | Create migrations, models, and controllers |
| 3 | Configure CORS for the frontend origin |
| 4 | Create `src/lib/api.ts` API client in frontend |
| 5 | Build React Query hooks per resource |
| 6 | Replace static `data/` imports with API hooks |
| 7 | Set `VITE_API_URL` env variable |
| 8 | Deploy both apps |
For questions or issues, refer to:
- [Laravel Docs](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [TanStack React Query](https://tanstack.com/query)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode)