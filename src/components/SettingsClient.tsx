"use client";

import { useEffect, useState } from "react";
import { useAppData } from "@/lib/appdata/provider";
import { apiFetch, apiPost } from "@/lib/api/client";
import { DEFAULT_CONFIG } from "@/lib/ranking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const FIELDS: Array<{ key: keyof Weights; label: string; min: number; max: number }> = [
  { key: "wSilent", label: "Silent-cycle multiplier (wSilent)", min: 0, max: 10 },
  { key: "wUnconfirmed", label: "Unconfirmed weight", min: 0, max: 10 },
  { key: "wPaused", label: "Paused weight", min: 0, max: 10 },
  { key: "cutoffDays", label: "Cycle cutoff (days)", min: 1, max: 31 },
];

function pick(config: Weights): Weights {
  return {
    wSilent: config.wSilent,
    wUnconfirmed: config.wUnconfirmed,
    wPaused: config.wPaused,
    cutoffDays: config.cutoffDays,
  };
}

function WeightForm({
  form,
  setForm,
  onSubmit,
  saving,
  submitLabel,
  extra,
}: {
  form: Weights;
  setForm: (next: Weights) => void;
  onSubmit: (event: React.FormEvent) => void;
  saving: boolean;
  submitLabel: string;
  extra?: React.ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-fib5 border border-line bg-white p-4 shadow-2xs">
      <div>
        <h2 className="font-bold">Edit bobot per kecamatan (simulasi admin)</h2>
        <p className="mt-1 text-xs text-muted">Perubahan langsung dipakai dasbor prioritas di sesi ini.</p>
      </div>
      {extra}
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((field) => (
          <label key={field.key} className="block text-xs font-bold text-ink">
            {field.label}
            <Input
              type="number"
              min={field.min}
              max={field.max}
              required
              value={form[field.key]}
              onChange={(event) => setForm({ ...form, [field.key]: Number(event.target.value) })}
              className="mt-1 rounded-fib3"
            />
          </label>
        ))}
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="rounded-fib3 bg-green-mid text-white hover:bg-green-dark disabled:opacity-60"
      >
        {saving ? "Menyimpan…" : submitLabel}
      </Button>
    </form>
  );
}

