import { useCallback, useState } from "react";
import { TITAN_WORLD_MAP_CANDIDATES } from "../lib/brandAssets";

/** Cinematic institutional background — world map photo + gold atmosphere. */
export function TitanInstitutionalBackdrop() {
  const [mapIndex, setMapIndex] = useState(0);
  const mapSrc = TITAN_WORLD_MAP_CANDIDATES[mapIndex];
  const showSvgFallback =
    TITAN_WORLD_MAP_CANDIDATES.length === 0 || mapIndex >= TITAN_WORLD_MAP_CANDIDATES.length;

  const onMapError = useCallback(() => {
    setMapIndex((i) => i + 1);
  }, []);

  return (
    <div className="titan-institutional-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div
        className={`titan-institutional-backdrop__map ${showSvgFallback ? "" : "titan-institutional-backdrop__map--hidden"}`}
      />
      {!showSvgFallback && mapSrc ? (
        <img
          key={mapSrc}
          src={mapSrc}
          alt=""
          className="titan-institutional-backdrop__photo"
          decoding="async"
          onError={onMapError}
        />
      ) : null}
      <div className="titan-institutional-backdrop__mesh" />
      <div className="titan-institutional-backdrop__rays" />
      <div className="titan-institutional-backdrop__particles" />
      <div className="titan-institutional-backdrop__veil" />
    </div>
  );
}
