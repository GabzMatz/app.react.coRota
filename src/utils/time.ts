export const addMinutesToTime = (hhmm: string, minutesToAdd: number): string => {
  if (!hhmm) return '';
  const [hh, mm] = hhmm.split(':').map(Number);
  const date = new Date(0, 0, 1, Number.isFinite(hh) ? hh : 0, Number.isFinite(mm) ? mm : 0, 0, 0);
  const safeMinutes = Number.isFinite(minutesToAdd) ? minutesToAdd : 0;
  date.setMinutes(date.getMinutes() + safeMinutes);
  const eh = String(date.getHours()).padStart(2, '0');
  const em = String(date.getMinutes()).padStart(2, '0');
  return `${eh}:${em}`;
};

export const getRouteDurationMinutes = (): number => {
  try {
    const raw = localStorage.getItem('routeDurationMinutes');
    if (!raw) return 0;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch (_) {
    return 0;
  }
};

export const computeEndTimeFromLeaflet = (startTime: string): string => {
  const duration = getRouteDurationMinutes();
  return addMinutesToTime(startTime, duration);
};


