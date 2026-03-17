// src/pages/member/Payment.tsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { MemberLayout } from '../../components/layout/MemberLayout'
import {
  Lock, Loader2, CheckCircle, XCircle, Clock,
  Smartphone, Wifi, WifiOff, RefreshCw, ShieldCheck,
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

type PaymentStatus = 'idle' | 'initiating' | 'waiting' | 'success' | 'failed'

interface TransactionResult {
  transactionId: string
  status: string
  mpesaReceiptNumber?: string
  amount: number
  type: string
  failureReason?: string
}

// Step messages shown in the waiting modal at different elapsed times
const WAIT_STEPS = [
  { from: 0,   to: 10,  icon: '📡', message: 'Sending request to M-Pesa...',          sub: 'Connecting to Safaricom servers' },
  { from: 10,  to: 25,  icon: '📲', message: 'STK push sent to your phone',            sub: 'Open M-Pesa and enter your PIN now' },
  { from: 25,  to: 60,  icon: '⏳', message: 'Waiting for your PIN confirmation...',   sub: 'The prompt stays active for 60 seconds' },
  { from: 60,  to: 110, icon: '🔄', message: 'Still waiting for confirmation...',      sub: 'If the prompt disappeared, tap Try Again below' },
  { from: 110, to: 180, icon: '⌛', message: 'Taking longer than usual...',            sub: 'M-Pesa may be experiencing delays' },
]

const getWaitStep = (seconds: number) =>
  WAIT_STEPS.find(s => seconds >= s.from && seconds < s.to) ?? WAIT_STEPS[WAIT_STEPS.length - 1]

const QUICK_AMOUNTS = [100, 500, 1000, 2500, 5000, 10000]
const MAX_WAIT_SECONDS = 175

const Payment = () => {
  const [paymentType,    setPaymentType]    = useState<'tithe' | 'offering'>('tithe')
  const [amount,         setAmount]         = useState('')
  const [phone,          setPhone]          = useState('')
  const [paymentStatus,  setPaymentStatus]  = useState<PaymentStatus>('idle')
  const [transactionId,  setTransactionId]  = useState<string | null>(null)
  const [result,         setResult]         = useState<TransactionResult | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isOnline,       setIsOnline]       = useState(navigator.onLine)
  const [pollErrors,     setPollErrors]     = useState(0)

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt = useRef<number>(0)
  const amountRef = useRef(amount)
  const typeRef   = useRef(paymentType)

  const { toast } = useToast()
  const { user }  = useAuth()

  useEffect(() => { amountRef.current = amount },      [amount])
  useEffect(() => { typeRef.current   = paymentType }, [paymentType])

  useEffect(() => {
    if (user?.phone) setPhone(user.phone)
  }, [user])

  useEffect(() => {
    const on  = () => { setIsOnline(true); setPollErrors(0) }
    const off = () => setIsOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => () => stopAll(), [])

  const stopAll = () => {
    if (pollRef.current)  { clearInterval(pollRef.current);  pollRef.current  = null }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }

  const startTimer = () => {
    startedAt.current = Date.now()
    setElapsedSeconds(0)
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.current) / 1000))
    }, 1000)
  }

  const startPolling = useCallback((txId: string) => {
    setPollErrors(0)
    let pollIntervalMs = 3000
    let errCount = 0

    const poll = async () => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000)

      if (elapsed >= MAX_WAIT_SECONDS) {
        stopAll()
        setPaymentStatus('failed')
        setResult({
          transactionId: txId, status: 'failed',
          amount: Number(amountRef.current), type: typeRef.current,
          failureReason: 'Payment request expired. If your M-Pesa was deducted, check your transaction history.',
        })
        return
      }

      if (!navigator.onLine) return

      try {
        const { data } = await api.get(`/payment/status/${txId}`)
        const tx = data.transaction
        errCount = 0
        setPollErrors(0)

        if (tx.status === 'success') {
          stopAll()
          setPaymentStatus('success')
          setResult({
            transactionId: txId, status: 'success',
            mpesaReceiptNumber: tx.mpesaReceiptNumber,
            amount: tx.amount, type: tx.type,
          })
          toast({ title: 'Payment Successful 🙏', description: `KES ${Number(tx.amount).toLocaleString()} ${tx.type} confirmed.` })
          return
        }

        if (tx.status === 'failed') {
          stopAll()
          setPaymentStatus('failed')
          setResult({
            transactionId: txId, status: 'failed',
            amount: tx.amount, type: tx.type,
            failureReason: tx.failureReason ?? 'Transaction was cancelled or declined.',
          })
          return
        }

        // Slow down polling after 30 seconds
        if (elapsed > 30 && pollIntervalMs === 3000) {
          pollIntervalMs = 5000
          clearInterval(pollRef.current!)
          pollRef.current = setInterval(poll, pollIntervalMs)
        }

      } catch {
        errCount++
        setPollErrors(errCount)
        if (errCount === 5) {
          toast({ title: 'Connection issues detected', description: 'Still monitoring your payment.', variant: 'destructive' })
        }
        if (errCount >= 10) {
          stopAll()
          setPaymentStatus('failed')
          setResult({
            transactionId: txId, status: 'failed',
            amount: Number(amountRef.current), type: typeRef.current,
            failureReason: 'Lost connection. If you entered your PIN, check your transaction history.',
          })
        }
      }
    }

    poll() // poll immediately on start
    pollRef.current = setInterval(poll, pollIntervalMs)
  }, [toast])

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isOnline) {
      toast({ title: 'No internet connection', description: 'Please check your connection and try again.', variant: 'destructive' })
      return
    }
    if (!amount || Number(amount) < 1) {
      toast({ title: 'Invalid amount', description: 'Minimum amount is KES 1', variant: 'destructive' })
      return
    }
    const cleanPhone = phone.replace(/\s+/g, '')
    if (!/^(07|01)\d{8}$/.test(cleanPhone)) {
      toast({ title: 'Invalid phone number', description: 'Enter a valid Safaricom number e.g. 0712345678', variant: 'destructive' })
      return
    }

    try {
      setPaymentStatus('initiating')
      const { data } = await api.post('/payment/initiate', {
        amount: Number(amount), phone: cleanPhone, type: paymentType,
      })
      setTransactionId(data.transactionId)
      setPaymentStatus('waiting')
      startTimer()
      startPolling(data.transactionId)
    } catch (err: any) {
      setPaymentStatus('idle')
      if (err?.response?.status === 409 && err?.response?.data?.transactionId) {
        toast({ title: 'Payment already in progress', description: err.response.data.message })
        setTransactionId(err.response.data.transactionId)
        setPaymentStatus('waiting')
        startTimer()
        startPolling(err.response.data.transactionId)
        return
      }
      toast({ title: 'Payment failed to initiate', description: err?.response?.data?.message ?? 'Could not send STK push.', variant: 'destructive' })
    }
  }

  const handleReset = () => {
    stopAll()
    setPaymentStatus('idle')
    setTransactionId(null)
    setResult(null)
    setElapsedSeconds(0)
    setPollErrors(0)
    setAmount('')
  }

  const isProcessing = paymentStatus === 'initiating' || paymentStatus === 'waiting'
  const waitStep     = getWaitStep(elapsedSeconds)
  const timeLeft     = Math.max(0, MAX_WAIT_SECONDS - elapsedSeconds)
  const progressPct  = Math.min(100, (elapsedSeconds / MAX_WAIT_SECONDS) * 100)
  const formatTime   = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <MemberLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-1">Make a Payment</h1>
      <p className="text-sm text-accent italic mb-8">Your giving is an act of worship</p>

      {!isOnline && (
        <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 mb-6 text-sm font-medium">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          You are offline. Please reconnect to make a payment.
        </div>
      )}

      <div className="max-w-[480px] mx-auto">
        <div className="bg-card border border-border rounded-xl p-8">

          <div className="flex items-center justify-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs font-medium text-primary">Secured by Safaricom M-Pesa</span>
          </div>

          <div className="flex gap-3 mb-6">
            {(['tithe', 'offering'] as const).map(type => (
              <button key={type} type="button" disabled={isProcessing} onClick={() => setPaymentType(type)}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold border-2 capitalize transition-all duration-150 ${
                  paymentType === type
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-primary border-border hover:border-primary/40'
                } disabled:opacity-50`}>
                {type === 'tithe' ? '🙏' : '💝'} {type}
              </button>
            ))}
          </div>

          <form onSubmit={handlePay}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount (KES)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-accent">KES</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  disabled={isProcessing} placeholder="0" min="1"
                  className="w-full h-14 pl-14 pr-3 rounded-xl border border-input bg-background text-xl font-bold text-primary focus:border-accent focus:ring-0 focus:outline-none disabled:opacity-50" />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {QUICK_AMOUNTS.map(q => (
                  <button key={q} type="button" disabled={isProcessing} onClick={() => setAmount(String(q))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                      amount === String(q)
                        ? 'bg-accent text-accent-foreground border-accent'
                        : 'bg-background border-border text-muted-foreground hover:border-accent hover:text-accent'
                    } disabled:opacity-40`}>
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-1.5">M-Pesa Phone Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  disabled={isProcessing} placeholder="e.g. 0712345678"
                  className="w-full h-12 pl-10 pr-3 rounded-xl border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none disabled:opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">An STK push prompt will be sent to this number</p>
            </div>

            <button type="submit" disabled={isProcessing || !isOnline}
              className="w-full h-12 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-150">
              {paymentStatus === 'initiating'
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending STK Push...</>
                : <><Lock className="h-4 w-4" /> Pay Now with M-Pesa</>}
            </button>
          </form>
        </div>
      </div>

      {/* WAITING MODAL */}
      {paymentStatus === 'waiting' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">

            <div className={`flex items-center justify-center gap-1.5 text-xs font-medium mb-5 ${isOnline ? 'text-green-500' : 'text-destructive'}`}>
              {isOnline ? <><Wifi className="h-3 w-3" /> Connected</> : <><WifiOff className="h-3 w-3" /> Offline — reconnect to continue</>}
              {pollErrors > 0 && pollErrors < 10 && <span className="text-amber-500 ml-2">· {pollErrors} connection {pollErrors === 1 ? 'error' : 'errors'}</span>}
            </div>

            <div className="relative mx-auto w-20 h-20 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-accent/40" />
              <div className="w-full h-full rounded-full bg-accent/10 flex items-center justify-center text-3xl">{waitStep.icon}</div>
            </div>

            <h3 className="font-serif text-lg font-bold text-primary mb-1">{waitStep.message}</h3>
            <p className="text-sm text-muted-foreground mb-5">{waitStep.sub}</p>

            <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-3 mb-5 text-sm">
              <span className="text-muted-foreground">M-Pesa prompt sent to </span>
              <span className="font-semibold text-primary">{phone}</span>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(elapsedSeconds)} elapsed</span>
                <span className={`font-semibold ${timeLeft < 30 ? 'text-destructive' : 'text-muted-foreground'}`}>{formatTime(timeLeft)} remaining</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-destructive' : 'bg-accent'}`}
                  style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-muted-foreground ml-1">Monitoring payment status</span>
            </div>

            <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive underline transition-colors">
              Cancel payment
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {paymentStatus === 'success' && result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-primary mb-1">Payment Confirmed!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your {result.type} has been received. God bless you 🙏</p>
            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-primary">KES {Number(result.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-primary capitalize">{result.type}</span>
              </div>
              {result.mpesaReceiptNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">M-Pesa Receipt</span>
                  <span className="font-mono font-semibold text-accent text-xs">{result.mpesaReceiptNumber}</span>
                </div>
              )}
            </div>
            <button onClick={handleReset} className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all duration-150">
              Make Another Payment
            </button>
          </div>
        </div>
      )}

      {/* FAILED MODAL */}
      {paymentStatus === 'failed' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-5">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h3 className="font-serif text-xl font-bold text-primary mb-2">Payment Not Completed</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {result?.failureReason ?? 'The transaction was not completed.'}
            </p>
            {result?.failureReason?.includes('deducted') && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-4 text-xs text-amber-600 text-left">
                💡 If your M-Pesa was deducted, Safaricom will reverse it automatically. Check your Transaction History to confirm.
              </div>
            )}
            <button onClick={handleReset} className="w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-all duration-150 flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </div>
        </div>
      )}
    </MemberLayout>
  )
}

export default Payment