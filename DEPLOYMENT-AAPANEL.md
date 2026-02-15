# Deploy GymFlow on a Server Using aaPanel

This guide covers deploying the **React frontend** and **Laravel API** using aaPanel (Linux server with Nginx, PHP, MySQL).

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

## Part 2: Deploy Laravel API (gymflow-api)

### 2.1 Add site in aaPanel

1. **Website → Add site**
2. Domain: `api.yourdomain.com` (or your API domain)
3. PHP version: **PHP-82**
4. Database: optionally link the database you created
5. Create and note the **site root** path, e.g. `/www/wwwroot/api.yourdomain.com`

### 2.2 Upload Laravel files

Upload the contents of the **gymflow-api** folder so that the Laravel app lives in the site root. The **document root** must point to the `public` folder (see Nginx config below).

Recommended layout:

- Site root: `/www/wwwroot/api.yourdomain.com`
- Put Laravel here so you have: `/www/wwwroot/api.yourdomain.com/public/index.php`,  
  i.e. upload the **contents** of `gymflow-api` (app, bootstrap, config, public, etc.) into `/www/wwwroot/api.yourdomain.com/`.

So:

- `/www/wwwroot/api.yourdomain.com/app/`
- `/www/wwwroot/api.yourdomain.com/bootstrap/`
- `/www/wwwroot/api.yourdomain.com/config/`
- `/www/wwwroot/api.yourdomain.com/public/`  ← this will be the document root
- etc.

### 2.3 Set document root to `public`

In aaPanel: **Website → your site (api.yourdomain.com) → Set up → Site directory**:

- Set **run directory** / **document root** to: **`/public`** (relative to site root)  
  so the site runs from `.../api.yourdomain.com/public`.

If you use **Nginx**, the root should look like:

```nginx
root /www/wwwroot/api.yourdomain.com/public;
```

### 2.4 Environment and dependencies (SSH)

SSH into the server and go to the Laravel path (parent of `public`):

```bash
cd /www/wwwroot/api.yourdomain.com
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

### 2.5 Permissions

```bash
cd /www/wwwroot/api.yourdomain.com
chown -R www:www storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

(`www` is the usual Nginx/PHP user; adjust if aaPanel uses a different user.)

### 2.6 Nginx config for Laravel (if you edit by hand)

In aaPanel, **Website → api.yourdomain.com → Set up → Config file** (or Nginx config). Ensure the `location /` block uses Laravel’s `public` and try_files:

```nginx
root /www/wwwroot/api.yourdomain.com/public;
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

## Part 3: Deploy React Frontend

### 3.1 Build the frontend (with API URL)

On your **local machine** (or on the server if Node is installed):

```bash
cd /path/to/gym   # project root (where package.json is)
npm ci
# Set your production API URL (no trailing slash; /api is added by the app)
export VITE_API_URL=https://api.yourdomain.com/api
npm run build
```

This creates the **dist** folder.

### 3.2 Add frontend site in aaPanel

1. **Website → Add site**
2. Domain: `yourdomain.com` (or `app.yourdomain.com`)
3. You can set PHP to “Static” or leave it; we’ll serve static files only.
4. Site root: e.g. `/www/wwwroot/yourdomain.com`

### 3.3 Upload frontend build

Upload **all contents** of the **dist** folder into the site root, e.g.:

- `/www/wwwroot/yourdomain.com/index.html`
- `/www/wwwroot/yourdomain.com/assets/`
- etc.

So the browser opens `https://yourdomain.com` and loads `index.html` and assets from there.

### 3.4 (Optional) Build on server with Node

If you prefer to build on the server:

```bash
cd /www/wwwroot/yourdomain.com
# Upload source (e.g. git clone or upload zip of frontend)
npm ci
export VITE_API_URL=https://api.yourdomain.com/api
npm run build
# Then move dist/* to document root and optionally remove node_modules and source
```

---

## Part 4: CORS and security

### 4.1 Laravel CORS

On the server, edit Laravel’s CORS config:

```bash
nano /www/wwwroot/api.yourdomain.com/config/cors.php
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
cd /www/wwwroot/api.yourdomain.com
php artisan config:cache
```

### 4.2 HTTPS

In aaPanel for both sites: **Website → your site → SSL**. Use **Let’s Encrypt** and force HTTPS so the frontend and API both run over `https://`.

---

## Part 5: Quick checklist

| Step | Where | Action |
|------|--------|--------|
| 1 | aaPanel | Install Nginx, PHP 8.2+, MySQL, Node (for build) |
| 2 | aaPanel | Install PHP extensions required by Laravel |
| 3 | aaPanel | Create database and user |
| 4 | aaPanel | Add site for API → document root = `public` |
| 5 | Server | Upload Laravel (gymflow-api) into API site root |
| 6 | Server | `.env`, `composer install`, `artisan key:generate`, `migrate`, cache |
| 7 | Server | Permissions: `storage`, `bootstrap/cache` → www:www, 775 |
| 8 | aaPanel | Add site for frontend |
| 9 | Local/Server | Build frontend with `VITE_API_URL=https://api.yourdomain.com/api` |
| 10 | Server | Upload `dist/*` to frontend site root |
| 11 | Laravel | Update `config/cors.php` with frontend domain |
| 12 | aaPanel | Enable SSL for both sites |

---

## Troubleshooting

- **502 Bad Gateway**: Check PHP version and PHP-FPM socket in Nginx (aaPanel usually sets this).
- **500 from Laravel**: Set `APP_DEBUG=true` temporarily, run `php artisan config:clear` and check `storage/logs/laravel.log`.
- **API calls fail from frontend**: Confirm `VITE_API_URL` used at build time, CORS origin, and that both sites use HTTPS if the frontend is HTTPS.
- **Routes not found (404)**: Ensure document root is `public` and Nginx has `try_files $uri $uri/ /index.php?$query_string;` for the API site.

Replace `yourdomain.com` and `api.yourdomain.com` with your real domains everywhere.
