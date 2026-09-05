# Checklist OpenJob V2

## Struktur wajib

- [x] `openjob_api/package.json` — aplikasi Express utama.
- [x] `openjob_consumer/package.json` — consumer RabbitMQ independen.
- [x] Kedua proyek berkomunikasi melalui queue `job_applications`.
- [x] Tidak ada `.env`, `node_modules`, atau ZIP bersarang dalam paket final.

## Kriteria 1 — PDF (Advanced)

- [x] Multer dengan field `document`.
- [x] MIME wajib `application/pdf`.
- [x] Batas ukuran 5 MB.
- [x] Metadata dan nama file tersimpan di tabel `documents` melalui migration timestamp.
- [x] Daftar, tampil/download, dan hapus dokumen tersedia.

## Kriteria 2 — Redis (Advanced)

- [x] TTL cache 3600 detik.
- [x] `REDIS_HOST` tersedia di `.env.example`.
- [x] Cache company detail, user detail, application detail, application per user/job, dan bookmarks.
- [x] Cache hit/miss mengembalikan `X-Data-Source: cache|database`.
- [x] Invalidation diterapkan pada mutasi company, user, application, dan bookmark.

## Kriteria 3 — RabbitMQ (Advanced)

- [x] Publisher hanya mengirim `application_id` setelah INSERT berhasil.
- [x] Kredensial RabbitMQ memakai environment variables.
- [x] Consumer terpisah memproses pesan asynchronous.
- [x] Nodemailer memakai `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, dan `MAIL_PASSWORD`.
- [x] Pemilik job dicari dari database dan menjadi satu-satunya penerima.
- [x] Isi email memuat nama, email, dan tanggal lamaran dari database.

Pengujian akhir tetap perlu dilakukan di mesin lokal dengan PostgreSQL, Redis, RabbitMQ, SMTP/Mailpit, dan collection Postman V2 resmi.
