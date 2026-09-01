"use client"

import { createContext, useContext, useMemo, useState } from "react"

import { ACCOUNTS, type Account } from "@/types/trade"

export const DATE_RANGES = ["7D", "30D", "3M", "YTD", "ALL"] as const
export type DateRange = (typeof DATE_RANGES)[number]

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
  const [account, setAccount] = useState<Account>("Personal")
  const [range, setRange] = useState<DateRange>("ALL")
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
