## Seeded demo credentials

This project includes a **full demo environment** that you can load with:

```bash
cd gymflow-api
php artisan migrate --force
php artisan db:seed --class=ProductionDemoSeeder --force
```

This will seed:

- Core data (permissions, subscription plans, default exercises)
- A **Super Admin** account
- **10 demo gyms** with:
  - Gym admin dashboard users
  - Branches
  - Trainers
  - Members
  - Payments, attendance, workout plans
  - Platform + gym announcements

---

### 1. Super Admin (platform owner)

Configured via environment variables in `gymflow-api/.env`:

- **Email**: `SUPER_ADMIN_EMAIL` (default: `superadmin@gymflow.com`)
- **Password**: `SUPER_ADMIN_PASSWORD` (default: `password`)

You can change these before seeding:

```env
SUPER_ADMIN_NAME="Super Admin"
SUPER_ADMIN_EMAIL="owner@yourdomain.com"
SUPER_ADMIN_PASSWORD="strong-password-here"
```

After running `ProductionDemoSeeder`, use this account to log into the **Super Admin dashboard** at:

- Frontend route: `/super-admin`

---

### 2. Gym admin dashboard logins

`GymsFullSeeder` creates **one gym admin user per seeded gym**.

Default pattern:

- **Gym 1 admin**
  - Email: `admin1@gymflow.com`
  - Password: `password`
- **Gym 2 admin**
  - Email: `admin2@gymflow.com`
  - Password: `password`
- ...
- **Gym 10 admin**
  - Email: `admin10@gymflow.com`
  - Password: `password`

These accounts log in via the **gym dashboard**:

- Frontend route: `/login`
- After login: redirected to `/dashboard`

Each admin is attached to a different seeded gym (e.g. `GymFlow Maadi`, `Power House Heliopolis`, etc.).

> **Recommendation for demos:**  
> Use `admin1@gymflow.com` / `password` as the primary **demo gym owner** account.

---

### 3. Member and trainer portals

`GymsFullSeeder` also creates **trainers** and **members** for each gym.

Patterns (for reference):

- Trainers: `trainer{T}_gym{G}@gymflow.com`  
  e.g. `trainer0_gym1@gymflow.com`, `trainer1_gym1@gymflow.com`, ...
- Members: `member{M}_gym{G}@gymflow.com`  
  e.g. `member0_gym1@gymflow.com`, `member1_gym1@gymflow.com`, ...

These are **data records**, not guaranteed to have portal passwords seeded.  
For production, you should manage:

- Member portal passwords via your own onboarding flow
- Trainer accounts via the trainer auth / invite flows

Portals:

- **Member portal login**: `/member/login`
- **Trainer portal login**: `/trainer/login`

---

### 4. Safe usage in production

- The `ProductionDemoSeeder` is **idempotent-friendly**:
  - Uses `updateOrCreate` where appropriate
  - Can be run again without duplicating core records
- In a **real production environment**, you should:
  - Set `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` to secure values
  - Optionally update the seeded gym admin emails to your real admins
  - Remove or disable this seeder after initial bootstrap if you no longer need demo data

To run only once on a fresh production database:

```bash
php artisan migrate --force
php artisan db:seed --class=ProductionDemoSeeder --force
```

