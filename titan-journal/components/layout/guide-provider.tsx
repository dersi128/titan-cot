"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { AppGuide } from "@/components/layout/app-guide"
import { loadGuideSeen, saveGuideSeen } from "@/lib/guide-storage"

type GuideContextValue = {
  openGuide: () => void
}

const GuideContext = createContext<GuideContextValue | null>(null)

export function GuideProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setOpen(!loadGuideSeen())
    setReady(true)
  }, [])

  const dismiss = useCallback(() => {
    saveGuideSeen()
    setOpen(false)
  }, [])

  const openGuide = useCallback(() => {
    setOpen(true)
  }, [])

  const value = useMemo(() => ({ openGuide }), [openGuide])

  return (
    <GuideContext.Provider value={value}>
      {children}
      {ready ? <AppGuide open={open} onDismiss={dismiss} /> : null}
    </GuideContext.Provider>
  )
}

export function useGuide() {
  const context = useContext(GuideContext)
  if (!context) {
    throw new Error("useGuide must be used within GuideProvider")
  }
  return context
}
