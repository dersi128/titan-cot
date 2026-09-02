"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { useWorkspace } from "@/components/layout/workspace-provider"
import { DATE_RANGES, type DateRange } from "@/lib/date-range"
import type { Account } from "@/types/trade"

export { DATE_RANGES, type DateRange }

type WorkspaceChrome = {
  account: Account
  setAccount: (account: Account) => void
  range: DateRange
  setRange: (range: DateRange) => void
}

const WorkspaceChromeContext = createContext<WorkspaceChrome | null>(null)

export function WorkspaceChromeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { preferences } = useWorkspace()
  const [account, setAccount] = useState<Account>("Personal")
  const [range, setRange] = useState<DateRange>("ALL")

  useEffect(() => {
    setAccount(preferences.defaultAccount)
    // Header starts from the saved default. After that the trader drives it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(
    () => ({ account, setAccount, range, setRange }),
    [account, range]
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
