import { useState } from 'react'
import { paymentApi } from '@/api/endpoints'
import type { Payment } from '@/types'

export function usePaymentCreate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const process = async (
    visitId: string,
    method: 'cash' | 'card' | 'transfer',
  ): Promise<Payment | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await paymentApi.create(visitId, method)
      return res.data
    } catch {
      setError('수납 처리에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, process }
}
