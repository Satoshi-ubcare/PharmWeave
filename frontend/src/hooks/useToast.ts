import { useToastStore, type ToastType } from '@/stores/toastStore'

export function useToast(): { toast: (type: ToastType, message: string) => void } {
  const addToast = useToastStore((state) => state.addToast)
  return { toast: addToast }
}
