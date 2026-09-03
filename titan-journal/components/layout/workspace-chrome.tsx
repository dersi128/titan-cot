"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { useWorkspace } from "@/components/layout/workspace-provider"
import { loadChrome, saveChrome } from "@/lib/chrome-storage"
import {
  DATE_RANGES,
  defaultCustomRange,
  type CustomRange,
  type DateRange,
} from "@/lib/date-range"
import type { Account } from "@/types/trade"

export { DATE_RANGES, type DateRange }

type WorkspaceChrome = {
  account: Account
  setAccount: (account: Account) => void
  range: DateRange
  setRange: (range: DateRange) => void
  custom: CustomRange | null
  setCustom: (custom: CustomRange) => void
}

const WorkspaceChromeContext = createContext<WorkspaceChrome | null>(null)

export function WorkspaceChromeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { preferences } = useWorkspace()
  const [account, setAccount] = useState<Account>("Personal")
  const [range, setRangeState] = useState<DateRange>("ALL")
  const [custom, setCustom] = useState<CustomRange | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = loadChrome()
    if (stored) {
      setAccount(stored.account)
      setRangeState(stored.range)
      setCustom(stored.custom)
    } else {
      setAccount(preferences.defaultAccount)
    }
    setReady(true)
    // Header starts from stored chrome, else the saved default account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready) return
    saveChrome({ account, range, custom })
  }, [ready, account, range, custom])

  const setRange = useCallback((next: DateRange) => {
    setRangeState(next)
    setCustom((current) => {
      if (next === "CUSTOM" && !current) return defaultCustomRange()
      return current
    })
  }, [])

  const value = useMemo(
    () => ({ account, setAccount, range, setRange, custom, setCustom }),
    [account, range, custom, setRange]
  )

  return (
    <WorkspaceChromeContext.Provider value={value}>
      {children}
    </WorkspaceChromeContext.Provider>
  )
}

export function useWorkspaceChrome() {
  const context = useContext(WorkspaceChromeContext)
  if (!context) {
    throw new Error("useWorkspaceChrome must be used within WorkspaceChromeProvider")
  }
  return context
}
