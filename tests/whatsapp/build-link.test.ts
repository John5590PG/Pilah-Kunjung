import { describe, expect, it } from "vitest";
import { buildCheckinUrl, buildReminderMessage, buildWaLink, periodLabelId } from "@/lib/whatsapp/build-link";

describe("whatsapp links", () => {
  it("formats period labels in Indonesian", () => {
    expect(periodLabelId("2026-11")).toBe("November 2026");
    expect(periodLabelId("2027-01")).toBe("Januari 2027");
  });
  it("builds wa.me link with digits only and encoded text", () => {
    const link = buildWaLink("+62 812-3456-789", "Halo & terima kasih");
    expect(link).toBe("https://wa.me/628123456789?text=Halo%20%26%20terima%20kasih");
  });
  it("builds check-in url without double slashes", () => {
    expect(buildCheckinUrl("https://x.app/", "tok")).toBe("https://x.app/c/tok");
  });
  it("message contains the unit name and link", () => {
    const m = buildReminderMessage({ unitName: "Unit Contoh 01", period: "2026-11", url: "https://x/c/t" });
    expect(m).toContain("Unit Contoh 01");
    expect(m).toContain("https://x/c/t");
    expect(m).toContain("November 2026");
  });
});
