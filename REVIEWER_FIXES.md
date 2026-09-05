# Perbaikan berdasarkan catatan reviewer

- Validasi create dan update job dipisahkan menjadi `createJob` dan `updateJob`.
- `updateJob` menerima partial payload dan tidak lagi mewajibkan `company_id` maupun `category_id`.
- Handler `PUT /jobs/:id` hanya memperbarui kolom yang benar-benar dikirim sehingga field lain tidak berubah menjadi `null`.
- Schema update tidak menyisipkan default `status` atau `is_salary_visible` ketika kedua field tersebut tidak dikirim.
- Ditambahkan pemeriksaan regresi melalui `npm run check` untuk partial update, empty payload, dan invalid status.
- Seluruh nama migration menggunakan prefix Unix timestamp baru dan pemeriksaan struktur telah disesuaikan.
- Script migration menggunakan CLI `node-pg-migrate`, sehingga `npm run migrate create "nama-migration"` menghasilkan timestamp otomatis seperti instruksi reviewer.

Contoh payload yang sekarang diterima:

```json
{
  "title": "Senior Backend Developer Updated",
  "description": "Updated description",
  "salary_max": 30000000
}
```
