import type { Unit } from "../types/weather";

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

// Converte e arredonda para uma casa decimal; valores permanecem em Celsius na origem.
export function convertTemperature(celsius: number, unit: Unit): number {
  const value = unit === "fahrenheit" ? celsiusToFahrenheit(celsius) : celsius;
  return Math.round(value * 10) / 10;
}

export function getUnitSymbol(unit: Unit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  if (celsius === null) return "Não disponível";
  const value = convertTemperature(celsius, unit);
  return `${value.toFixed(1).replace(".", ",")} ${getUnitSymbol(unit)}`;
}
