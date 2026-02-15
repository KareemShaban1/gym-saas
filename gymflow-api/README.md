# GymFlow API (Laravel Backend)

Laravel 12 API backend for the **GymFlow SaaS** gym management platform. Multi-tenant: each gym has its own data (members, trainers, branches, etc.). Super admin can manage all gyms, subscription plans, and announcements.

- **Gym registration**: `POST /api/register-gym` – creates a gym and first admin user (trial).
- **Login**: `POST /api/login` – returns user + token; `user.role` is `super_admin` or `gym_admin`; gym users have `user.gym`.
- **Super admin**: Routes under `/api/super-admin/*` require `role === 'super_admin'` (manage gyms, plans, subscriptions, announcements).
- **Gym dashboard**: All other protected routes are scoped to the authenticated gym (or optional `?gym_id=` for super admin).

## Requirements

- PHP 8.2+
- Composer
- SQLite (default) or MySQL/PostgreSQL

## Setup

1. **Install dependencies** (already done if you created the project):
   ```bash
   composer install
   ```

2. **Environment**:
   - Copy `.env.example` to `.env` if not present.
   - Run `php artisan key:generate`.
   - For MySQL, set in `.env`:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=gymflow
     DB_USERNAME=root
     DB_PASSWORD=secret
     ```

3. **Database**:
   ```bash
   php artisan migrate
   ```

4. **Seed data** (super admin, plans, exercises, and full gym data):
   ```bash
   php artisan db:seed
   ```
   - **Super admin**: admin@gymflow.com / password  
   - **Subscription plans**: Trial, Starter, Growth  
   - **10 gyms** with branches, trainers, members, payments, attendance, workout plans, and announcements  
   - **Gym admin logins**: admin1@gymflow-seed.com … admin10@gymflow-seed.com (password: **password**)  
   - **Platform + per-gym announcements** are also seeded

5. **Run the API**:
   ```bash
   php artisan serve
   ```
   API base URL: `http://localhost:8000` (routes under `/api`).

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/login` | No | Login (email, password) |
| POST | `/api/register` | No | Register (name, email, password, password_confirmation) |
| POST | `/api/logout` | Yes | Logout (Bearer token) |
| GET | `/api/user` | Yes | Current user |
| GET/POST | `/api/members` | Yes | List / create members |
| GET/PUT/DELETE | `/api/members/{id}` | Yes | Get / update / delete member |
| GET/POST | `/api/trainers` | Yes | List / create trainers |
| GET/PUT/DELETE | `/api/trainers/{id}` | Yes | Get / update / delete trainer |
| GET/POST | `/api/branches` | Yes | List / create branches |
| GET/PUT/DELETE | `/api/branches/{id}` | Yes | Get / update / delete branch |
| GET/POST | `/api/payments` | Yes | List / create payments |
| GET/PUT/DELETE | `/api/payments/{id}` | Yes | Get / update / delete payment |
| GET | `/api/attendance` | Yes | List attendance (optional: member_id, date, from_date, to_date) |
| POST | `/api/attendance/check-in` | Yes | Body: `member_id` |
| POST | `/api/attendance/check-out` | Yes | Body: `attendance_id` |
| GET/POST | `/api/workouts` | Yes | List / create workout plans |
| GET/PUT/DELETE | `/api/workouts/{id}` | Yes | Get / update / delete workout plan |
| GET | `/api/reports/dashboard` | Yes | Dashboard stats |
| GET | `/api/reports/revenue` | Yes | Revenue by month |
| GET | `/api/reports/member-growth` | Yes | Member growth by month |

Protected routes require header: `Authorization: Bearer {token}`.

## CORS

CORS is configured in `config/cors.php` to allow:

- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:5173`
- Add your production frontend URL when deploying.

## Frontend connection

In the React frontend root, set:

```env
VITE_API_URL=http://localhost:8000/api
```

Then use the API client and hooks described in the main project `Documentation.md`.
