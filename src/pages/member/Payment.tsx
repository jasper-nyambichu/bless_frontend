import { useState, useEffect, useRef } from 'react';
import { MemberLayout } from '../../components/layout/MemberLayout';
import { Lock, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

type PaymentStatus = 'idle' | 'initiating' | 'waiting' | 'success' | 'failed';

interface TransactionResult {
  transactionId: string;
  checkoutRequestId: string;
  status: string;
  mpesaReceiptNumber?: string;
  amount: number;
  type: string;
}

const Payment = () => {
  const [paymentType, setPaymentType] = useState<'tithe' | 'offering'>('tithe');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // pre-fill phone from user profile
  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  // cleanup polling on unmount
  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current) };
  }, []);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (txId: string) => {
    setPollCount(0);
    pollRef.current = setInterval(async () => {
      setPollCount(prev => {
        // stop after 2 minutes (24 polls × 5s)
        if (prev >= 24) {
          stopPolling();
          setPaymentStatus('failed');
          toast({
            title: 'Payment timed out',
            description: 'No response received. If you entered your PIN, check your transaction history.',
            variant: 'destructive',
          });
          return prev;
        }
        return prev + 1;
      });

      try {
        const { data } = await api.get(`/payment/status/${txId}`);
        const status = data.transaction?.status;

        if (status === 'success') {
          stopPolling();
          setPaymentStatus('success');
          setResult({
            transactionId: txId,
            checkoutRequestId: data.transaction.checkoutRequestId,
            status: 'success',
            mpesaReceiptNumber: data.transaction.mpesaReceiptNumber,
            amount: data.transaction.amount,
            type: data.transaction.type,
          });
          toast({
            title: 'Payment Successful 🙏',
            description: `KES ${Number(data.transaction.amount).toLocaleString()} ${data.transaction.type} confirmed.`,
          });
        } else if (status === 'failed' || status === 'cancelled') {
          stopPolling();
          setPaymentStatus('failed');
          toast({
            title: 'Payment Failed',
            description: 'Transaction was cancelled or failed. Please try again.',
            variant: 'destructive',
          });
        }
        // if still 'pending' keep polling
      } catch {
        // network error during polling — keep trying
      }
    }, 5000); // poll every 5 seconds
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) < 1) {
      toast({ title: 'Invalid amount', description: 'Minimum amount is KES 1', variant: 'destructive' });
      return;
    }
    if (!phone.trim()) {
      toast({ title: 'Phone required', description: 'Enter your Mpesa phone number', variant: 'destructive' });
      return;
    }

    // format phone — ensure it starts with 07 or 01
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(07|01)\d{8}$/.test(cleanPhone)) {
      toast({ title: 'Invalid phone', description: 'Enter a valid Safaricom number e.g. 0712345678', variant: 'destructive' });
      return;
    }

    try {
      setPaymentStatus('initiating');

      const { data } = await api.post('/payment/initiate', {
        amount: Number(amount),
        phone: cleanPhone,
        type: paymentType,
      });

      setTransactionId(data.transactionId);
      setPaymentStatus('waiting');

      toast({
        title: 'STK Push Sent',
        description: `Check your phone ${cleanPhone} and enter your Mpesa PIN.`,
      });

      // start polling for status
      startPolling(data.transactionId);

    } catch (err: any) {
      setPaymentStatus('idle');
      toast({
        title: 'Payment initiation failed',
        description: err?.response?.data?.message ?? 'Could not send STK push. Try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    stopPolling();
    setPaymentStatus('idle');
    setTransactionId(null);
    setResult(null);
    setPollCount(0);
    setAmount('');
  };

  const isProcessing = paymentStatus === 'initiating' || paymentStatus === 'waiting';

  return (
    <MemberLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-1">Make a Payment</h1>
      <p className="text-sm text-accent italic mb-8">Your giving is an act of worship</p>

      <div className="max-w-[480px] mx-auto">
        <div className="bg-card border border-border rounded-lg p-8">

          {/* Type Toggle */}
          <div className="flex gap-3 mb-6">
            {(['tithe', 'offering'] as const).map(type => (
              <button
                key={type}
                type="button"
                disabled={isProcessing}
                onClick={() => setPaymentType(type)}
                className={`flex-1 h-11 rounded-md text-sm font-semibold border capitalize ${
                  paymentType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-primary border-border hover:bg-muted'
                } disabled:opacity-50`}
              >
                {type}
              </button>
            ))}
          </div>

          <form onSubmit={handlePay}>
            {/* Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1.5">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">KES</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  disabled={isProcessing}
                  className="w-full h-12 pl-12 pr-3 rounded-md border border-input bg-background text-lg font-semibold text-primary focus:border-accent focus:ring-0 focus:outline-none disabled:opacity-50"
                  placeholder="0"
                  min="1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum amount: KES 1</p>
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-1.5">Mpesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={isProcessing}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none disabled:opacity-50"
                placeholder="e.g. 0712345678"
              />
              <p className="text-xs text-muted-foreground mt-1">An STK push will be sent to this number</p>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-accent text-accent-foreground rounded-md text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {paymentStatus === 'initiating' ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending STK Push...</>
              ) : 'Pay Now'}
            </button>

            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-3">
              <Lock className="h-3 w-3" /> Secured by Mpesa
            </p>
          </form>
        </div>
      </div>

      {/* ── STK Waiting Modal ─────────────────────────────────────────── */}
      {paymentStatus === 'waiting' && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-primary mb-2">Waiting for Payment</h3>
            <p className="text-sm text-muted-foreground mb-2">
              An Mpesa prompt has been sent to{' '}
              <strong className="text-foreground">{phone}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Enter your <strong className="text-foreground">Mpesa PIN</strong> to complete your {paymentType}.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Checking payment status... ({pollCount * 5}s)</span>
            </div>
            <button
              onClick={handleReset}
              className="mt-6 text-xs text-muted-foreground hover:text-destructive underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Success Modal ─────────────────────────────────────────────── */}
      {paymentStatus === 'success' && result && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full text-center">
            <CheckCircle className="h-14 w-14 text-success mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-primary mb-1">Payment Confirmed!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your {result.type} has been received. God bless you 🙏</p>

            <div className="bg-muted rounded-md p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-primary">KES {Number(result.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-semibold text-primary capitalize">{result.type}</span>
              </div>
              {result.mpesaReceiptNumber && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mpesa Receipt</span>
                  <span className="font-semibold text-primary">{result.mpesaReceiptNumber}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
            >
              Make Another Payment
            </button>
          </div>
        </div>
      )}

      {/* ── Failed Modal ──────────────────────────────────────────────── */}
      {paymentStatus === 'failed' && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full text-center">
            <XCircle className="h-14 w-14 text-destructive mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-primary mb-2">Payment Failed</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The transaction was not completed. This could be because you cancelled, entered the wrong PIN, or the request timed out.
            </p>
            <button
              onClick={handleReset}
              className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </MemberLayout>
  );
};

export default Payment;