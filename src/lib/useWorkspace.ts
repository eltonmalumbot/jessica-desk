import { useRef, useState } from 'react'
import { emptyWorkspace, parseBackup, STORAGE_KEY, serializeWorkspace } from './data'
import type { Workspace } from './data'

export function useWorkspace() {
  const snapshot = useRef<string | null>(null)
  const [initial] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      snapshot.current = raw
      return { data: raw ? parseBackup(raw) : emptyWorkspace(), error: '' }
    } catch {
      return {
        data: emptyWorkspace(),
        error:
          'Saved data could not be read. Export the stored file in Settings before resetting. Changes are blocked to protect your data.',
      }
    }
  })
  const [data, setData] = useState(initial.data)
  const [storageError, setStorageError] = useState(initial.error)
  function save(next: Workspace, reset = false) {
    if (storageError && !reset) throw new Error(storageError)
    const raw = serializeWorkspace(next)
    const validated = parseBackup(raw)
    try {
      if (!reset && localStorage.getItem(STORAGE_KEY) !== snapshot.current)
        throw new Error('Your data changed in another tab. Reload this page before saving.')
      localStorage.setItem(STORAGE_KEY, raw)
      snapshot.current = raw
      setData(validated)
      setStorageError('')
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Could not save: ${error.message}`
          : 'Browser storage is unavailable. Export a backup and check browser settings.',
      )
    }
  }
  return { data, save, storageError }
}
