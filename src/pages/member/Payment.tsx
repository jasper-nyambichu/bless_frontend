import { useState } from 'react';
import { MemberLayout } from '../../components/layout/MemberLayout';
import { Lock, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Payment = () => {
  const [paymentType, setPaymentType] = useState<'tithe' | 'offering'>('tithe');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

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
    setShowModal(true);
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 3000));
    setIsProcessing(false);
    setShowModal(false);
    toast({ title: 'Payment Successful', description: `${paymentType === 'tithe' ? 'Tithe' : 'Offering'} of KES ${Number(amount).toLocaleString()} received.` });
    setAmount('');
    setPhone('');
  };

  return (
    <MemberLayout>
      <h1 className="font-serif text-2xl font-bold text-primary mb-1">Make a Payment</h1>
      <p className="text-sm text-accent italic mb-8">Your giving is an act of worship</p>

      <div className="max-w-[480px] mx-auto">
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Type Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setPaymentType('tithe')}
              className={`flex-1 h-11 rounded-md text-sm font-semibold border ${
                paymentType === 'tithe'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-primary border-border hover:bg-muted'
              }`}
            >
              Tithe
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('offering')}
              className={`flex-1 h-11 rounded-md text-sm font-semibold border ${
                paymentType === 'offering'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-primary border-border hover:bg-muted'
              }`}
            >
              Offering
            </button>
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
                  className="w-full h-12 pl-12 pr-3 rounded-md border border-input bg-background text-lg font-semibold text-primary focus:border-accent focus:ring-0 focus:outline-none"
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
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:border-accent focus:ring-0 focus:outline-none"
                placeholder="e.g. 0712345678"
              />
              <p className="text-xs text-muted-foreground mt-1">An STK push will be sent to this number</p>
            </div>

            {/* Pay Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full h-11 bg-accent text-accent-foreground rounded-md text-sm font-bold hover:bg-gold-light disabled:opacity-50 flex items-center justify-center"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Pay Now'}
            </button>

            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-3">
              <Lock className="h-3 w-3" /> Secured by Mpesa
            </p>
          </form>
        </div>
      </div>

      {/* STK Push Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-8 max-w-sm w-full mx-4 text-center">
            <h3 className="font-serif text-lg font-bold text-primary mb-2">Complete Payment</h3>
            <p className="text-sm text-muted-foreground mb-6">
              An Mpesa prompt has been sent to <strong className="text-foreground">{phone}</strong>. Enter your PIN to confirm.
            </p>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        </div>
      )}
    </MemberLayout>
  );
};

export default Payment;
