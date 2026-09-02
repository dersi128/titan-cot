export function PageHeader({
  title,
  description,
  actions,
  compact = false,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  compact?: boolean
}) {
  return (
    <header
      className={
        compact
          ? "flex shrink-0 items-end justify-between gap-3"
          : "mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
      }
    >
      <div className="min-w-0">
        <h1
          className={
            compact
              ? "text-[18px] font-semibold tracking-tight text-foreground"
              : "text-[length:var(--ui-title)] font-semibold tracking-tight text-foreground"
          }
        >
          {title}
        </h1>
        {description ? (
          <p
            className={
              compact
                ? "mt-0.5 truncate text-[12px] text-muted-foreground"
                : "mt-1 max-w-2xl text-[13px] text-muted-foreground"
            }
          >
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
  fill = false,
}: {
  children: React.ReactNode
  width?: "default" | "narrow" | "wide"
  fill?: boolean
}) {
  const maxWidth =
    width === "narrow" ? "max-w-4xl" : width === "wide" ? "max-w-none" : "max-w-none"

  return (
    <div className={`w-full ${maxWidth}${fill ? " flex min-h-0 flex-1 flex-col" : ""}`}>
      {children}
    </div>
  )
}
