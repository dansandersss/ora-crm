const ORA_TIME_ZONE = "Europe/Chisinau";

export function formatDuration(value: number) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  return [hours, minutes, remainder].map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatMdl(value: number) {
  return `${new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 2 }).format(Number(value) || 0)} MDL`;
}

export function formatOraTime(value: string | Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: ORA_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function formatOraDate(value: string | Date) {
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: ORA_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatOraHeaderDate(value: Date) {
  const formatted = new Intl.DateTimeFormat("ro-RO", {
    timeZone: ORA_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);

  return formatted.charAt(0).toLocaleUpperCase("ro-RO") + formatted.slice(1);
}

export function getOraHour(value: Date) {
  return Number(
    new Intl.DateTimeFormat("ro-RO", {
      timeZone: ORA_TIME_ZONE,
      hour: "2-digit",
      hourCycle: "h23",
    }).format(value),
  );
}

export function getGreeting(value: Date) {
  const hour = getOraHour(value);
  if (hour < 12) return "Bună dimineața";
  if (hour < 18) return "Bună ziua";
  return "Bună seara";
}

export { ORA_TIME_ZONE };

