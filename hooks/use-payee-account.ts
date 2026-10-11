'use client'

import { useEffect, useState } from 'react'
import type { PayeeAccount } from '@/types/payee-account'

interface PayeeAccountState {
  account: PayeeAccount | null
  loading: boolean
  error: string | null
}

const IDLE_STATE: PayeeAccountState = { account: null, loading: false, error: null }

export function usePayeeAccount(payeeId: string | null): PayeeAccountState {
  const [state, setState] = useState<PayeeAccountState>(IDLE_STATE)

  useEffect(() => {
    if (!payeeId) {
      setState(IDLE_STATE)
      return
    }

    const controller = new AbortController()
    setState({ account: null, loading: true, error: null })

    fetch(`/api/payees/${payeeId}/account`, { signal: controller.signal })
      .then(async (res) => {
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || '계좌 정보 조회 실패')
        setState({ account: result.data, loading: false, error: null })
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return
        setState({ account: null, loading: false, error: error.message })
      })

    return () => controller.abort()
  }, [payeeId])

  return state
}
