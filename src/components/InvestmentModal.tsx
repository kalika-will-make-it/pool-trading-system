import React from 'react';
import { X, Copy, Check, Info, ShieldCheck, Wallet, ArrowDownRight, PhoneCall } from 'lucide-react';
import { InvestmentPackage } from '../types';
import { PAYMENT_PHONE_NUMBER } from '../data';

interface InvestmentModalProps {
  pkg: InvestmentPackage;
  userBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDirectInvest: (pkg: InvestmentPackage) => void;
  onSubmitPendingDeposit: (amount: number, refCode: string) => void;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  pkg,
  userBalance,
  isOpen,
  onClose,
  onConfirmDirectInvest,
  onSubmitPendingDeposit
}) => {
  const [copied, setCopied] = React.useState(false);
  const [depositAmount, setDepositAmount] = React.useState(pkg.price.toString());
  const [refCode, setRefCode] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isDepositing, setIsDepositing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDepositAmount(pkg.price.toString());
      setRefCode('');
      setErrorMessage('');
      setCopied(false);
      // If user has insufficient balance, auto-switch mock toggle to "show instructions"
      setIsDepositing(userBalance < pkg.price);
    }
  }, [isOpen, pkg, userBalance]);

  if (!isOpen) return null;

  const hasSufficientBalance = userBalance >= pkg.price;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(PAYMENT_PHONE_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDirect = () => {
    onConfirmDirectInvest(pkg);
    onClose();
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    
    if (isNaN(amountNum) || amountNum < 10) {
      setErrorMessage('Minimum deposit amount is 10 USD.');
      return;
    }

    if (!refCode.trim() || refCode.trim().length < 5) {
      setErrorMessage('Please enter a valid payment transaction reference (min 5 characters).');
      return;
    }

    onSubmitPendingDeposit(amountNum, refCode.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="investment-modal-container"
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              Invest in {pkg.name}
            </h3>
            <p className="text-xs text-slate-400">
              Maturity returns: <span className="text-emerald-400 font-bold">${pkg.totalReturn} USD</span> within {pkg.durationDays} days.
            </p>
          </div>
        </div>

        {/* Tab switch mechanism if has sufficient balance */}
        {hasSufficientBalance && (
          <div className="mt-4 flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setIsDepositing(false)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition cursor-pointer ${
                !isDepositing ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Direct Activation (${pkg.price} USD)
            </button>
            <button
              onClick={() => setIsDepositing(true)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition cursor-pointer ${
                isDepositing ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              Deposit via Mobile Payment
            </button>
          </div>
        )}

        {/* CASE A: Direct Activation */}
        {!isDepositing ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Your Balance:</span>
                <span className="font-mono font-semibold text-white">${userBalance.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Investment Cost:</span>
                <span className="font-mono font-semibold text-rose-400">-${pkg.price.toFixed(2)} USD</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800/60 flex justify-between text-xs font-bold text-white">
                <span>Remaining Balance:</span>
                <span className="font-mono text-emerald-400">${(userBalance - pkg.price).toFixed(2)} USD</span>
              </div>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed bg-slate-950 border border-slate-800 p-3 rounded-lg flex gap-2">
              <ShieldCheck size={18} className="text-blue-400 shrink-0" />
              <span>
                By activating this pool, your seed capital is immediately registered inside the trading queue. Payout calculations start daily.
              </span>
            </div>

            <button
              onClick={handleConfirmDirect}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-sans text-xs font-bold text-white hover:bg-blue-500 cursor-pointer shadow-lg shadow-blue-500/10"
            >
              Activate Direct Pool Seed
            </button>
          </div>
        ) : (
          /* CASE B: Insufficient Balance / Manual Mobile Money Deposit Instructions */
          <div className="mt-5 space-y-4">
            
            {userBalance < pkg.price && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-xs text-amber-500 flex gap-2 leading-relaxed">
                <Info size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Insufficient Balance:</span> Your current available balance is <span className="font-mono font-bold">${userBalance.toFixed(2)} USD</span>. Please send payment to the official pool receipt number to complete reactivation.
                </div>
              </div>
            )}

            {/* Target Payment Information Visual Panel */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium font-sans">1. Send Mobile Payment To:</span>
                <span className="rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.2 text-[9px] uppercase font-bold">
                  TZX Direct Pool
                </span>
              </div>
              
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <PhoneCall size={16} className="text-blue-450" />
                  <span className="font-mono font-bold text-base text-white tracking-widest">
                    {PAYMENT_PHONE_NUMBER}
                  </span>
                </div>
                
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="flex items-center gap-1 rounded bg-slate-850 hover:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-blue-400 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="stroke-[3]" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy No.
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed space-y-1">
                <p>💸 <span className="text-white font-medium font-sans">Minimum Entry:</span> 10 USD (or equivalent currency)</p>
                <p>👤 Send the required seed amount for <span className="text-white font-semibold font-sans">{pkg.name}</span> (${pkg.price} USD) to activate this premium package.</p>
              </div>
            </div>

            {/* Deposit Submit Form */}
            <form onSubmit={handleDepositSubmit} className="space-y-3.5 pt-1">
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-sans">
                    Deposit Amount ($)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    min={10}
                    placeholder="E.g., 10"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-sans">
                    Receipt Ref Code
                  </label>
                  <input
                    type="text"
                    value={refCode}
                    onChange={(e) => {
                      setRefCode(e.target.value.toUpperCase());
                      setErrorMessage('');
                    }}
                    required
                    maxLength={15}
                    placeholder="E.g., TXN98765"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm font-mono text-white uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {errorMessage && (
                <p className="text-xs text-rose-500 font-medium font-sans animate-pulse">
                  ⚠️ {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/10"
              >
                <ArrowDownRight size={15} />
                Submit Deposit Reference & Activate
              </button>

              <p className="text-center text-[10px] text-slate-500 font-medium font-sans">
                Submission submits payment verification to the pending queue for automated activation.
              </p>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
