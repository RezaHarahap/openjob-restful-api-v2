# openjob_api

Proyek API utama OpenJob V2. Jalankan `npm install`, salin `.env.example` menjadi `.env`, jalankan `npm run migrate:up`, lalu `npm run start:dev`.

Migration baru dapat dibuat menggunakan perintah standar `npm run migrate create "nama-migration"`; `node-pg-migrate` akan menambahkan Unix timestamp secara otomatis.

API ini mempertahankan endpoint OpenJob V1 dan menambahkan:

- penyimpanan serta penyajian PDF di `/documents`;
- cache Redis dengan TTL 3600 detik dan invalidasi;
- publisher RabbitMQ dengan payload tunggal `application_id` setelah lamaran tersimpan.

Lihat README pada direktori induk untuk cara menjalankan seluruh sistem.