export function SettingsClient() {
  const { mode, config, actions, error: appError } = useAppData();
  const [role, setRole] = useState<string | null>(null);
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState<Weights>(pick(DEFAULT_CONFIG));
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

  const saveDemo = (event: React.FormEvent) => {
    event.preventDefault();
    actions.setDemoConfig(pick(form));
    setMessage("Tersimpan di browser untuk simulasi ini. Tidak ada data yang dikirim ke server.");
  };

  const saveApi = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await apiPost<{ setting: SettingRow }>("/api/settings", { subDistrictId: selected, ...form });
      const fresh = await apiFetch<{ settings: SettingRow[] }>("/api/settings");
      setRows(fresh.settings);
      setMessage(`Bobot ${result.setting.subDistrictName} tersimpan di database simulasi.`);
      await actions.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (mode === "loading") {
    return (
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold">Settings</h1>
        <p className="mt-4 text-sm text-muted">Mendeteksi mode data…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold">Settings</h1>
      <p className="mt-1 text-muted">
        Nilai di bawah adalah <b>heuristik awal</b> (docs/06) dan <b>belum divalidasi lapangan</b>. Form ini merupakan{" "}
        <b>visualisasi simulasi</b> untuk sudut pandang pengelola bank sampah di DLH. Semua angka adalah dummy, bukan
        rekomendasi operasional.
      </p>

      {mode === "demo" && (
        <p className="mt-4 rounded-fib3 border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <b>Mode demo tanpa database.</b> Perubahan bobot hanya disimpan di browser (localStorage) dan dipakai dasbor
          di sesi ini. Untuk menyimpan ke PostgreSQL, aktifkan <code>DATABASE_URL</code>, jalankan migrasi + seed, lalu
          login sebagai ADMIN (lihat README).
        </p>
      )}

      {mode === "api" && rows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-fib5 border border-line bg-white text-sm shadow-2xs">
          <table className="w-full">
            <thead className="bg-green-pale/60 text-left text-xs font-bold text-green-dark">
              <tr>
                <th className="px-4 py-2">Kecamatan</th>
                <th className="px-4 py-2 text-right">wSilent</th>
                <th className="px-4 py-2 text-right">wUnconfirmed</th>
                <th className="px-4 py-2 text-right">wPaused</th>
                <th className="px-4 py-2 text-right">Cutoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row) => (
                <tr key={row.subDistrictId} className="wa-row">
                  <td className="px-4 py-2 font-semibold">
                    {row.subDistrictName}
                    {row.useDefaults && <span className="ml-2 text-xs text-muted">(default)</span>}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{row.wSilent}</td>
                  <td className="px-4 py-2 text-right font-mono">{row.wUnconfirmed}</td>
                  <td className="px-4 py-2 text-right font-mono">{row.wPaused}</td>
                  <td className="px-4 py-2 text-right font-mono">{row.cutoffDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mode === "demo" && (
        <table className="mt-4 w-full rounded-fib5 border border-line bg-white text-sm shadow-2xs">
          <tbody className="divide-y divide-line">
            {[
              ["Silent-cycle multiplier (wSilent)", config.wSilent],
              ["Unconfirmed weight", config.wUnconfirmed],
              ["Paused weight", config.wPaused],
              ["Operating weight", 0],
              ["Cycle cutoff (days)", config.cutoffDays],
            ].map(([key, value]) => (
              <tr key={String(key)} className="wa-row">
                <td className="px-4 py-2">{key}</td>
                <td className="px-4 py-2 text-right font-mono font-bold">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-3 text-sm text-muted">Operating weight selalu 0 dan tidak diubah (docs/06).</p>

      {(message ?? appError) && (
        <p role="status" className="mt-4 rounded-fib3 border border-line bg-green-pale/50 px-3 py-2 text-sm">
          {message ?? appError}
        </p>
      )}

      {mode === "demo" && (
        <WeightForm
          form={form}
          setForm={setForm}
          onSubmit={saveDemo}
          saving={false}
          submitLabel="Simpan simulasi (browser)"
        />
      )}

      {isAdmin && (
        <WeightForm
          form={form}
          setForm={setForm}
          onSubmit={saveApi}
          saving={saving}
          submitLabel="Simpan bobot simulasi"
          extra={
            <label className="block text-xs font-bold text-ink">
              Kecamatan
              <select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="mt-1 h-10 w-full rounded-fib3 border border-line bg-white px-3 text-sm"
              >
                <option value="">Pilih kecamatan…</option>
                {rows.map((row) => (
                  <option key={row.subDistrictId} value={row.subDistrictId}>
                    {row.subDistrictName}
                  </option>
                ))}
              </select>
            </label>
          }
        />
      )}

      <h2 className="mt-6 font-bold">Backend built (API level)</h2>
      <ul className="mt-1 list-disc pl-5 text-sm text-muted">
        <li>PostgreSQL schema, initial migration, and synthetic seed (prisma/)</li>
        <li>Login API with scrypt hashing, signed httpOnly session, RBAC per sub-district</li>
        <li>Server-side POST endpoints with Zod validation and rate limiting</li>
        <li>Unit archive, token rotation/revocation, and per-sub-district weight settings</li>
        <li>Cycle rollover and CSV export of the visit-priority list</li>
        <li>UI switches to PostgreSQL automatically when DATABASE_URL is set</li>
      </ul>

      <h2 className="mt-6 font-bold">Not built yet</h2>
      <ul className="mt-1 list-disc pl-5 text-sm text-muted">
        <li>Cron scheduling for automatic rollover (currently admin-triggered)</li>
        <li>Field validation of the weighting heuristic (data is synthetic)</li>
        <li>Production token preview via POST /api/units/[id]/token</li>
      </ul>
    </div>
  );
}
