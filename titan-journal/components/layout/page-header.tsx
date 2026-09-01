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
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-medium tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
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
    <div className={`mx-auto w-full ${maxWidth} px-4 py-6 lg:px-8`}>
      {children}
    </div>
  )
}
