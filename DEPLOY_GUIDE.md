# Deploy Guide - StockFlow ke Rumahweb (cPanel)

## Prasyarat
- Domain `handispramudio.my.id` sudah point ke hosting Rumahweb
- cPanel access (username + password)
- Terminal tersedia di cPanel

## Langkah 1: Buat Database MySQL
1. Login ke cPanel
2. Buka **MySQL Databases**
3. Buat database baru: `stockflow_db`
4. Buat MySQL user baru: `stockflow_user` + password
5. Tambahkan user ke database dengan **All Privileges**

## Langkah 2: Upload File
Opsi A - **File Manager** (cPanel):
1. Buka **File Manager** → navigasi ke `public_html`
2. Upload seluruh folder project (zip dulu di local, lalu upload)
3. Extract zip di `public_html/`

Opsi B - **Git** (kalau cPanel support):
```bash
cd ~/public_html
git clone <repo-url> ManagementStock_Tama
```

## Langkah 3: Setup di Terminal cPanel
Buka **Terminal** di cPanel, lalu jalankan:

```bash
cd ~/public_html/ManagementStock_Tama

# Install dependencies PHP (production only)
composer install --no-dev --optimize-autoloader

# Setup environment
cp .env.example .env
```

Edit `.env` dengan database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stockflow_db
DB_USERNAME=stockflow_user
DB_PASSWORD=password_anda
APP_URL=http://handispramudio.my.id
APP_ENV=production
APP_DEBUG=false
```

Lalu jalankan:
```bash
# Generate app key
php artisan key:generate

# Jalankan migration + seed data
php artisan migrate --seed --force

# Setup storage link
php artisan storage:link

# Build frontend
npm install
npm run build
```

## Langkah 4: Setup Document Root
Agar domain `handispramudio.my.id` langsung mengarah ke aplikasi:

1. Login cPanel → **Domains** (atau **Addon Domains**)
2. Atau buat **.htaccess** di `public_html/` dengan isi:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ ManagementStock_Tama/public/$1 [L]
</IfModule>
```

Atau set **Document Root** domain ke: `public_html/ManagementStock_Tama/public`

## Langkah 5: Setup .htaccess di public/
File `public/.htaccess` sudah ada dari Laravel (default). Pastikan isi:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## Langkah 6: SSL Certificate
1. cPanel → **SSL/TLS Status** (atau **Let's Encrypt**)
2. Pilih domain `handispramudio.my.id`
3. Install/Issue certificate
4. Force HTTPS redirect

## Langkah 7: Cek Aplikasi
Buka `http://handispramudio.my.id` di browser

### Login Credentials
| Email | Password | Role |
|-------|----------|------|
| admin@stockease.com | password | admin |
| budi@stockease.com | password | staff_gudang |
| siti@stockease.com | password | staff_penjualan |
| andi@stockease.com | password | owner |

## Troubleshooting

### 500 Internal Server Error
- Cek `storage/logs/laravel.log`
- Pastikan folder `storage/` dan `bootstrap/cache/` writable:
```bash
chmod -R 775 storage bootstrap/cache
```

### API 404
- Pastikan mod_rewrite aktif di Apache
- Cek `.htaccess` di folder `public/`

### Database Connection Error
- Cek credentials di `.env`
- Pastikan database name, username, dan password benar
- Pastikan user sudah di-grant ke database

### Frontend Tampil kosong
- Pastikan `npm run build` sudah dijalankan
- Cek folder `public/build/` ada isinya
