import type { KeyboardEvent } from "react"

export function tradeRowProps(id: string, push: (href: string) => void) {
  return {
    className: "cursor-pointer",
    tabIndex: 0,
    onClick: () => push(`/journal/${id}`),
    onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        push(`/journal/${id}`)
      }
    },
  }
}
