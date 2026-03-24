export const morningQuotes = [
  "Win the morning and the day follows.",
  "Small starts beat perfect plans.",
  "Consistency compounds faster than intensity.",
  "Begin with one clear move.",
];

export const afternoonQuotes = [
  "Protect your peak hours for meaningful work.",
  "Progress is often invisible until it compounds.",
  "One focused session can reset your whole day.",
  "Finish the hard thing first.",
];

export const eveningQuotes = [
  "Review, reset, and leave yourself a better tomorrow.",
  "Done is momentum for tomorrow.",
  "Close loops before you close the day.",
  "A calm shutdown is a productivity skill.",
];

export function getTimeOfDayQuotes(date = new Date()): string[] {
  const hour = date.getHours();

  if (hour < 12) {
    return morningQuotes;
  }

  if (hour < 18) {
    return afternoonQuotes;
  }

  return eveningQuotes;
}
