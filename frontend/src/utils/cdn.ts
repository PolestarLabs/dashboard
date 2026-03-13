const CDN_BASE = import.meta.env.VITE_CDN_BASE ?? 'https://cdn.pollux.gg';

export function cdn(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${CDN_BASE}${path}`;
}

