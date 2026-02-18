# Deploy GymFlow on a Server Using aaPanel

This guide covers deploying the **React frontend** and **Laravel API** using aaPanel (Linux server with Nginx, PHP, MySQL).

---

## Single Git repo: frontend and gymflow-api in the same location

The project is one Git repo with this structure:

```
your-repo/                 ← clone this once on the server
├── src/                   ← React app source
├── public/
├── package.json
├── vite.config.ts
├── dist/                  ← created by npm run build (frontend build output)
├── gymflow-api/           ← Laravel API
│   ├── app/
│   ├── config/
│   ├── public/            ← Laravel document root
│   ├── .env
│   └── ...
└── ...
```

**Idea:** Clone the repo **once** into one directory. Then in aaPanel you create **two sites** that point into that same directory:

| Site | Domain example | Site root (in aaPanel) | Document / run directory |
|------|----------------|------------------------|----------------------------|
| Frontend | `yourdomain.com` | `/www/wwwroot/yourdomain.com` (repo root) | `dist` |
| API | `api.yourdomain.com` | `/www/wwwroot/yourdomain.com/gymflow-api` | `public` |

So both frontend and API are served from the **same repo path**; only the “run directory” differs.

---

## Prerequisites

- A VPS or dedicated server (Ubuntu 20.04/22.04 or CentOS 7/8 recommended)
- Domain (or subdomains) pointed to your server IP, e.g.:
  - `yourdomain.com` → frontend
  - `api.yourdomain.com` → Laravel API
- aaPanel installed: https://www.aapanel.com/release.html

---

## Part 1: aaPanel Setup

### 1.1 Install required software in aaPanel

1. Log in to aaPanel.
2. Go to **App Store** and install (if not already):
   - **Nginx** (or OpenLiteSpeed)
   - **PHP 8.2** or **8.3** (Laravel needs 8.2+)
   - **MySQL** or **MariaDB**
   - **Node.js** (v18 or v20) – for building the frontend

### 1.2 PHP extensions for Laravel

In aaPanel: **App Store → PHP 8.2 → Set up → Install extensions**:

- bcmath  
- curl  
- fileinfo  
- mbstring  
- openssl  
- pdo_mysql  
- tokenizer  
- xml  
- zip  

### 1.3 Create database

1. **Database → Add database**
2. Database name: e.g. `gymflow`
3. User: e.g. `gymflow_user`
4. Password: strong password (save it)
5. Access: Local server

---

## Part 2: Clone repo and create both sites (single repo)

### 2.1 Clone the Git repo once

SSH into the server. Create one directory for the app and clone your repo into it. Use the **frontend domain** as the folder name so the frontend site root is the repo root:

```bash
cd /www/wwwroot
git clone https://github.com/your-username/your-repo.git yourdomain.com
cd yourdomain.com
```

You should see `gymflow-api/`, `package.json`, `src/`, etc. in `/www/wwwroot/yourdomain.com/`.

### 2.2 Add the **API** site in aaPanel

1. **Website → Add site**
2. Domain: `api.yourdomain.com`
3. **Site root (path):** `/www/wwwroot/yourdomain.com/gymflow-api`  
   (Do **not** use a separate folder like `/www/wwwroot/api.yourdomain.com` – we point to the repo’s `gymflow-api` folder.)
4. PHP version: **PHP-82**
5. Create the site.

Then set the **run directory** so the web root is Laravel’s `public`:

- **Website → api.yourdomain.com → Set up → Site directory**
- Set **run directory** / **document root** to: **`public`**  
  So Nginx uses: `/www/wwwroot/yourdomain.com/gymflow-api/public`.

### 2.3 Add the **frontend** site in aaPanel

1. **Website → Add site**
2. Domain: `yourdomain.com`
3. **Site root (path):** `/www/wwwroot/yourdomain.com` (the repo root).
4. Create the site.

Then set the **run directory** to the built frontend:

- **Website → yourdomain.com → Set up → Site directory**
- Set **run directory** to: **`dist`**  
  (You will build the frontend so that `dist/` contains `index.html` and assets; see Part 4.)

So after a build, Nginx will serve from `/www/wwwroot/yourdomain.com/dist`.

---

## Part 3: Deploy Laravel API (gymflow-api)

### 3.1 Environment and dependencies (SSH)

SSH into the server and go to the **Laravel** folder (inside the repo):

```bash
cd /www/wwwroot/yourdomain.com/gymflow-api
```

Then:

```bash
# Copy env and edit with your DB and URL
cp .env.example .env
nano .env
```

In **.env** set at least:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gymflow
DB_USERNAME=gymflow_user
DB_PASSWORD=your_db_password
```

Save and run:

```bash
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

(If you use seeders: `php artisan db:seed --force`.)

### 3.2 Permissions

```bash
cd /www/wwwroot/yourdomain.com/gymflow-api
chown -R www:www storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

(`www` is the usual Nginx/PHP user; adjust if aaPanel uses a different user.)

### 2.6 Nginx config for Laravel (if you edit by hand)

In aaPanel, **Website → api.yourdomain.com → Set up → Config file** (or Nginx config). Ensure the `location /` block uses Laravel’s `public` and try_files:

```nginx
root /www/wwwroot/yourdomain.com/gymflow-api/public;
index index.php;

