export function parseSourceDate(text: string): string | null {
  const normalized = text.normalize('NFKC');
  const match = normalized.match(
    /(?:更新(?:日)?\s*[:：]?\s*)?(\d{4})[年/]\s*(\d{1,2})[月/]\s*(\d{1,2})日?/,
  );
  if (!match) return null;
  const [, year, month, day] = match;
  const value = `${year}-${month!.padStart(2, '0')}-${day!.padStart(2, '0')}`;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value)
    ? value
    : null;
}

export function parseUpdatedDate(text: string): string | null {
  const normalized = text.normalize('NFKC').replace(/\s+/g, ' ');
  const match = normalized.match(
    /(?:更新(?:日)?\s*[:：]?\s*\d{4}[年/]\s*\d{1,2}[月/]\s*\d{1,2}日?|\d{4}[年/]\s*\d{1,2}[月/]\s*\d{1,2}日?\s*(?:現在|更新))/,
  );
  return match ? parseSourceDate(match[0]) : null;
}
