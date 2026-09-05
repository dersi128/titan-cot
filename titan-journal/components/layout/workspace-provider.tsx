"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react"

import { createDemoPlaybook } from "@/lib/playbooks"
import {
  applyDocumentAppearance,
  DEFAULT_PREFERENCES,
  DEFAULT_PROFILE,
  playbookStore,
  preferencesStore,
  profileStore,
} from "@/lib/workspace-storage"
import type { Playbook, UserPreferences, UserProfile } from "@/types/playbook"

const SERVER_PLAYBOOKS = [createDemoPlaybook()]

type WorkspaceValue = {
  profile: UserProfile
  preferences: UserPreferences
  playbooks: Playbook[]
  isReady: boolean
  updateProfile: (profile: UserProfile) => void
  updatePreferences: (patch: Partial<UserPreferences>) => void
  savePlaybook: (playbook: Playbook) => Playbook
  getPlaybook: (id: string) => Playbook | undefined
  replaceWorkspace: (next: {
    profile: UserProfile
    preferences: UserPreferences
    playbooks: Playbook[]
  }) => void
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null)

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const profile = useSyncExternalStore(
    profileStore.subscribe,
    profileStore.get,
    () => DEFAULT_PROFILE
  )
  const preferences = useSyncExternalStore(
    preferencesStore.subscribe,
    preferencesStore.get,
    () => DEFAULT_PREFERENCES
  )
  const playbooks = useSyncExternalStore(
    playbookStore.subscribe,
    playbookStore.get,
    () => SERVER_PLAYBOOKS
  )

  useLayoutEffect(() => {
    applyDocumentAppearance(preferences)
  }, [preferences])

  const updateProfile = useCallback((next: UserProfile) => {
    profileStore.set(next)
  }, [])

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    const current = preferencesStore.get()
    const next = { ...current, ...patch }
    preferencesStore.set(next)
    applyDocumentAppearance(next)
  }, [])

  const savePlaybook = useCallback((playbook: Playbook) => {
    const current = playbookStore.get()
    const index = current.findIndex((item) => item.id === playbook.id)
    const next = current.slice()
    if (index >= 0) next[index] = playbook
    else next.unshift(playbook)
    playbookStore.set(next)
    return playbook
  }, [])

  const getPlaybook = useCallback(
    (id: string) => playbooks.find((item) => item.id === id),
    [playbooks]
  )

  const replaceWorkspace = useCallback(
    (next: {
      profile: UserProfile
      preferences: UserPreferences
      playbooks: Playbook[]
    }) => {
      profileStore.set(next.profile)
      playbookStore.set(next.playbooks)
      preferencesStore.set(next.preferences)
      applyDocumentAppearance(next.preferences)
    },
    []
  )

  const value = useMemo(
    () => ({
      profile,
      preferences,
      playbooks,
      isReady: true,
      updateProfile,
      updatePreferences,
      savePlaybook,
      getPlaybook,
      replaceWorkspace,
    }),
    [
      profile,
      preferences,
      playbooks,
      updateProfile,
      updatePreferences,
      savePlaybook,
      getPlaybook,
      replaceWorkspace,
    ]
  )

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider")
  }
  return context
}
