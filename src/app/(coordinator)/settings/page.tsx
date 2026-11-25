import type { Metadata } from "next";
import { DEFAULT_CONFIG } from "@/lib/ranking";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  const c = DEFAULT_CONFIG;
  const rows: [string, string | number][] = [
    ["Silent-cycle multiplier (wSilent)", c.wSilent],
    ["Unconfirmed weight", c.wUnconfirmed],
    ["Paused weight", c.wPaused],
    ["Operating weight", 0],
    ["Cycle cutoff (days)", c.cutoffDays],
  ];
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-extrabold">Settings</h1>
      <p className="mt-1 text-muted">Read-only in the prototype. Editable weights per sub-district are planned (admin role).</p>
      <table className="mt-4 w-full rounded-2xl border border-line bg-white text-sm">
        <tbody className="divide-y divide-line">
          {rows.map(([k, v]) => (
            <tr key={k}><td className="px-4 py-2">{k}</td><td className="px-4 py-2 text-right font-mono font-bold">{v}</td></tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-sm text-muted">Weights are the team’s initial heuristic (docs/06) and are not yet validated.</p>
      <h2 className="mt-6 font-bold">Planned, not built yet</h2>
      <ul className="mt-1 list-disc pl-5 text-sm text-muted">
        <li>Real login and roles (coordinator / DLH advisor / admin)</li>
        <li>Unit add / archive, link rotation and revocation</li>
        <li>Database (PostgreSQL) and server-side POST endpoints with rate limiting</li>
        <li>Automatic cycle rollover</li>
      </ul>
    </div>
  );
}
