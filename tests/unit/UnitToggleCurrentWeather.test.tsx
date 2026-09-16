import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CurrentWeather from "../../src/components/CurrentWeather";
import UnitToggle from "../../src/components/UnitToggle";
import type { City, CurrentWeather as CurrentWeatherData, Unit } from "../../src/types/weather";

const city: City = {
  id: 1,
  name: "Blumenau",
  countryCode: "BR",
  region: "Santa Catarina",
  latitude: -26.9194,
  longitude: -49.0661,
};

const current: CurrentWeatherData = {
  temperatureCelsius: 0,
  weatherCode: 0,
  condition: "Céu limpo",
  time: "2026-09-16T12:00:00",
  relativeHumidity: 50,
  windSpeedKmh: 10,
  precipitationMm: 0,
  pressureHpa: 1012,
};

describe("unit toggle and current weather", () => {
  it("shows the selected city with its Brazilian state abbreviation", () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole("heading", { name: "Blumenau/SC" })).toBeInTheDocument();
  });

  it("shows 32° when the user switches from Celsius to Fahrenheit", () => {
    let unit: Unit = "celsius";

    const { rerender } = render(
      <>
        <UnitToggle unit={unit} onChange={(nextUnit) => {
          unit = nextUnit;
          rerender(
            <>
              <UnitToggle unit={unit} onChange={(nextUnit) => {
                unit = nextUnit;
                rerender(
                  <CurrentWeather city={city} current={current} unit={unit} />
                );
              }} />
              <CurrentWeather city={city} current={current} unit={unit} />
            </>,
          );
        }} />
        <CurrentWeather city={city} current={current} unit={unit} />
      </>,
    );

    expect(screen.getByText("0,0 °C")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "°F" }));

    expect(screen.getByText("32,0 °F")).toBeInTheDocument();
  });
});
