import type { Unit } from "../types/weather";

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
    >
      <button
        type="button"
        aria-pressed={unit === "celsius"}
        onClick={() => onChange("celsius")}
        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
          unit === "celsius"
            ? "bg-accent-600 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        °C
      </button>
      <button
        type="button"
        aria-pressed={unit === "fahrenheit"}
        onClick={() => onChange("fahrenheit")}
        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 ${
          unit === "fahrenheit"
            ? "bg-accent-600 text-white"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        °F
      </button>
    </div>
  );
}

export default UnitToggle;
