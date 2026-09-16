import { describe, expect, it } from "vitest";
import {
  getWeatherCondition,
  getWeatherIcon,
} from "../../src/lib/weatherCodes";

describe("weatherCodes", () => {
  it("returns the icon for known weather codes", () => {
    expect(getWeatherIcon(0)).toBe("☀️");
    expect(getWeatherIcon(2)).toBe("⛅");
    expect(getWeatherIcon(61)).toBe("🌧️");
    expect(getWeatherIcon(95)).toBe("⛈️");
  });

  it("returns a fallback icon for unknown or null weather codes", () => {
    expect(getWeatherIcon(999)).toBe("❓");
    expect(getWeatherIcon(null)).toBe("❓");
  });

  it("returns the Portuguese condition for known weather codes", () => {
    expect(getWeatherCondition(0)).toBe("Céu limpo");
    expect(getWeatherCondition(3)).toBe("Nublado");
    expect(getWeatherCondition(45)).toBe("Nevoeiro");
    expect(getWeatherCondition(95)).toBe("Trovoada");
  });

  it("returns null for unknown or null weather codes", () => {
    expect(getWeatherCondition(999)).toBeNull();
    expect(getWeatherCondition(null)).toBeNull();
  });
});
