import { cn } from "@/lib/utils"

export function AvatarBubble({
  name,
  src,
  size = "md",
}: {
  name: string
  src: string | null
  size?: "sm" | "md"
}) {
  const dim = size === "sm" ? "h-10 w-10 text-[12px]" : "h-16 w-16 text-lg"
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={cn(
          "shrink-0 rounded-full border border-border bg-muted object-cover",
          dim
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-semibold",
        dim
      )}
    >
      {name.slice(0, 1).toUpperCase() || "T"}
    </div>
  )
}
