/**
 * Seed synthetic data (30 units, Kota Semarang pilot) into PostgreSQL.
 * Run: npm run db:seed  (or npx prisma db seed)
 *
 * Everything here is SYNTHETIC (isSynthetic = true). No resident data.
 * Raw demo tokens are hashed with TOKEN_PEPPER before they touch the database.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { createHash, randomBytes, scryptSync } from "node:crypto";

function loadEnv() {
  try {
    const text = readFileSync(new URL("../.env", import.meta.url), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, raw] = match;
      if (process.env[key] !== undefined) continue;
      process.env[key] = raw.replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env is optional; use the process environment.
  }
}

loadEnv();

const prisma = new PrismaClient();
const DAY = 86_400_000;
const pepper = process.env.TOKEN_PEPPER || "dev-only-insecure-token-pepper";
const baseUrl = (process.env.APP_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");

function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, 64, { N: 16_384, r: 8, p: 1 });
  return ["scrypt", 16_384, 8, 1, salt.toString("base64url"), key.toString("base64url")].join("$");
}

function hashToken(token) {
  return createHash("sha256").update(pepper + token).digest("hex");
}

function cycleLabel(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function subCalendarMonths(date, months) {
  const targetYear = date.getFullYear();
  const targetMonth = date.getMonth() - months;
  const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const day = Math.min(date.getDate(), lastDayOfMonth);
  return new Date(targetYear, targetMonth, day, date.getHours(), date.getMinutes(), date.getSeconds());
}

async function main() {
  const seedUnits = JSON.parse(readFileSync(new URL("../src/data/seed-units.json", import.meta.url), "utf8"));
  const now = new Date();

  const subDistrict = await prisma.subDistrict.upsert({
    where: { id: "sd-gunungpati" },
    update: { name: "Kecamatan Gunungpati (sintetis)" },
    create: { id: "sd-gunungpati", name: "Kecamatan Gunungpati (sintetis)" },
  });

  await prisma.rankingSetting.upsert({
    where: { subDistrictId: subDistrict.id },
    update: {},
    create: { subDistrictId: subDistrict.id, wSilent: 2, wUnconfirmed: 3, wPaused: 2, cutoffDays: 7 },
  });

  const accounts = [
    {
      id: "usr-admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@demo.local",
      password: process.env.SEED_ADMIN_PASSWORD || "demo-admin-2026",
      role: "ADMIN",
      subDistrictId: null,
    },
    {
      id: "usr-korcam",
      email: process.env.SEED_COORDINATOR_EMAIL || "korcam@demo.local",
      password: process.env.SEED_COORDINATOR_PASSWORD || "demo-korcam-2026",
      role: "COORDINATOR",
      subDistrictId: subDistrict.id,
    },
    {
      id: "usr-advisor",
      email: process.env.SEED_ADVISOR_EMAIL || "advisor@demo.local",
      password: process.env.SEED_ADVISOR_PASSWORD || "demo-advisor-2026",
      role: "ADVISOR",
      subDistrictId: subDistrict.id,
    },
  ];

  for (const account of accounts) {
    const email = account.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    await prisma.user.upsert({
      where: { email },
      update: { role: account.role, subDistrictId: account.subDistrictId },
      create: {
        id: account.id,
        email,
        passwordHash: hashPassword(existing ? "" : account.password),
        role: account.role,
        subDistrictId: account.subDistrictId,
      },
    });
    if (existing) {
      await prisma.user.update({ where: { email }, data: { passwordHash: hashPassword(account.password) } });
    }
  }

  const label = cycleLabel(now);
  const openedAt = new Date(now.getFullYear(), now.getMonth(), 1);
  const cutoffAt = new Date(openedAt.getTime() + 7 * DAY);
  const cycle = await prisma.reportingCycle.upsert({
    where: { periodLabel: label },
    update: {},
    create: { periodLabel: label, openedAt, cutoffAt },
  });

  // Seed 6 prior closed cycles so silentCycles parity matches proposal §6.1.
  const priorCycles = [];
  for (let back = 1; back <= 6; back += 1) {
    const pStart = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const pEnd = new Date(now.getFullYear(), now.getMonth() - back + 1, 1);
    const pLabel = cycleLabel(pStart);
    const pCutoff = new Date(pStart.getTime() + 7 * DAY);
    const c = await prisma.reportingCycle.upsert({
      where: { periodLabel: pLabel },
      update: { closedAt: pEnd },
      create: { periodLabel: pLabel, openedAt: pStart, cutoffAt: pCutoff, closedAt: pEnd },
    });
    priorCycles.push(c); // index 0 = 1 month ago, index 5 = 6 months ago
  }

  let tokensCreated = 0;
  let signalsCreated = 0;

  for (const seed of seedUnits) {
    const silentCycles = Number(seed.silentCycles ?? 0);
    const daysAgo = seed.lastSignalDaysAgo === null ? null : Number(seed.lastSignalDaysAgo);
    const months = seed.monthsSinceContact === null ? null : Number(seed.monthsSinceContact);
    const lastSignalAt = daysAgo === null ? null : new Date(now.getTime() - daysAgo * DAY);
    const lastVisitedAt = months === null ? null : subCalendarMonths(now, months);

    // Units with never-signaled history use createdAt to define how many closed
    // cycles elapsed since registration (e.g. Unit Contoh 01 = 3, Unit Contoh 10 = 4).
    const createdCycleIndex =
      daysAgo === null && silentCycles > 0 ? Math.min(silentCycles - 1, priorCycles.length - 1) : priorCycles.length - 1;
    const unitCreatedAt = priorCycles[createdCycleIndex].openedAt;

    await prisma.unit.upsert({
      where: { id: seed.id },
      update: {
        name: seed.name,
        kelurahan: seed.kelurahan,
        managerContact: seed.contact,
        currentStatus: seed.status,
        lastSignalAt,
        lastVisitedAt,
        createdAt: unitCreatedAt,
        isSynthetic: true,
        subDistrictId: subDistrict.id,
        archivedAt: null,
      },
      create: {
        id: seed.id,
        name: seed.name,
        kelurahan: seed.kelurahan,
        managerContact: seed.contact,
        currentStatus: seed.status,
        lastSignalAt,
        lastVisitedAt,
        createdAt: unitCreatedAt,
        isSynthetic: true,
        subDistrictId: subDistrict.id,
      },
    });

    const tokenHash = hashToken(seed.token);
    const existingToken = await prisma.unitToken.findUnique({ where: { tokenHash } });
    if (!existingToken) {
      await prisma.unitToken.create({ data: { unitId: seed.id, tokenHash } });
      tokensCreated += 1;
    }

    const signaledThisCycle =
      silentCycles === 0 && seed.status !== "UNCONFIRMED" && seed.status !== "CLOSED" && lastSignalAt !== null;

    if (signaledThisCycle) {
      const existingSignal = await prisma.checkinSignal.findFirst({
        where: { unitId: seed.id, cycleId: cycle.id, undoneAt: null },
      });
      if (!existingSignal) {
        await prisma.checkinSignal.create({
          data: {
            unitId: seed.id,
            cycleId: cycle.id,
            reportedStatus: seed.status,
            sourceRole: "MANAGER",
            submittedAt: lastSignalAt,
            previousStatus: "UNCONFIRMED",
            previousLastSignalAt: null,
          },
        });
        signalsCreated += 1;
      }
    } else if (silentCycles > 0 && lastSignalAt !== null) {
      const targetIdx = Math.min(silentCycles, priorCycles.length - 1);
      const targetCycle = priorCycles[targetIdx];
      const existingPast = await prisma.checkinSignal.findFirst({
        where: { unitId: seed.id, cycleId: targetCycle.id, undoneAt: null },
      });
      if (!existingPast) {
        await prisma.checkinSignal.create({
          data: {
            unitId: seed.id,
            cycleId: targetCycle.id,
            reportedStatus: seed.status === "CLOSED" ? "CLOSED" : "OPERATING",
            sourceRole: "MANAGER",
            submittedAt: lastSignalAt,
            previousStatus: "UNCONFIRMED",
            previousLastSignalAt: null,
          },
        });
      }
    }
  }

  const counts = {
    units: await prisma.unit.count(),
    tokens: await prisma.unitToken.count(),
    signals: await prisma.checkinSignal.count(),
    users: await prisma.user.count(),
  };

  console.log("\nSeed selesai (SEMUA DATA SINTETIS):");
  console.table(counts);
  console.log(`Token baru: ${tokensCreated} · sinyal siklus ini: ${signalsCreated} · siklus: ${label}`);
  console.log("\nAkun demo:");
  for (const account of accounts) {
    console.log(`  ${account.role.padEnd(11)} ${account.email} / ${account.password}`);
  }
  console.log(`\nContoh tautan check-in: ${baseUrl}/c/${seedUnits[0].token}\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
