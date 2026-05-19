/** Cinematic institutional background — world map, particles, gold light. */
export function TitanInstitutionalBackdrop() {
  return (
    <div className="titan-institutional-backdrop pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="titan-institutional-backdrop__map" />
      <div className="titan-institutional-backdrop__mesh" />
      <div className="titan-institutional-backdrop__rays" />
      <div className="titan-institutional-backdrop__particles" />
      <div className="titan-institutional-backdrop__veil" />
    </div>
  );
}
