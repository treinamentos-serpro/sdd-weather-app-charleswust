import { describe, expect, it } from "vitest";
import { formatDayLabel, formatShortDate } from "../../src/lib/format";

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

describe("format utilities", () => {
  it("labels the current day and the next day correctly", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);

    expect(formatDayLabel(toISO(today))).toBe("Hoje");
    expect(formatDayLabel(toISO(tomorrow))).toBe("Amanhã");
    expect(formatDayLabel(toISO(afterTomorrow))).toBe(
      afterTomorrow.toLocaleDateString("pt-BR", { weekday: "short" }).replace(/^./, (letter) => letter.toUpperCase()),
    );
  });

  it("formats dates using the short Brazilian pattern", () => {
    const someDate = new Date("2026-09-16T00:00:00");
    expect(formatShortDate("2026-09-16")).toBe("16/09");
    expect(formatShortDate("2026-02-05")).toBe("05/02");
    expect(formatShortDate("not-a-date")).toBe("Não disponível");
  });
});
