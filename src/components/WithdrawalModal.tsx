import React from 'react';
import { X, ArrowUpCircle, Info, PhoneCall } from 'lucide-react';
import { UserWallet } from '../types';

interface WithdrawalModalProps {
  wallet: UserWallet;
  isOpen: boolean;
  onClose: () => void;
  onConfirmWithdrawal: (amount: number, phone: string) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  wallet,
  isOpen,
  onClose,
  onConfirmWithdrawal
}) => {
  const [amount, setAmount] = React.useState('');
  const [withdrawPhone, setWithdrawPhone] = React.useState(wallet.phoneNumber);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setAmount('');
      setWithdrawPhone(wallet.phoneNumber);
      setErrorMessage('');
      setSuccess(false);
    }
  }, [isOpen, wallet]);

  if (!isOpen) return null;

  const handleWithdrawAll = () => {
    setAmount(wallet.balance.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      setErrorMessage('Please enter a valid amount.');
      return;
    }

    if (withdrawAmount > wallet.balance) {
      setErrorMessage(`Insufficient balance. Maximum withdrawable is $${wallet.balance.toFixed(2)} USD.`);
      return;
    }

    if (!withdrawPhone.trim()) {
      setErrorMessage('Please input your payout receipt phone number.');
      return;
    }

    // Call callback to withdraw instantly!
    onConfirmWithdrawal(withdrawAmount, withdrawPhone);
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="withdrawal-modal-container"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-450">
            <ArrowUpCircle size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Request Instant Withdrawal
            </h3>
            <p className="text-xs text-slate-400">
              Withdraw automated daily profits any time.
            </p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3 animate-scale-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/10 text-blue-400">
              <svg className="h-6 w-6 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-white">Withdrawal Dispatched!</h4>
            <p className="text-xs text-slate-405 max-w-xs mx-auto font-sans">
              Mobile payout of <span className="text-emerald-400 font-bold">${parseFloat(amount).toFixed(2)} USD</span> has been submitted to {withdrawPhone}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Withdrawable Balance:</span>
              <span className="font-mono text-emerald-400 font-bold text-base">
                ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>

            {/* Input fields */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 font-sans">
                     Withdraw Amount (USD)
                  </label>
                  <button
                    type="button"
                    onClick={handleWithdrawAll}
                    className="text-[10px] text-blue-400 hover:underline hover:text-blue-300 font-bold cursor-pointer font-sans"
                  >
                    Withdraw All
                  </button>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    step="any"
                    min="0.01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-7 pr-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter amount to withdraw"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 mb-1 font-sans">
                   Receipt Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">
                    <PhoneCall size={14} />
                  </span>
                  <input
                    type="text"
                    value={withdrawPhone}
                    onChange={(e) => {
                      setWithdrawPhone(e.target.value);
                      setErrorMessage('');
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                    placeholder="Payment phone number"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-500 font-medium font-sans">
                  We process instant mobile withdrawals directly to this number.
                </p>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-450 font-semibold bg-rose-500/5 border border-rose-500/10 p-2 rounded font-sans">
                ⚠️ {errorMessage}
              </p>
            )}

            <div className="text-[11px] leading-relaxed text-slate-400 flex gap-1.5 items-start bg-slate-950 p-3 rounded-lg border border-slate-800">
              <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
              <span>
                Withdrawals can be requested at any time. TZX Traders automated daily payout distributes funds instantly to user-configured payment channels.
              </span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-3 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-500/10"
            >
              Confirm Withdrawal Request
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
