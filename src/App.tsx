import { useState } from "react";
import SearchBar from "./components/SearchBar";
import UnitToggle from "./components/UnitToggle";
import CurrentWeather from "./components/CurrentWeather";
import ForecastList from "./components/ForecastList";
import LoadingState from "./components/states/LoadingState";
import ErrorState from "./components/states/ErrorState";
import EmptyState from "./components/states/EmptyState";
import { useWeather } from "./hooks/useWeather";
import type { Unit } from "./types/weather";

function App() {
  const [unit, setUnit] = useState<Unit>("celsius");
  const { status, data, error, search, retry } = useWeather();

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌤️ Weather App</h1>
            <p className="text-sm text-white/50">Consulte o clima de qualquer cidade</p>
          </div>
          <UnitToggle unit={unit} onChange={setUnit} />
        </header>

        <SearchBar onSearch={search} disabled={status === "loading"} />

        <main className="flex flex-col gap-6">
          {status === "idle" && (
            <EmptyState
              title="Comece uma busca"
              hint="Digite o nome de uma cidade para ver o clima atual e a previsão de 5 dias."
            />
          )}
          {status === "loading" && <LoadingState message="Buscando clima..." />}
          {status === "empty" && (
            <EmptyState
              title="Nenhuma cidade encontrada"
              hint="Verifique o nome digitado e tente novamente."
            />
          )}
          {status === "error" && (
            <ErrorState
              message={error ?? "Não foi possível obter os dados do clima. Tente novamente."}
              onRetry={retry}
            />
          )}
          {status === "success" && data && (
            <>
              <CurrentWeather city={data.city} current={data.current} unit={unit} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

