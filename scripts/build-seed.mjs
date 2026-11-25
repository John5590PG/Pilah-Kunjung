// Converts seed/units.csv -> src/data/seed-units.json (prototype only).
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const rows = readFileSync(new URL("../seed/units.csv", import.meta.url), "utf8")
  .trim().split("\n").slice(1).map((l) => l.split(","));

const units = rows.map((r, i) => {
  const n = String(i + 1).padStart(2, "0");
  const num = (v) => (v === "" ? null : Number(v));
  return {
    id: `u${n}`,
    name: r[0],
    kelurahan: r[1],
    status: r[2],
    silentCycles: Number(r[3]),
    monthsSinceContact: num(r[4]),
    lastSignalDaysAgo: num(r[5]),
    contact: `62800000${n}00`, // obviously fake
    token: "demo-" + createHash("sha256").update("pilah-demo-" + n).digest("hex").slice(0, 24),
    isSynthetic: true,
  };
});

writeFileSync(new URL("../src/data/seed-units.json", import.meta.url), JSON.stringify(units, null, 2) + "\n");
console.log(`wrote ${units.length} units`);
