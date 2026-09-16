import { describe, expect, it } from "vitest";
import {
  celsiusToFahrenheit,
  convertTemperature,
  formatTemperature,
  getUnitSymbol,
} from "../../src/lib/temperature";

describe("temperature utilities", () => {
  it("converts 0°C to 32°F", () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
  });

  it("converts 100°C to 212°F", () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it("converts -40°C to -40°F", () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it("converts temperatures according to the target unit", () => {
    expect(convertTemperature(0, "celsius")).toBe(0);
    expect(convertTemperature(0, "fahrenheit")).toBe(32);
    expect(convertTemperature(20, "celsius")).toBe(20);
    expect(convertTemperature(20, "fahrenheit")).toBe(68);
    expect(convertTemperature(100, "fahrenheit")).toBe(212);
    expect(convertTemperature(25.5, "fahrenheit")).toBe(77.9);
  });

  it("formats temperatures with rounding and the correct symbol", () => {
    expect(formatTemperature(0, "celsius")).toBe("0,0 °C");
    expect(formatTemperature(0, "fahrenheit")).toBe("32,0 °F");
    expect(formatTemperature(21.24, "celsius")).toBe("21,2 °C");
    expect(formatTemperature(21.25, "celsius")).toBe("21,3 °C");
    expect(formatTemperature(21.25, "fahrenheit")).toBe("70,3 °F");
    expect(formatTemperature(null, "celsius")).toBe("Não disponível");
  });

  it("returns the unit label for each unit", () => {
    expect(getUnitSymbol("celsius")).toBe("°C");
    expect(getUnitSymbol("fahrenheit")).toBe("°F");
  });
});
