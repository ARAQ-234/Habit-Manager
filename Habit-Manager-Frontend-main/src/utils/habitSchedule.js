export const formatLocalDate = (date, timeZone) => {
  if (!timeZone) return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const isHabitDueOnDate = (habit, date, timeZone) => {
  const key = formatLocalDate(date, timeZone);
  if (habit.archived || (habit.endDate && key > habit.endDate)) return false;
  if (habit.frequency === 'DAILY') return true;
  const values = (habit.scheduledValues || '').split(',').map((value) => value.trim().toUpperCase());
  if (habit.frequency === 'WEEKLY') {
    return values.includes(date.toLocaleString('en-US', { weekday: 'short', ...(timeZone ? { timeZone } : {}) }).toUpperCase());
  }
  if (habit.frequency === 'MONTHLY') return values.includes(String(date.getDate()));
  return false;
};
