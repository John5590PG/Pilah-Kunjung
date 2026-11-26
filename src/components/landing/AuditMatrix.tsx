import { AUDIT_MATRIX } from "./content";

export function AuditMatrix() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10">
          <span className="inline-block rounded-full bg-green-pale px-4 py-1.5 text-sm font-semibold text-green-dark mb-4">
            Transparansi Teknis
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Matriks Kesiapan Prototipe
          </h2>
          <p className="mt-2 text-base text-muted max-w-xl">
            Status teknis per 27 November 2026 sesuai deklarasi kompetisi STACK 2026.
          </p>
        </div>

        <div className="overflow-hidden rounded-fib5 border border-green-line bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-green-line bg-green-mist font-semibold text-ink">
              <tr>
                <th className="px-5 py-4">Modul / Fitur</th>
                <th className="px-5 py-4 hidden sm:table-cell">Rincian Implementasi</th>
                <th className="px-5 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-line/60">
              {AUDIT_MATRIX.map((m, idx) => (
                <tr key={idx} className="unit-row">
                  <td className="px-5 py-4 font-semibold text-ink">{m.spec}</td>
                  <td className="px-5 py-4 text-muted text-sm leading-relaxed hidden sm:table-cell">{m.detail}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <span
                      className={`contrast-badge row-chip inline-block rounded-fib3 px-3 py-1 text-xs font-bold transition-colors ${
                        m.tier === "live"
                          ? "bg-op-bg text-op"
                          : m.tier === "tested"
                          ? "bg-green-pale text-green-dark"
                          : "bg-cl-bg text-cl"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
