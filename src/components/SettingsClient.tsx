"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/lib/appdata/provider";
import { apiFetch, apiPost } from "@/lib/api/client";
import { DEFAULT_CONFIG } from "@/lib/ranking";
import { Button } from "@/components/ui/button";
import { Ban, Calculator, CheckCircle2, Clock3, Info, SlidersHorizontal } from "lucide-react";

interface SettingRow {
  subDistrictId: string;
  subDistrictName: string;
  wSilent: number;
  wUnconfirmed: number;
  wPaused: number;
  cutoffDays: number;
  useDefaults: boolean;
}

type Weights = Pick<SettingRow, "wSilent" | "wUnconfirmed" | "wPaused" | "cutoffDays">;

type FieldKey = keyof Weights;

const FIELDS: Array<{ key: FieldKey; label: string; hint: string; min: number; max: number }> = [
  { key: "wSilent", label: "Pengali siklus diam", hint: "Dikalikan dengan M pada rumus", min: 0, max: 10 },
  { key: "wUnconfirmed", label: "Bobot Belum terkonfirmasi", hint: "Status W saat tanpa sinyal", min: 0, max: 10 },
  { key: "wPaused", label: "Bobot Dijeda", hint: "Status W saat unit libur sementara", min: 0, max: 10 },
  { key: "cutoffDays", label: "Batas cutoff", hint: "Hari sejak siklus dibuka", min: 1, max: 31 },
];

function pick(config: Weights): Weights {
  return {
    wSilent: config.wSilent,
    wUnconfirmed: config.wUnconfirmed,
    wPaused: config.wPaused,
    cutoffDays: config.cutoffDays,
  };
}

function validate(values: Weights): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  for (const field of FIELDS) {
    const value = values[field.key];
    if (!Number.isInteger(value) || value < field.min || value > field.max) {
      errors[field.key] = `Isi ${field.label.toLowerCase()} dengan angka ${field.min} sampai ${field.max}.`;
    }
  }
  return errors;
}

