// Rotula o dia da previsão em relação a hoje (ex.: "Hoje", "Amanhã", "Qua.").
export function formatDayLabel(date: string): string {
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "Não disponível";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";

  const weekday = target.toLocaleDateString("pt-BR", { weekday: "short" });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function formatShortDate(date: string): string {
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return "Não disponível";
  return target.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
