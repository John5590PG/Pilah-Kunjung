// Merges docs/00–10 + ADR 0001 into one Markdown file for single-PDF export.
// Source of truth remains the individual docs; this file is generated.
import { readFileSync, writeFileSync } from "node:fs";

const FILES = [
  ["doc-00", "00-PROJECT-BRIEF.md"],
  ["doc-01", "01-USER-FLOW.md"],
  ["doc-02", "02-ERD.md"],
  ["doc-03", "03-ARCHITECTURE.md"],
  ["doc-04", "04-SECURITY-UX.md"],
  ["doc-05", "05-UI-SCREENS.md"],
  ["doc-06", "06-RANKING-LOGIC.md"],
  ["doc-07", "07-ROADMAP-BY-ROLE.md"],
  ["doc-08", "08-FINAL-DAY-TASKS.md"],
  ["doc-09", "09-AI-DISCLOSURE.md"],
  ["doc-10", "10-GIT-DAN-VERCEL.md"],
  ["adr-0001", "adr/0001-stack.md"],
];

const docsDir = new URL("../docs/", import.meta.url);
const parts = FILES.map(([id, file]) => {
  const text = readFileSync(new URL(file, docsDir), "utf8").replace(/\r\n/g, "\n").trim();
  const title = text.split("\n")[0].replace(/^#\s+/, "").trim();
  return { id, title, text };
});

const toc = parts.map((p) => `- [${p.title}](#${p.id})`).join("\n");
const body = parts.map((p) => `<a id="${p.id}"></a>\n\n${p.text}`).join("\n\n---\n\n");

const out = `# Technical Design — Pilah & Kunjung

> Prototipe STACK 2026 · Case 2 · RumaSynapse Corp. · Pilot Kecamatan Gunungpati.
> **Semua data = SINTETIS.** Tidak ada bank sampah asli, tidak ada data warga. Tidak ada AI/ML di dalam produk.

Dokumen gabungan ini menyatukan \`docs/00\` sampai \`docs/10\` serta \`docs/adr/0001\` menjadi satu Markdown agar bisa diekspor sebagai **satu PDF**. **Source of truth tetap file asal** — setelah mengubah docs, jalankan \`npm run docs:build\` untuk regenerate.

Contoh ekspor: \`pandoc docs/TECHNICAL-DESIGN.md -o technical-design.pdf --number-sections\` atau ekstensi *Markdown PDF* di VS Code. Renderer harus mendukung diagram Mermaid.

## Daftar isi

${toc}

---

${body}
`;

writeFileSync(new URL("TECHNICAL-DESIGN.md", docsDir), out, "utf8");
console.log(`wrote docs/TECHNICAL-DESIGN.md (${parts.length} documents)`);
