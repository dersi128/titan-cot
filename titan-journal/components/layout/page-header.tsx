export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="mb-5 flex flex-col gap-3 border-b border-white/[0.06] pb-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="titan-kicker">TITAN Journal</p>
        <h2 className="titan-title mt-1.5 text-xl text-stone-50 md:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-stone-500">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <aside className="shrink-0">{actions}</aside> : null}
    </header>
  )
}

export function PageFrame({
  children,
  width = "default",
}: {
  children: React.ReactNode
  width?: "default" | "narrow" | "wide"
}) {
  const maxWidth =
    width === "narrow"
      ? "max-w-3xl"
      : width === "wide"
        ? "max-w-7xl"
        : "max-w-6xl"

  return (
    <div className={`mx-auto w-full ${maxWidth}`}>{children}</div>
  )
}
