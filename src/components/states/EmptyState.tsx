interface EmptyStateProps {
  title: string;
  hint: string;
}

function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-glass backdrop-blur-md">
      <span aria-hidden="true" className="text-4xl">
        🔍
      </span>
      <p className="font-medium text-white">{title}</p>
      <p className="text-sm text-white/60">{hint}</p>
    </div>
  );
}

export default EmptyState;
