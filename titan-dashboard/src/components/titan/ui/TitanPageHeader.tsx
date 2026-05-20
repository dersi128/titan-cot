import type { ReactNode } from "react";

type TitanPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: ReactNode;
};

export function TitanPageHeader({ eyebrow, title, description, aside }: TitanPageHeaderProps) {
  return (
    <header className="titan-page-header mb-4 flex flex-col gap-3 border-b border-white/[0.06] pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-titan-gold/85">{eyebrow}</p>
        <h2 className="mt-1.5 font-display text-xl font-bold uppercase tracking-[0.08em] text-stone-50 md:text-2xl">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-stone-500">{description}</p> : null}
      </div>
      {aside ? <aside className="shrink-0">{aside}</aside> : null}
    </header>
  );
}
