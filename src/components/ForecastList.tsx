import ForecastCard from "./ForecastCard";
import type { ForecastDay, Unit } from "../types/weather";

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-label="Previsão de cinco dias">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard key={day.date} day={day} unit={unit} />
        ))}
      </ul>
    </section>
  );
}

export default ForecastList;
