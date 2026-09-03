"use client"

import { useEffect, useRef, useState, type ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { copy } from "@/lib/labels"
import { cn } from "@/lib/utils"

export function SaveButton({
  dirty,
  className,
  children,
  ...props
}: ComponentProps<typeof Button> & { dirty: boolean }) {
  const [flash, setFlash] = useState(false)
  const wasDirty = useRef(dirty)

  useEffect(() => {
    if (wasDirty.current && !dirty) {
      setFlash(true)
      const timer = window.setTimeout(() => setFlash(false), 900)
      wasDirty.current = dirty
      return () => window.clearTimeout(timer)
    }
    wasDirty.current = dirty
  }, [dirty])

  return (
    <Button
      {...props}
      variant={dirty ? "default" : "secondary"}
      data-dirty={dirty ? "true" : "false"}
      aria-live="polite"
      className={cn(
        "titan-save",
        dirty && "titan-save--dirty",
        flash && "titan-save--flash",
        className
      )}
    >
      {children}
      <span className="sr-only">
        {dirty ? copy.saveState.unsaved : copy.saveState.saved}
      </span>
    </Button>
  )
}
