/** Public assets in `titan-dashboard/public/brand/` */
const base = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const TITAN_LOGO_SRC = `${base}brand/titan-logo.png`;

/** Try .jpg first (filename on disk), then .png if load fails */
export const TITAN_WORLD_MAP_CANDIDATES = [
  `${base}brand/world-map.jpg`,
  `${base}brand/world-map.png`,
] as const;
