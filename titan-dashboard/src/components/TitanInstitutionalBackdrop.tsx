import { useState } from "react";

/** Drop your asset at: titan-dashboard/public/brand/world-map.jpg */
export const TITAN_WORLD_MAP_SRC = "/brand/world-map.jpg";

/** Cinematic institutional background — world map photo + gold atmosphere. */
export function TitanInstitutionalBackdrop() {
  const [hasPhoto, setHasPhoto] = useState(true);

  return (
    <div className="titan-institutional-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div
        className={`titan-institutional-backdrop__map ${hasPhoto ? "titan-institutional-backdrop__map--hidden" : ""}`}
      />
      {hasPhoto ? (
        <img
          src={TITAN_WORLD_MAP_SRC}
          alt=""
          className="titan-institutional-backdrop__photo"
          decoding="async"
          onError={() => setHasPhoto(false)}
        />
      ) : null}
      <div className="titan-institutional-backdrop__mesh" />
      <div className="titan-institutional-backdrop__rays" />
      <div className="titan-institutional-backdrop__particles" />
      <div className="titan-institutional-backdrop__veil" />
    </div>
  );
}
