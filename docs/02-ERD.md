# 02 — ERD
```mermaid
erDiagram
  SUB_DISTRICTS ||--o{ UNITS : contains
  SUB_DISTRICTS ||--o{ USERS : "assigned to"
  UNITS ||--o{ UNIT_TOKENS : "has links"
  UNITS ||--o{ CHECKIN_SIGNALS : sends
  UNITS ||--o{ VISIT_CONFIRMATIONS : receives
  UNITS ||--o{ MESSAGE_DRAFTS : "targeted by"
  REPORTING_CYCLES ||--o{ CHECKIN_SIGNALS : groups
  REPORTING_CYCLES ||--o{ MESSAGE_DRAFTS : generates
  USERS ||--o{ VISIT_CONFIRMATIONS : records
  USERS ||--o{ MESSAGE_DRAFTS : "marks sent"
  USERS ||--o{ AUDIT_LOGS : acts
  SUB_DISTRICTS ||--o{ RANKING_SETTINGS : configures
  SUB_DISTRICTS { uuid id PK
    string name }
  UNITS { uuid id PK
    uuid sub_district_id FK
    string name
    string kelurahan
    string manager_contact
    enum current_status
    datetime last_signal_at
    datetime last_visited_at
    bool is_synthetic
    datetime archived_at }
  UNIT_TOKENS { uuid id PK
    uuid unit_id FK
    string token_hash
    datetime created_at
    datetime revoked_at }
  REPORTING_CYCLES { uuid id PK
    string period_label
    datetime opened_at
    datetime cutoff_at }
  CHECKIN_SIGNALS { uuid id PK
    uuid unit_id FK
    uuid cycle_id FK
    enum reported_status
    enum source_role
    datetime submitted_at
    datetime undone_at }
  VISIT_CONFIRMATIONS { uuid id PK
    uuid unit_id FK
    uuid coordinator_id FK
    enum contact_mode
    enum verified_status
    string action_note
    datetime verified_at }
  MESSAGE_DRAFTS { uuid id PK
    uuid cycle_id FK
    uuid unit_id FK
    string message_text
    uuid sent_by FK
    datetime sent_at }
  USERS { uuid id PK
    uuid sub_district_id FK
    string email
    string password_hash
    enum role }
  RANKING_SETTINGS { uuid id PK
    uuid sub_district_id FK
    int w_silent
    int w_unconfirmed
    int w_paused
    int cutoff_days }
  AUDIT_LOGS { uuid id PK
    uuid user_id FK
    string action
    string target
    datetime at }
```
## Catatan desain
- **unit_tokens dipisah dari units** (beda dengan skema proposal): token mentah tidak disimpan, hanya hash; bisa dirotasi/dicabut tanpa mengubah unit. Perbarui tabel di proposal 4.2 bila memakai ini.
- **current_status** adalah salinan turunan (denormalisasi) agar dasbor cepat; sumber kebenaran = checkin_signals + visit_confirmations.
- **Unconfirmed** tidak diinput manusia: dihitung saat cutoff_at lewat tanpa sinyal.
- **Tidak ada tabel nasabah/transaksi.** Zero resident PII.
- **ranking_settings** membuat bobot dan batas hari bisa diatur DLH (risiko "otoritas definisi aktif").
- Semua data demo: is_synthetic = true; UI menampilkan lencana "SIMULATED DATA".

## Aturan perubahan status
| Dari | Ke | Oleh |
|------|----|------|
| apa pun | Operating/Paused/Closed(usulan) | Pengurus (Closed hanya usulan -> perlu verifikasi korcam) |
| Unconfirmed | Operating/Paused/Closed | Korcam setelah kontak, atau pengurus |
| Operating/Paused | Unconfirmed | Sistem saat cutoff tanpa sinyal |
| Closed (terverifikasi) | Operating | Korcam saja (pembukaan kembali) |
