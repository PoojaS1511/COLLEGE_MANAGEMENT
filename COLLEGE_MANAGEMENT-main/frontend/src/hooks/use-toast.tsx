import { useCallback } from 'react'
import toast, { ToastOptions } from 'react-hot-toast'

export function useToast() {
  const show = useCallback((message: string, opts?: ToastOptions) => {
    toast(message, opts)
  }, [])

  return { toast: show }
}

export default useToast
