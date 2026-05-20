import { useEffect, useId, useRef, useState } from "react";

export type TitanFilterOption = {
  value: string;
  label: string;
};

type TitanFilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: TitanFilterOption[];
  "aria-label": string;
};

export function TitanFilterSelect({ value, onChange, options, "aria-label": ariaLabel }: TitanFilterSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="titan-filter-select-btn flex min-w-[9.5rem] items-center justify-between gap-2 border border-white/[0.14] bg-[#141418] px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-stone-100"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{selected}</span>
        <span className="shrink-0 text-[10px] text-stone-400" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="titan-filter-select-menu absolute left-0 top-[calc(100%+4px)] z-50 max-h-56 min-w-full overflow-y-auto border border-white/[0.14] bg-[#121216] py-1 shadow-xl"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`w-full px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-titan-gold/15 text-titan-goldBright"
                      : "text-stone-200 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
