import { createContext, useContext } from 'react'
import type { Workspace } from './lib/data'
export type Page = 'dashboard' | 'planner' | 'captions' | 'leads' | 'tasks' | 'settings'
export type DeskContext = {
  data: Workspace
  update: (data: Workspace, reset?: boolean) => boolean
  notify: (message: string, error?: boolean) => void
  confirm: (title: string, description: string, label?: string) => Promise<boolean>
  copy: (text: string) => Promise<void>
  navigate: (page: Page) => void
  storageError: string
}
export const Desk = createContext<DeskContext | null>(null)
export function useDesk() {
  const context = useContext(Desk)
  if (!context) throw new Error('Workspace provider missing')
  return context
}
