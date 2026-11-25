export type UnitStatus = "OPERATING" | "PAUSED" | "CLOSED" | "UNCONFIRMED";
export type ReportedStatus = Exclude<UnitStatus, "UNCONFIRMED">;
export type ContactMode = "CALL" | "VISIT";

export const STATUS_ORDER: UnitStatus[] = ["UNCONFIRMED", "PAUSED", "OPERATING", "CLOSED"];

/** English labels for the coordinator dashboard (judges), Indonesian for managers. */
export const STATUS_EN: Record<UnitStatus, string> = {
  OPERATING: "Operating",
  PAUSED: "Paused",
  CLOSED: "Closed",
  UNCONFIRMED: "Unconfirmed",
};

export const STATUS_ID: Record<UnitStatus, string> = {
  OPERATING: "Beroperasi",
  PAUSED: "Dijeda",
  CLOSED: "Tutup",
  UNCONFIRMED: "Belum terkonfirmasi",
};

/** Operational definitions (proposal §3.2). */
export const STATUS_DEFINITION: Record<UnitStatus, string> = {
  OPERATING: "Weighing, collection or customer service at least once this cycle.",
  PAUSED: "Temporarily stopped but plans to resume.",
  CLOSED: "Permanently stopped; archived from the active visit list.",
  UNCONFIRMED: "No signal before the cutoff; operational state unknown.",
};