export function SettingsClient() {
  const { mode, config, actions, error: appError } = useAppData();
  const [role, setRole] = useState<string | null>(null);
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState<Weights>(pick(DEFAULT_CONFIG));
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "api") return;
    let alive = true;
    Promise.all([
      apiFetch<{ user: { role: string } }>("/api/auth/me"),
      apiFetch<{ settings: SettingRow[] }>("/api/settings"),
    ])
      .then(([me, data]) => {
        if (!alive) return;
        setRole(me.user.role);
        setRows(data.settings);
        setSelected((current) => current || data.settings[0]?.subDistrictId || "");
      })
      .catch(() => {
        if (alive) setRole(null);
      });
    return () => {
      alive = false;
    };
  }, [mode]);

  useEffect(() => {
    if (mode === "demo") {
      setForm(pick(config));
      return;
    }
    const row = rows.find((item) => item.subDistrictId === selected);
    if (row) setForm(pick(row));
  }, [mode, config, selected, rows]);

  const isAdmin = mode === "api" && role === "ADMIN";

  const guard = (
    event: React.FormEvent,
    commit: () => void | Promise<void>,
  ): void => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    const first = FIELDS.find((field) => found[field.key]);
    if (first) {
      document.getElementById(`weight-${first.key}`)?.focus();
      return;
    }
    setMessage(null);
    void commit();
  };

  const saveDemo = (event: React.FormEvent) =>
    guard(event, () => {
      actions.setDemoConfig(pick(form));
      setMessage("Bobot simulasi tersimpan di browser dan langsung dipakai dasbor.");
    });

  const saveApi = (event: React.FormEvent) =>
    guard(event, async () => {
      setSaving(true);
      try {
        const result = await apiPost<{ setting: SettingRow }>("/api/settings", {
          subDistrictId: selected,
          ...form,
        });
        const fresh = await apiFetch<{ settings: SettingRow[] }>("/api/settings");
        setRows(fresh.settings);
        setMessage(`Bobot ${result.setting.subDistrictName} tersimpan di database simulasi.`);
        await actions.refresh();
      } catch (cause) {
        setMessage(cause instanceof Error ? cause.message : "Gagal menyimpan.");
      } finally {
        setSaving(false);
      }
    });

  if (mode === "loading") {
    return (
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold">Pengaturan</h1>
        <p className="mt-4 text-sm text-muted">Mendeteksi mode data…</p>
      </div>
    );
  }

  const activeRows = mode === "api" && rows.length > 0 ? rows : [];
  const demoRows: SettingRow[] = [
    {
      subDistrictId: "demo",
      subDistrictName: "Mode demo (browser)",
      ...pick(config),
      useDefaults: true,
    },
  ];
  const shownRows = activeRows.length > 0 ? activeRows : demoRows;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
            <SlidersHorizontal className="h-4 w-4" />
            Sistem · Pengaturan
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Bobot Prioritas Kunjungan</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Heuristik awal (docs/06), belum divalidasi lapangan. Angka di sini adalah dummy untuk simulasi,
            bukan rekomendasi operasional.
          </p>
        </div>
        <span
          className={`rounded-fib3 border px-3 py-1.5 text-xs font-bold ${
            mode === "api"
              ? "border-green-light/70 bg-green-pale text-green-dark"
              : "border-amber-300/70 bg-amber-50 text-amber-900"
          }`}
        >
          {mode === "api" ? "Database aktif" : "Mode demo"}
        </span>
      </div>

      {mode === "demo" && (
        <p className="mt-5 flex items-start gap-2 rounded-fib4 border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Perubahan hanya tersimpan di browser. Untuk mode database, atur DATABASE_URL, jalankan migrasi dan seed,
            lalu masuk sebagai admin.
          </span>
        </p>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-fib5 border border-line bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-fib3 bg-green-pale text-green-dark">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">Editor bobot</h2>
              <p className="text-xs text-muted">
                {mode === "api" ? "Berlaku untuk kecamatan yang dipilih." : "Simulasi visual untuk sudut pandang DLH."}
              </p>
            </div>
          </div>

          <form onSubmit={mode === "demo" ? saveDemo : saveApi} className="mt-6 space-y-5" noValidate>
            {mode === "api" && (
              <div>
                <label htmlFor="district" className="mb-1.5 block text-sm font-semibold text-ink">
                  Kecamatan
                </label>
                <select
                  id="district"
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  className="h-12 w-full rounded-fib3 border border-line bg-white px-3 text-base text-ink transition-colors hover:border-green-mid focus-visible:border-green-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-light/60"
                >
                  <option value="">Pilih kecamatan</option>
                  {rows.map((row) => (
                    <option key={row.subDistrictId} value={row.subDistrictId}>
                      {row.subDistrictName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <div key={field.key}>
                  <label htmlFor={`weight-${field.key}`} className="mb-1.5 block text-sm font-semibold text-ink">
                    {field.label}
                  </label>
                  <input
                    id={`weight-${field.key}`}
                    type="number"
                    inputMode="numeric"
                    min={field.min}
                    max={field.max}
                    value={form[field.key]}
                    aria-invalid={Boolean(errors[field.key])}
                    aria-describedby={`hint-${field.key}`}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.key]: Number(event.target.value) }))
                    }
                    className="h-12 w-full rounded-fib3 border border-line bg-white px-3 text-base text-ink transition-colors hover:border-green-mid focus-visible:border-green-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-light/60"
                  />
                  <p id={`hint-${field.key}`} className="mt-1 text-xs text-muted">
                    {errors[field.key] ?? field.hint}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Pratinjau rumus</p>
              <p className="mt-1.5 font-mono text-lg font-bold text-green-dark">
                Skor = {form.wSilent} × M + W + B
              </p>
              <p className="mt-1 text-xs text-muted">
                W = status unit (Unconfirmed {form.wUnconfirmed}, Dijeda {form.wPaused}, Beroperasi 0).
                Operating weight tidak diubah.
              </p>
            </div>

            <div>
              <Button
                type="submit"
                disabled={saving || (mode === "api" && !selected)}
                className="h-12 w-full rounded-fib3 bg-green-mid px-5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-[2px] hover:bg-green-dark disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Menyimpan…" : mode === "demo" ? "Simpan simulasi" : "Simpan bobot kecamatan"}
              </Button>
              <p role="status" className="mt-2 min-h-[1.25rem] text-sm text-muted">
                {message ?? appError}
              </p>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-fib5 border border-line bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-brand" />
              <h2 className="text-sm font-bold text-ink">Nilai aktif</h2>
            </div>
            <div className="mt-4 overflow-hidden rounded-fib3 border border-line">
              <table className="w-full text-left text-xs">
                <thead className="bg-green-pale/60 text-green-dark">
                  <tr>
                    <th className="px-3 py-2">Kecamatan</th>
                    <th className="px-3 py-2 text-right">M</th>
                    <th className="px-3 py-2 text-right">U</th>
                    <th className="px-3 py-2 text-right">P</th>
                    <th className="px-3 py-2 text-right">Cutoff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shownRows.map((row) => (
                    <tr key={row.subDistrictId} className="wa-row">
                      <td className="px-3 py-2 font-semibold text-ink">{row.subDistrictName}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.wSilent}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.wUnconfirmed}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.wPaused}</td>
                      <td className="px-3 py-2 text-right font-mono">{row.cutoffDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-fib5 border border-line bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-green-brand" />
              <h2 className="text-sm font-bold text-ink">Catatan kebijakan</h2>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-brand" />
                Belum divalidasi lapangan, data yang dipakai sintetis.
              </li>
              <li className="flex items-start gap-2">
                <Calculator className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-brand" />
                Operating weight tetap 0 sesuai docs/06.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-brand" />
                Perubahan tercatat di audit log saat mode database.
              </li>
            </ul>
          </section>

          <section className="rounded-fib5 border border-line bg-white p-5 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-brand" />
              <h2 className="text-sm font-bold text-ink">Status sistem</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-muted">
              {[
                "Skema, migrasi, dan seed PostgreSQL",
                "Login, sesi, dan RBAC per kecamatan",
                "Endpoint POST tervalidasi + rate limit",
                "Rollover siklus dan ekspor CSV",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-brand" />
                  {item}
                </li>
              ))}
              <li className="flex items-start gap-2">
                <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                Belum: cron rollover, validasi lapangan, pratinjau token produksi.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
