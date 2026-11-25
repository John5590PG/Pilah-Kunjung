# 10 — Git (commit, push, merge) dan deploy Vercel gratis

## A. Git: bawa prototipe ke repo GitHub yang ada
Ganti `<USERNAME>` dan `<REPO>`. Branch utama bisa `main` atau `master` (cek di GitHub).
```bash
git clone https://github.com/<USERNAME>/<REPO>.git && cd <REPO>
git checkout -b feat/prototype-v1

# salin isi folder prototipe ke repo (tanpa node_modules/.next)
rsync -a --exclude node_modules --exclude .next --exclude .git ../pilah-kunjung/ ./
# Windows tanpa rsync: salin manual isi folder pilah-kunjung ke repo (jangan salin node_modules & .next)

npm install && npm test && npm run build     # pastikan hijau sebelum commit
git status                                   # pastikan tidak ada .env / node_modules
git add .
git commit -m "feat: clickable prototype (4 screens, simulated Gunungpati data)"
git push -u origin feat/prototype-v1
```
**Merge (pilih satu):**
```bash
# 1) Lewat Pull Request (disarankan)
gh pr create --base main --head feat/prototype-v1 --title "Prototype v1" --body "4-screen clickable flow, synthetic data"
gh pr merge --squash --delete-branch
# (tanpa gh: buka repo di GitHub -> "Compare & pull request" -> "Merge pull request")

# 2) Merge lokal
git checkout main && git pull
git merge --no-ff feat/prototype-v1
git push origin main
```
Setelah merge: `git checkout main && git pull`.
Jika repo berisi riwayat lain dan `git push` ditolak: `git pull --rebase origin main` lalu push lagi (jangan `--force`).

## B. Deploy ke Vercel (paket Hobby gratis)
1. Buka vercel.com -> **Sign Up / Log in with GitHub**, izinkan akses ke repo `<REPO>`.
2. **Add New… -> Project -> Import** repo `<REPO>`.
3. Framework otomatis **Next.js**. Jika proyek ada di subfolder repo, isi **Root Directory** = `pilah-kunjung`. Build/Output biarkan default.
4. Environment Variables: **tidak perlu** (prototipe tanpa database). Klik **Deploy**.
5. Selesai: Vercel memberi URL `https://<nama>.vercel.app`. Setiap `git push` ke `main` otomatis deploy ulang; branch/PR mendapat URL Preview.
6. Uji URL di ponsel: buka `/`, ikuti 4 langkah. Cantumkan URL itu di proposal/video sebagai "prototype (simulated data)".

Alternatif CLI: `npm i -g vercel && vercel login && vercel --prod`.
Catatan: paket Hobby ditujukan untuk penggunaan pribadi/non-komersial (cukup untuk lomba). Nanti saat backend ada, tambahkan `DATABASE_URL`, `AUTH_SECRET`, `TOKEN_PEPPER` di Vercel -> Settings -> Environment Variables (jangan commit `.env`).
