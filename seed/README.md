# Seed data (SYNTHETIC)

`units.csv` = 30 fictional units for the Gunungpati simulation. **No real waste bank names.**
Columns: name, kelurahan, status, silent_cycles, months_since_contact (empty = never),
last_signal_days_ago (empty = never), is_synthetic (always true).

Rows 01, 02, 03 reproduce examples A/B/C in `docs/06-RANKING-LOGIC.md` (scores 11, 5, 0).

`src/data/seed-units.json` is generated from this CSV: `npm run seed:build`.
Demo tokens in that JSON are deterministic and NOT secure — they exist only so the
clickable prototype works without a backend. Real tokens: random 128-bit, stored as hash (planned).
