# OpenJob RESTful API Versi 2

OpenJob RESTful API Versi 2 adalah proyek Back-End berbasis **Node.js**, **Express.js**, dan **PostgreSQL** yang mengembangkan fitur pencarian lowongan kerja dengan dukungan autentikasi, pengelolaan profil pengguna, dokumen, bookmark, lamaran pekerjaan, caching Redis, serta message queue menggunakan RabbitMQ.

Repository ini terdiri dari dua aplikasi utama:

- `openjob_api` — RESTful API utama.
- `openjob_consumer` — consumer RabbitMQ untuk memproses pesan secara asynchronous dan mengirim email.

## Fitur Utama

- Registrasi dan autentikasi pengguna.
- Access token dan refresh token berbasis JWT.
- Pengelolaan profil pengguna.
- Pengelolaan lowongan pekerjaan.
- Kategori dan perusahaan.
- Bookmark lowongan.
- Lamaran pekerjaan.
- Upload dan pengelolaan dokumen.
- Validasi request.
- PostgreSQL sebagai database utama.
- Redis untuk caching.
- RabbitMQ untuk message queue.
- Consumer terpisah untuk proses asynchronous.
- Pengiriman email melalui Nodemailer.

## Teknologi

- Node.js
- Express.js
- PostgreSQL
- node-pg-migrate
- JSON Web Token
- Joi
- Multer
- Redis
- RabbitMQ / amqplib
- Nodemailer
- dotenv

## Struktur Project

```text
.
├── openjob_api/
│   ├── scripts/
│   ├── src/
│   │   ├── database/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── uploads/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── openjob_consumer/
│   ├── src/
│   │   └── consumer.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml
├── REVIEWER_FIXES.md
└── SUBMISSION_CHECKLIST.md
```

## Instalasi API

Masuk ke folder API:

```bash
cd openjob_api
```

Install dependency:

```bash
npm install
```

Salin konfigurasi environment:

```bash
cp .env.example .env
```

Sesuaikan nilai di `.env` dengan konfigurasi PostgreSQL, Redis, RabbitMQ, dan JWT milik Anda.

## Menjalankan Migration

Jalankan migration database sesuai script yang tersedia pada project:

```bash
npm run migrate up
```

Jika script migration berbeda pada `package.json`, gunakan perintah yang tercantum di sana.

## Menjalankan API

Development:

```bash
npm run start:dev
```

atau sesuai script yang tersedia:

```bash
npm start
```

## Menjalankan Consumer

Buka terminal terpisah:

```bash
cd openjob_consumer
npm install
cp .env.example .env
npm start
```

Consumer akan terhubung ke RabbitMQ dan memproses pesan yang dikirim oleh API.

## Layanan Pendukung

Project membutuhkan beberapa layanan:

- PostgreSQL
- Redis
- RabbitMQ

File `docker-compose.yml` disediakan untuk membantu menyiapkan layanan pendukung secara lokal apabila Docker tersedia.

## Environment Variable

Gunakan file `.env.example` sebagai acuan. Jangan commit file `.env` yang berisi credential asli.

Contoh jenis variabel yang mungkin diperlukan:

```env
HOST=localhost
PORT=5000

PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=openjob
PGHOST=localhost
PGPORT=5432

ACCESS_TOKEN_KEY=your_access_token_key
REFRESH_TOKEN_KEY=your_refresh_token_key

REDIS_SERVER=localhost
RABBITMQ_SERVER=amqp://localhost
```

Konfigurasi consumer dapat membutuhkan credential email sesuai implementasi di `openjob_consumer/.env.example`.

## Keamanan Repository

File credential asli tidak disimpan di repository publik. Pastikan file berikut tetap diabaikan:

```text
.env
node_modules/
coverage/
```

Gunakan nilai dummy atau placeholder pada `.env.example` dan jangan menyimpan password, token, maupun API key asli di GitHub.

## Author

**Muhammad Reza Pahlevi Harahap**

GitHub: https://github.com/RezaHarahap

---

Project ini dibuat sebagai bagian dari pembelajaran pengembangan RESTful API dan penerapan caching serta message queue pada aplikasi Back-End.