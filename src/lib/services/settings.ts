/** Ranking settings per sub-district with the documented defaults (docs/06). */
import { prisma } from "@/lib/db/client";
import { HttpError } from "@/lib/api/http";
import { DEFAULT_CONFIG, type RankingConfig } from "@/lib/ranking";

export async function getRankingConfig(subDistrictId?: string | null): Promise<RankingConfig> {
  const row = subDistrictId
    ? await prisma.rankingSetting.findUnique({ where: { subDistrictId } })
    : await prisma.rankingSetting.findFirst();

  if (!row) return { ...DEFAULT_CONFIG };
  return {
    wSilent: row.wSilent,
    wUnconfirmed: row.wUnconfirmed,
    wPaused: row.wPaused,
    cutoffDays: row.cutoffDays,
  };
}

export interface RankingSettingView extends RankingConfig {
  subDistrictId: string;
  subDistrictName: string;
  useDefaults: boolean;
}

/** One row per sub-district, filled with the heuristic defaults when absent. */
export async function listRankingSettings(): Promise<RankingSettingView[]> {
  const [districts, rows] = await Promise.all([
    prisma.subDistrict.findMany({ orderBy: { name: "asc" } }),
    prisma.rankingSetting.findMany(),
  ]);
  const byDistrict = new Map(rows.map((row) => [row.subDistrictId, row]));

  return districts.map((district) => {
    const row = byDistrict.get(district.id);
    return {
      subDistrictId: district.id,
      subDistrictName: district.name,
      wSilent: row?.wSilent ?? DEFAULT_CONFIG.wSilent,
      wUnconfirmed: row?.wUnconfirmed ?? DEFAULT_CONFIG.wUnconfirmed,
      wPaused: row?.wPaused ?? DEFAULT_CONFIG.wPaused,
      cutoffDays: row?.cutoffDays ?? DEFAULT_CONFIG.cutoffDays,
      useDefaults: !row,
    };
  });
}

export type RankingSettingInput = RankingConfig & { subDistrictId: string };

/** Admin write with an audit trail. Values are synthetic policy knobs. */
export async function updateRankingSetting(input: RankingSettingInput, actorId: string): Promise<RankingSettingView> {
  const district = await prisma.subDistrict.findUnique({ where: { id: input.subDistrictId } });
  if (!district) throw new HttpError(404, "Kecamatan tidak ditemukan.", "DISTRICT_NOT_FOUND");

  await prisma.$transaction([
    prisma.rankingSetting.upsert({
      where: { subDistrictId: input.subDistrictId },
      update: {
        wSilent: input.wSilent,
        wUnconfirmed: input.wUnconfirmed,
        wPaused: input.wPaused,
        cutoffDays: input.cutoffDays,
      },
      create: {
        subDistrictId: input.subDistrictId,
        wSilent: input.wSilent,
        wUnconfirmed: input.wUnconfirmed,
        wPaused: input.wPaused,
        cutoffDays: input.cutoffDays,
      },
    }),
    prisma.auditLog.create({
      data: { userId: actorId, action: "settings.update", target: input.subDistrictId },
    }),
  ]);

  return {
    subDistrictId: district.id,
    subDistrictName: district.name,
    wSilent: input.wSilent,
    wUnconfirmed: input.wUnconfirmed,
    wPaused: input.wPaused,
    cutoffDays: input.cutoffDays,
    useDefaults: false,
  };
}
