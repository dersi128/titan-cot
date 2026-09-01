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
    <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] text-muted-foreground">
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
    width === "narrow" ? "max-w-4xl" : width === "wide" ? "max-w-none" : "max-w-none"

  return <div className={`w-full ${maxWidth}`}>{children}</div>
}
