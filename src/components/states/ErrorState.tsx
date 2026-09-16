interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-glass backdrop-blur-md"
    >
      <span aria-hidden="true" className="text-4xl">
        ⚠️
      </span>
      <p className="text-white/70">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-accent-600 px-4 py-2 font-medium text-white transition-colors hover:bg-accent-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default ErrorState;
