# Database Management — StockEase

## Informasi Database

| Item               | Detail                          |
| ------------------ | ------------------------------- |
| DBMS               | MySQL 8.0+                      |
| Koneksi            | MySQL / MariaDB                 |
| Host               | `127.0.0.1` (local)             |
| Port               | `3306`                          |
| Nama Database      | `stockflow_db` (local) / `hank7435_tamaDB` (production) |
| User               | `your_db_username` (local) / `hank7435_tamaDB` (production) |
| Password           | `your_db_password` (local) / lihat di `.env` production |
| Charset            | `utf8mb4`                       |
| Collation          | `utf8mb4_unicode_ci`            |

---

## Daftar Tabel (Migration)

| #  | Tabel             | Keterangan                          |
| -- | ----------------- | ----------------------------------- |
| 1  | `users`           | User/petugas login                  |
| 2  | `kategori`        | Kategori barang                     |
| 3  | `supplier`        | Data supplier                       |
| 4  | `customer`        | Data customer                       |
| 5  | `gudang`          | Data gudang/penyimpanan             |
| 6  | `barang`          | Master barang                       |
| 7  | `stok_masuk`      | Transaksi stok masuk                |
| 8  | `stok_keluar`     | Transaksi stok keluar               |
| 9  | `aktivitas`       | Log aktivitas user                  |
| 10 | `notifikasi`      | Notifikasi stok menipis/habis       |
| 11  | `settings`        | Pengaturan aplikasi                 |
| 12 | `personal_access_tokens` | Token API (Sanctum)          |
| 13 | `sessions`        | Session user login                  |
| 14 | `cache`           | Cache Laravel                       |
| 15 | `cache_locks`     | Lock cache                          |
| 16 | `migrations`      | Riwayat migration                   |

---

## Backup Database

### Via phpMyAdmin (cPanel)
1. Login cPanel → **phpMyAdmin**
2. Pilih database `hank7435_tamaDB`
3. Tab **Export** → **Quick** → **Go**
4. Simpan file `.sql`

### Via SSH
```bash
mysqldump -u hank7435_tamaDB -p hank7435_tamaDB > ~/backup/stockease_$(date +%Y%m%d_%H%M%S).sql
```
Password: lihat di `.env`

### Via Command (Local)
```bash
php artisan db:dump
```
atau
```bash
mysqldump -u root -p stockflow_db > backup.sql
```

### Auto Backup Recommendation
Tambahkan cron job di cPanel:
```
0 3 * * * /usr/bin/mysqldump -u hank7435_tamaDB -p'tamaganteng' hank7435_tamaDB > /home/hank7435/backup/stockease_$(date +\%Y\%m\%d).sql
```
(Catatan: menyimpan password di cron tidak aman — alternatifnya gunakan `~/.my.cnf`)

---

## Restore Database

### Via phpMyAdmin
1. Login cPanel → **phpMyAdmin**
2. Pilih database `hank7435_tamaDB`
3. Tab **Import** → pilih file `.sql` → **Go**

### Via SSH
```bash
mysql -u hank7435_tamaDB -p hank7435_tamaDB < backup.sql
```

### Via Artisan (Local)
```bash
php artisan migrate:fresh --seed
```
⚠️ Perintah ini menghapus SEMUA data dan menjalankan seeder awal.

---

## Migrasi & Perubahan Skema

### Menjalankan migrasi
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate
```
Atau untuk production:
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate --force
```

### Rollback migrasi
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate:rollback
```

### Membuat migrasi baru
```bash
php artisan make:migration create_nama_tabel_table
```

### Refresh migrasi (data hilang)
```bash
php artisan migrate:fresh --seed
```

---

## Maintenance Mode

### Aktifkan
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan down --retry=60
```
Mengembalikan `503 Service Unavailable` selama 60 detik.

### Nonaktifkan
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan up
```

---

## Troubleshooting

### 1. "Connection refused" / "Unknown database"
Cek kredensial di `.env`:
```bash
cat ~/StockEase/.env | grep DB_
```
Pastikan:
- `DB_HOST` benar (biasanya `localhost`)
- `DB_DATABASE` sesuai
- `DB_USERNAME` dan `DB_PASSWORD` benar

### 2. "Table not found"
Jalankan migrasi:
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate --force
```

### 3. Migrasi gagal "proc_open disabled"
Abaikan error `package:discover` — itu tidak fatal. Lanjutkan dengan:
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate --force
```

### 4. Database corrupt / error berat
Restore dari backup, lalu jalankan migrasi:
```bash
mysql -u hank7435_tamaDB -p hank7435_tamaDB < backup_terbaru.sql
/opt/cpanel/ea-php84/root/usr/bin/php artisan migrate --force
```

### 5. Perubahan di .env tidak生效
Clear cache:
```bash
/opt/cpanel/ea-php84/root/usr/bin/php artisan config:clear
/opt/cpanel/ea-php84/root/usr/bin/php artisan config:cache
```

---

## Informasi Server Production (Rumahweb)

| Item           | Detail                                    |
| -------------- | ----------------------------------------- |
| Hosting        | Rumahweb Shared Hosting                   |
| cPanel User    | `hank7435`                                |
| Hostname       | `handispramudio.my.id` / `stockflow.handispramudio.my.id` |
| SSH Port       | `2223`                                    |
| PHP            | 8.4 (`/opt/cpanel/ea-php84/root/usr/bin/php`) |
| MySQL          | phpMyAdmin via cPanel                     |
| DB Nama        | `hank7435_tamaDB`                         |
| DB User        | `hank7435_tamaDB`                         |
| DB Password    | Lihat di `.env`                           |
| Document Root  | `/home/hank7435/StockEase/public`         |

---

## Cara Melindungi Database

1. Backup rutin — minimal **seminggu sekali**
2. Simpan backup di 2 tempat: server & lokal
3. Sebelum `migrate:fresh` atau perubahan skema — **backup dulu**
4. Jangan pernah commit `.env` ke git (sudah di `.gitignore`)
5. Ganti password database jika ada user yang keluar
