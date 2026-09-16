import { useId, useState } from "react";
import type { FormEvent } from "react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState("");
  const inputId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  };

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full">
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-white/70">
        Nome da cidade
      </label>
      <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-glass backdrop-blur-md">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          placeholder="Buscar cidade..."
          className="w-full rounded-xl bg-transparent px-3 py-2 text-white placeholder-white/40 outline-none focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          className="shrink-0 rounded-xl bg-accent-500 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-600 focus-visible:ring-2 focus-visible:ring-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
