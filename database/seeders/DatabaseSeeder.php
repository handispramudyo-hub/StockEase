<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        DB::table('users')->insert([
            [
                'nama' => 'Administrator',
                'email' => 'admin@stockease.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'Budi Santoso',
                'email' => 'budi@stockease.com',
                'password' => Hash::make('password'),
                'role' => 'staff_gudang',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'Siti Rahayu',
                'email' => 'siti@stockease.com',
                'password' => Hash::make('password'),
                'role' => 'staff_penjualan',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'Andi Wijaya',
                'email' => 'andi@stockease.com',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'status' => 'aktif',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        DB::table('kategoris')->insert([
            ['nama' => 'ATK', 'warna' => '#F59E0B', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Elektronik', 'warna' => '#8B5CF6', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Minuman', 'warna' => '#3B82F6', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('suppliers')->insert([
            ['nama' => 'PT. Sumber Rejeki', 'email' => 'info@sumberrejeki.co.id', 'telepon' => '021-5551234', 'alamat' => 'Jl. Raya Utama No. 123, Jakarta Pusat', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'CV. Berkah Jaya', 'email' => 'berkah@jaya.co.id', 'telepon' => '021-5555678', 'alamat' => 'Jl. Semangat No. 45, Jakarta Selatan', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'UD. Makmur Abadi', 'email' => 'makmur@abadi.co.id', 'telepon' => '021-5559012', 'alamat' => 'Jl. Sejahtera No. 67, Jakarta Barat', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('customers')->insert([
            ['nama' => 'Toko ABC', 'email' => 'tokoabc@email.com', 'telepon' => '081234567890', 'alamat' => 'Jl. Merdeka No. 10, Bandung', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'CV. Jaya Bersama', 'email' => 'jaya@bersama.co.id', 'telepon' => '081234567891', 'alamat' => 'Jl. Pahlawan No. 25, Surabaya', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Warung Berkah', 'email' => 'berkah@email.com', 'telepon' => '081234567892', 'alamat' => 'Jl. Kenanga No. 8, Semarang', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('gudangs')->insert([
            ['nama' => 'Gudang Utama', 'lokasi' => 'Jakarta Pusat', 'created_at' => $now, 'updated_at' => $now],
            ['nama' => 'Gudang Cabang', 'lokasi' => 'Jakarta Selatan', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('barangs')->insert([
            [
                'kode_barang' => 'BRG-001', 'barcode' => '8991234567890', 'nama' => 'Kertas A4 70g',
                'kategori_id' => 1, 'supplier_id' => 1, 'gudang_id' => 1,
                'harga_beli' => 45000, 'harga_jual' => 55000, 'stok' => 150, 'stok_minimum' => 20,
                'satuan' => 'PCS', 'gambar' => null, 'status' => 'aktif',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang' => 'BRG-002', 'barcode' => '8991234567891', 'nama' => 'Pulpen Pilot',
                'kategori_id' => 1, 'supplier_id' => 1, 'gudang_id' => 1,
                'harga_beli' => 3000, 'harga_jual' => 5000, 'stok' => 200, 'stok_minimum' => 30,
                'satuan' => 'PCS', 'gambar' => null, 'status' => 'aktif',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang' => 'BRG-003', 'barcode' => '8991234567892', 'nama' => 'Aqua 600ml',
                'kategori_id' => 3, 'supplier_id' => 3, 'gudang_id' => 1,
                'harga_beli' => 3000, 'harga_jual' => 4000, 'stok' => 300, 'stok_minimum' => 40,
                'satuan' => 'BOTOL', 'gambar' => null, 'status' => 'aktif',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang' => 'BRG-004', 'barcode' => '8991234567893', 'nama' => 'Tinta Printer Canon',
                'kategori_id' => 2, 'supplier_id' => 2, 'gudang_id' => 2,
                'harga_beli' => 85000, 'harga_jual' => 110000, 'stok' => 8, 'stok_minimum' => 10,
                'satuan' => 'BOTOL', 'gambar' => null, 'status' => 'aktif',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'kode_barang' => 'BRG-005', 'barcode' => '8991234567894', 'nama' => 'Mouse Logitech',
                'kategori_id' => 2, 'supplier_id' => 2, 'gudang_id' => 2,
                'harga_beli' => 120000, 'harga_jual' => 175000, 'stok' => 15, 'stok_minimum' => 5,
                'satuan' => 'UNIT', 'gambar' => null, 'status' => 'aktif',
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);

        DB::table('stok_masuks')->insert([
            ['barang_id' => 1, 'qty' => 50, 'tanggal' => '2026-07-05', 'keterangan' => 'Pengadaan awal', 'dari_siapa' => 'PT. Sumber Rejeki', 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 2, 'qty' => 100, 'tanggal' => '2026-07-05', 'keterangan' => 'Pengadaan awal', 'dari_siapa' => 'PT. Sumber Rejeki', 'created_at' => $now, 'updated_at' => $now],
            ['barang_id' => 3, 'qty' => 300, 'tanggal' => '2026-07-05', 'keterangan' => 'Pengadaan awal', 'dari_siapa' => 'UD. Makmur Abadi', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('stok_keluars')->insert([
            ['barang_id' => 4, 'qty' => 2, 'tanggal' => '2026-07-16', 'keterangan' => 'Barang rusak', 'tujuan' => 'Gudang Retur', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('aktivitas')->insert([
            ['user_id' => 1, 'aktivitas' => 'Login ke sistem', 'waktu' => '2026-07-15 08:00:00'],
            ['user_id' => 1, 'aktivitas' => 'Update stok Kertas A4', 'waktu' => '2026-07-15 08:15:00'],
            ['user_id' => 1, 'aktivitas' => 'Stok masuk: Aqua 600ml +100 dari UD. Makmur Abadi', 'waktu' => '2026-07-15 11:00:00'],
            ['user_id' => 1, 'aktivitas' => 'Stok keluar: Tinta Printer Canon -2 ke Gudang Retur (Barang rusak)', 'waktu' => '2026-07-15 13:00:00'],
            ['user_id' => null, 'aktivitas' => 'Update stok keluar: Tinta Printer Canon qty 2 ke Gudang Retur', 'waktu' => '2026-07-16 00:00:00'],
        ]);

        DB::table('notifikasis')->insert([
            ['judul' => 'Stok Menipis', 'pesan' => 'Tinta Printer Canon hanya tersisa 8 unit', 'status' => 'unread', 'waktu' => '2026-07-15 08:00:00'],
            ['judul' => 'Stok Habis', 'pesan' => 'Laptop Lenovo stok sudah habis', 'status' => 'unread', 'waktu' => '2026-07-15 08:00:00'],
            ['judul' => 'Stok Menipis', 'pesan' => 'Mouse Logitech hanya tersisa 5 unit', 'status' => 'unread', 'waktu' => '2026-07-15 08:00:00'],
        ]);

        DB::table('settings')->insert([
            [
                'nama_aplikasi' => 'StockFlow', 'nama_perusahaan' => 'PT. StockFlow Indonesia',
                'alamat' => 'Jl. Teknologi No. 123, Jakarta', 'telepon' => '021-12345678',
                'email' => 'info@stockflow.co.id', 'website' => 'www.stockflow.co.id',
                'logo' => null, 'footer' => '© 2026 StockFlow. All rights reserved.',
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);
    }
}
