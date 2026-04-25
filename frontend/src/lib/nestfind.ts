/** Curated Unsplash — modern residential; used when listing has no photos yet. */
export const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
  auth: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  card: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80',
} as const;

export function formatKes(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(n);
}

export function getHouseImageUrl(house: { images?: { imageUrl?: string }[] } | null | undefined): string {
  const url = house?.images?.[0]?.imageUrl;
  if (url) return url;
  return IMAGES.card;
}
