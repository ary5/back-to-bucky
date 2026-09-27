import { readFileSync } from 'node:fs';

export const items = JSON.parse(readFileSync(new URL('../data/items.json', import.meta.url), 'utf8'));
export function publicItem(item) {
  return { id: item.id, description: item.description, location: item.location, foundDate: item.foundDate };
}
export function searchItems(query) {
  const words = String(query).toLowerCase().match(/[a-z0-9]+/g) || [];
  const ignored = new Set(['i','my','the','a','an','lost','in','at','on','and','of','some','please','find','me']);
  const terms = words.filter(word => !ignored.has(word));
  return items.map(item => {
    const haystack = `${item.description} ${item.category} ${item.location}`.toLowerCase();
    return { item, score: terms.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0) };
  }).filter(entry => entry.score > 0).sort((a,b) => b.score-a.score).slice(0,3).map(entry => publicItem(entry.item));
}