location / {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/tmp/php-cgi-82.sock;   # or the socket/port aaPanel shows
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
    fastcgi_hide_header X-Powered-By;
}
```

Apply and reload Nginx.

---

## Part 4: Deploy React Frontend (same repo)

The frontend site already uses the repo root with run directory **dist**. You only need to build so that `dist/` exists.

### 4.1 Build on the server (recommended after git pull)

SSH in, go to the **repo root** (where `package.json` and `gymflow-api/` are), then:

```bash
cd /www/wwwroot/yourdomain.com
npm ci
export VITE_API_URL=https://api.yourdomain.com/api
npm run build
```

This creates or updates **dist/** with `index.html` and assets. The site run directory is already `dist`, so no copy step.

### 4.2 Build locally and upload (alternative)

If you don't run Node on the server: build on your machine with `VITE_API_URL=https://api.yourdomain.com/api npm run build`, then upload the contents of **dist/** to `/www/wwwroot/yourdomain.com/dist/` (create `dist` if needed).

---

## Part 5: CORS and security

### 5.1 Laravel CORS

On the server, edit Laravel’s CORS config:

```bash
nano /www/wwwroot/yourdomain.com/gymflow-api/config/cors.php
```

Add your frontend origin to `allowed_origins`:

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    // keep localhost for local dev if needed
],
```

Then:

```bash
cd /www/wwwroot/yourdomain.com/gymflow-api
php artisan config:cache
```

### 5.2 HTTPS

In aaPanel for both sites: **Website → your site → SSL**. Use **Let’s Encrypt** and force HTTPS so the frontend and API both run over `https://`.

---

## Part 6: Quick checklist (single repo)

| Step | Where | Action |
|------|--------|--------|
| 1 | aaPanel | Install Nginx, PHP 8.2+, MySQL, Node (for build) |
| 2 | aaPanel | Install PHP extensions required by Laravel |
| 3 | aaPanel | Create database and user |
| 4 | Server | Clone Git repo once to e.g. `/www/wwwroot/yourdomain.com` |
| 5 | aaPanel | Add site for API: root = `.../yourdomain.com/gymflow-api`, run dir = `public` |
| 6 | aaPanel | Add site for frontend: root = `.../yourdomain.com`, run dir = `dist` |
| 7 | Server | In `gymflow-api/`: `.env`, `composer install`, `artisan key:generate`, `migrate`, cache |
| 8 | Server | Permissions on `gymflow-api/storage` and `gymflow-api/bootstrap/cache` |
| 9 | Server | In repo root: `npm ci`, `VITE_API_URL=... npm run build` (or build locally and upload `dist/`) |
| 10 | Laravel | Update `config/cors.php` with frontend domain |
| 11 | aaPanel | Enable SSL for both sites |

---

## Updating the app (single repo)

After you pull new code from Git:

```bash
cd /www/wwwroot/yourdomain.com
git pull

# Backend: run migrations and clear caches
cd gymflow-api
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
cd ..

# Frontend: rebuild and serve from dist
npm ci
export VITE_API_URL=https://api.yourdomain.com/api
npm run build
```

No need to change aaPanel site roots; both sites keep pointing at the same repo.

---

## Troubleshooting

- **502 Bad Gateway**: Check PHP version and PHP-FPM socket in Nginx (aaPanel usually sets this).
- **500 from Laravel**: Set `APP_DEBUG=true` temporarily, run `php artisan config:clear` and check `storage/logs/laravel.log`.
- **API calls fail from frontend**: Confirm `VITE_API_URL` used at build time, CORS origin, and that both sites use HTTPS if the frontend is HTTPS.
- **Routes not found (404)**: Ensure document root is `public` and Nginx has `try_files $uri $uri/ /index.php?$query_string;` for the API site.
- **"Expected a JavaScript module script but the server responded with a MIME type of application/octet-stream"**: The frontend site is serving `.js`/`.mjs` with the wrong MIME type. Fix it by adding MIME types for the **frontend** site in aaPanel (see below).
- **POST /api/trainer/login (or /api/member/login, /api/login) returns 404**: The request is hitting the frontend site instead of Laravel. See **"Trainer / API login 404"** below.

---

## Fix: Frontend MIME type (application/octet-stream)

If the browser shows *"Expected a JavaScript module script but the server responded with a MIME type of application/octet-stream"*, Nginx is not sending the correct `Content-Type` for JavaScript files.

**In aaPanel:** open **Website → your frontend site (e.g. gym.kareemsoft.org) → Set up → Config file** (Nginx). In the **server { ... }** block for this site, ensure you have:

1. **Include MIME types** near the top of the `server` block (if not already present):

```nginx
server {
    include mime.types;   # add this if missing
    default_type application/octet-stream;   # remove this line if present, or keep only if mime.types is included

    root /www/wwwroot/gym.kareemsoft.org/dist;   # your frontend run directory
    index index.html;
    server_name gym.kareemsoft.org;

    location / {
        try_files $uri $uri/ /index.html;
    }
    # ... rest of config (SSL, etc.)
}
```

