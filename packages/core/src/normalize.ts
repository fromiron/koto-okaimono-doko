export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizePostalCode(value: string): string | null {
  const match = value.match(/〒?\s*(\d{3})-?(\d{4})/);
  return match ? `${match[1]}-${match[2]}` : null;
}

export function stripPostalCode(value: string): string {
  return value.replace(/〒?\s*\d{3}-?\d{4}\s*/g, '').trim();
}
