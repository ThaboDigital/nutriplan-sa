export function formatZAR(amount: number, includeDecimals = false): string {
  if (includeDecimals) {
    return `R ${amount.toFixed(2)}`;
  }
  return `R ${Math.round(amount)}`;
}

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal)} kcal`;
}

export function formatProtein(grams: number): string {
  return `${Math.round(grams)}g protein`;
}

export function formatWater(ml: number): string {
  if (ml >= 1000) {
    const liters = (ml / 1000).toFixed(1);
    return `${liters.endsWith('.0') ? (ml / 1000).toFixed(0) : liters} L`;
  }
  return `${ml} ml`;
}

export function formatTime(timeStr: string): string {
  return timeStr;
}

export function formatDateSA(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}