2. If your config already has `default_type application/octet-stream;` **without** `include mime.types;`, then Nginx falls back to octet-stream for unknown extensions. Either:
   - Add **`include mime.types;`** inside this server block (so `.js` and `.mjs` get `application/javascript`), or  
   - Add explicit types in this server block:

```nginx
types {
    application/javascript js mjs;
    text/css css;
}
```

Then **reload Nginx** (aaPanel: Nginx → Reload, or run `nginx -s reload`).

Replace `yourdomain.com` and `api.yourdomain.com` with your real domains everywhere.

---

## Trainer / API login 404 (POST /api/trainer/login returns 404)

If the frontend calls `https://gym.kareemsoft.org/api/trainer/login` (same domain as the app) and gets **404**, the browser is sending the request to the **frontend** site. That site only serves the SPA (e.g. from `dist/`), so `/api/*` does not exist there and Nginx (or the SPA) returns 404.

You have two ways to fix it.

### Option A: Use a separate API subdomain (recommended)

1. **Create a second site in aaPanel** for the API:
   - Domain: `api.gym.kareemsoft.org`
   - Site root: `/www/wwwroot/gym.kareemsoft.org/gymflow-api`
   - Run directory: `public`
   - PHP: 8.2

2. **Point DNS**: Add an A record for `api.gym.kareemsoft.org` to your server IP.

3. **Rebuild the frontend** so it uses the API subdomain:
   ```bash
   cd /www/wwwroot/gym.kareemsoft.org
   export VITE_API_URL=https://api.gym.kareemsoft.org/api
   npm run build
   ```

4. Enable SSL for `api.gym.kareemsoft.org` in aaPanel.

After this, trainer login will go to `https://api.gym.kareemsoft.org/api/trainer/login`, which is served by Laravel.

### Option B: Same domain – proxy /api to Laravel

If you want **one domain** (e.g. `https://gym.kareemsoft.org`) for both frontend and API:

1. **Create the API site in aaPanel** (same as Option A) so Laravel is working at least on a subdomain or port, e.g. `api.gym.kareemsoft.org` or an internal URL.

2. **Edit Nginx for the main domain** (`gym.kareemsoft.org`). Add a `location /api` block that **proxies** to the Laravel backend (your API site’s upstream or URL). In aaPanel: **Website → gym.kareemsoft.org → Set up → Config file**:

```nginx
# Upstream for Laravel (use the same PHP/backend as your API site)
upstream laravel_backend {
    server unix:/tmp/php-cgi-82.sock;   # or 127.0.0.1:9000 if PHP-FPM listens on port
}

server {
    server_name gym.kareemsoft.org;
    root /www/wwwroot/gym.kareemsoft.org/dist;
    index index.html;
    include mime.types;

    # Proxy /api to Laravel
    location /api {
        rewrite ^/api/(.*)$ /api/$1 break;
        fastcgi_pass laravel_backend;
        fastcgi_param SCRIPT_FILENAME /www/wwwroot/gym.kareemsoft.org/gymflow-api/public/index.php;
        include fastcgi_params;
        fastcgi_param REQUEST_URI $request_uri;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
    # ... SSL, etc.
}
```

Config details (path, PHP socket) must match your server. **Option A (API subdomain)** is usually easier and avoids this.

3. **Rebuild frontend** with API on the same domain:
   ```bash
   export VITE_API_URL=https://gym.kareemsoft.org/api
   npm run build
   ```

**Summary:** 404 on `POST /api/trainer/login` means the request is not handled by Laravel. Use **Option A** (API subdomain, e.g. `api.gym.kareemsoft.org`) or **Option B** (proxy `/api` on the same domain) so `/api/*` is served by Laravel.

---

## Trainer login 404 but dashboard works (same domain)

If **gym admin login** (e.g. `POST /api/login`) and other API calls work, but **trainer login** (`POST /api/trainer/login`) returns 404, Laravel is receiving `/api` but the **trainer route may not be registered** on the server (e.g. old route cache or code not deployed).

**On the server, run these in the Laravel directory** (`/www/wwwroot/gym.kareemsoft.org/gymflow-api`):

```bash
cd /www/wwwroot/gym.kareemsoft.org/gymflow-api

# 1. Clear caches so routes are loaded from files
php artisan route:clear
php artisan config:clear

# 2. Confirm the trainer route is listed (look for "trainer/login")
php artisan route:list --path=api

# 3. If you see "api/trainer/login" in the list, cache again for production
php artisan config:cache
php artisan route:cache
```

- If **`route:list` does NOT show `api/trainer/login`**: pull the latest code (or ensure `routes/api.php` and `app/Http/Controllers/Api/TrainerAuthController.php` exist), then run the commands again.
- If **`route:list` shows `api/trainer/login`** but the browser still gets 404: the request may not be reaching Laravel for that path. Check Nginx: the `location /api` block must pass the full URI (e.g. `REQUEST_URI=/api/trainer/login`) to Laravel; avoid rewrites that change the path.
- Check Laravel log when you try trainer login: `tail -f storage/logs/laravel.log`.
