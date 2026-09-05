# openjob_consumer

Program terpisah untuk mengonsumsi queue `job_applications`. Consumer menerima pesan `{ "application_id": "..." }`, mengambil data pemilik lowongan dan pelamar dari PostgreSQL, kemudian mengirim email melalui Nodemailer kepada pemilik lowongan.

Jalankan `npm install`, salin `.env.example` menjadi `.env`, lalu jalankan `npm run start:dev`.
