import { formatTemperature } from "../lib/temperature";
import { getWeatherIcon } from "../lib/weatherCodes";
import type { City, CurrentWeather as CurrentWeatherData, Unit } from "../types/weather";

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const NOT_AVAILABLE = "Não disponível";

const BRAZILIAN_STATE_UFS: Record<string, string> = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

function formatCityName(city: City): string {
  if (city.countryCode?.toUpperCase() !== "BR" || !city.region) {
    return city.name;
  }

  const uf = BRAZILIAN_STATE_UFS[city.region] ?? city.region.toUpperCase();
  return `${city.name}/${uf}`;
}

function formatTime(time: string | null): string {
  if (!time) return NOT_AVAILABLE;
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return NOT_AVAILABLE;
  return date.toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatMetric(value: number | null | undefined, suffix: string): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return NOT_AVAILABLE;
  }
  return `${value.toLocaleString("pt-BR")} ${suffix}`;
}

function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const displayCityName = formatCityName(city);
  const metrics = [
    { label: "Umidade", value: formatMetric(current.relativeHumidity, "%") },
    { label: "Vento", value: formatMetric(current.windSpeedKmh, "km/h") },
    { label: "Precipitação", value: formatMetric(current.precipitationMm, "mm") },
    { label: "Pressão", value: formatMetric(current.pressureHpa, "hPa") },
  ];

  return (
    <section
      aria-label={`Clima atual em ${displayCityName}`}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md"
    >
      <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h2 className="text-lg font-medium text-white/70">{displayCityName}</h2>
          <p className="text-sm text-white/50">{formatTime(current.time)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="text-5xl">
            {getWeatherIcon(current.weatherCode)}
          </span>
          <div>
            <p className="text-6xl font-bold text-sun sm:text-7xl">
              {formatTemperature(current.temperatureCelsius, unit)}
            </p>
            <p className="text-white/70">{current.condition ?? NOT_AVAILABLE}</p>
          </div>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl bg-white/5 p-3 text-center">
            <dt className="text-xs uppercase tracking-wide text-white/50">{metric.label}</dt>
            <dd className="mt-1 text-lg font-medium text-white">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default CurrentWeather;
