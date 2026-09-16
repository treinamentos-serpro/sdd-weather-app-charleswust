import { formatDayLabel, formatShortDate } from "../lib/format";
import { formatTemperature } from "../lib/temperature";
import { getWeatherIcon } from "../lib/weatherCodes";
import type { ForecastDay, Unit } from "../types/weather";

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

const NOT_AVAILABLE = "Não disponível";

function ForecastCard({ day, unit }: ForecastCardProps) {
  const precipitation =
    day.precipitationProbabilityPercent === null ||
    day.precipitationProbabilityPercent === undefined ||
    !Number.isFinite(day.precipitationProbabilityPercent)
      ? NOT_AVAILABLE
      : `${day.precipitationProbabilityPercent}%`;

  return (
    <li className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-glass backdrop-blur-md">
      <p className="font-medium text-white">{formatDayLabel(day.date)}</p>
      <p className="text-xs text-white/50">{formatShortDate(day.date)}</p>
      <span aria-hidden="true" className="text-4xl">
        {getWeatherIcon(day.weatherCode)}
      </span>
      <p className="text-sm text-white/70">{day.condition ?? NOT_AVAILABLE}</p>
      <p className="text-sm font-medium text-white">
        {formatTemperature(day.temperatureMaxCelsius, unit)} /{" "}
        <span className="text-white/60">{formatTemperature(day.temperatureMinCelsius, unit)}</span>
      </p>
      <p className="text-xs text-accent-400">💧 {precipitation}</p>
    </li>
  );
}

export default ForecastCard;
