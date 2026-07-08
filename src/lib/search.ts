export function normalizeForSearch(value: string): string {
  return value.replace(/\s+/g, "");
}
