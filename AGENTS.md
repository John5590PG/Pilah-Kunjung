# Aturan untuk asisten AI / kontributor
Baca README.md lalu docs/ sesuai urutan. Aturan keras:
1. Produk TIDAK memakai AI/ML. Peringkat kunjungan = rumus deterministik di docs/06 (src/lib/ranking).
2. Jangan simpan data pribadi warga (nama nasabah, NIK, alamat rumah, saldo). Hanya data tingkat unit + kontak pengurus.
3. Semua data seed/demo wajib berlabel SYNTHETIC. Jangan mengarang angka lapangan.
4. GET tidak boleh mengubah data. Perubahan status hanya lewat POST (alasan: pratinjau tautan WhatsApp).
5. Token mentah tidak pernah disimpan atau dicatat di log; simpan hash SHA-256.
6. Fitur yang belum dikerjakan jangan ditulis sebagai selesai (README, UI, proposal).
7. Bantuan AI yang material dicatat di docs/09-AI-DISCLOSURE.md (tool + peran).
8. Setiap perubahan skema: ubah prisma/schema.prisma DAN docs/02-ERD.md bersamaan.
9. Teks UI pengurus: Bahasa Indonesia sederhana. Teks dasbor/dokumentasi: Inggris untuk juri, ID untuk internal.
