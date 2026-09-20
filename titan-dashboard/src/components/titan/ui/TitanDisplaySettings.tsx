import { useEffect, useId, useRef, useState } from "react";
import { TITAN_TYPE_SCALES, type TitanTypeScaleId } from "../../../lib/titanTypeScale";
import { useTitanI18n } from "../../../i18n";
import { useTitanTypeScale } from "../TitanTypeScaleProvider";

export function TitanDisplaySettings() {
  const { t } = useTitanI18n();
  const { scale, setScale } = useTitanTypeScale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="titan-display-settings" ref={rootRef}>
      <button
        type="button"
        className={`titan-display-settings__gear${open ? " titan-display-settings__gear--open" : ""}`}
        aria-label={t("settings.aria")}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 16 16" className="titan-display-settings__icon" aria-hidden>
          <path
            fill="currentColor"
            d="M6.4 1.4h3.2l.3 1.6c.4.1.8.3 1.1.6l1.5-.6 1.6 2.8-1.2 1.1c.1.4.1.8 0 1.2l1.2 1.1-1.6 2.8-1.5-.6c-.3.3-.7.5-1.1.6l-.3 1.6H6.4l-.3-1.6c-.4-.1-.8-.3-1.1-.6l-1.5.6L1.9 10l1.2-1.1c-.1-.4-.1-.8 0-1.2L1.9 6.6l1.6-2.8 1.5.6c.3-.3.7-.5 1.1-.6l.3-1.6ZM8 6.2A1.8 1.8 0 1 0 8 9.8 1.8 1.8 0 0 0 8 6.2Z"
          />
        </svg>
      </button>
      {open ? (
        <div className="titan-display-settings__menu" id={menuId} role="menu" aria-label={t("settings.title")}>
          <p className="titan-display-settings__title">{t("settings.title")}</p>
          {TITAN_TYPE_SCALES.map((id) => {
            const active = scale === id;
            return (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`titan-display-settings__option${active ? " titan-display-settings__option--active" : ""}`}
                onClick={() => {
                  setScale(id as TitanTypeScaleId);
                  setOpen(false);
                }}
              >
                {t(`settings.type.${id}`)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
