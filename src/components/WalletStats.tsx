import React from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp, DollarSign, Plus, ArrowRightLeft } from 'lucide-react';
import { UserWallet } from '../types';

interface WalletStatsProps {
  wallet: UserWallet;
  activeInvestmentsTotal: number;
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  pendingDepositsCount: number;
}

export const WalletStats: React.FC<WalletStatsProps> = ({
  wallet,
  activeInvestmentsTotal,
  onOpenDeposit,
  onOpenWithdrawal,
  pendingDepositsCount
}) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      
      {/* 1. Main Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 shadow-xl border border-slate-800 col-span-1 sm:col-span-2 lg:col-span-2">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Wallet size={120} className="text-blue-500 rotate-12" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Account Wallet Balance
          </div>
          <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-300 font-mono">
            Active Account
          </span>
        </div>
        
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-emerald-400 tracking-tight sm:text-5xl font-mono">
            ${wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-slate-400 font-medium text-sm">USD</span>
        </div>
        
        <p className="mt-1 text-xs text-blue-400 font-medium flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-400" />
          Automated daily yield accrues strictly from deposits
        </p>

        {/* Primary Wallet Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={onOpenDeposit}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 font-sans text-xs font-bold text-white transition-all duration-200 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            Deposit Funds
          </button>
          
          <button
            onClick={onOpenWithdrawal}
            disabled={wallet.balance <= 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 font-sans text-xs font-bold text-slate-100 transition-all duration-200 hover:bg-slate-750 hover:border-slate-650 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowUpCircle size={14} className="text-emerald-400" />
            Withdraw Balance
          </button>
        </div>
      </div>

      {/* 2. Active Investments Column */}
      <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wider">
            <span>Locked Pools</span>
            <TrendingUp size={14} className="text-slate-500" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-white font-mono">
            ${activeInvestmentsTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active trading pool locked seed
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
          <span>Accrual rate</span>
          <span className="font-mono text-emerald-400 font-bold">Standard Daily</span>
        </div>
      </div>

      {/* 3. Total Profit Earned Column */}
      <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wider">
            <span>Total profits</span>
            <ArrowDownCircle size={14} className="text-emerald-500" />
          </div>
          <div className="mt-3 font-display text-2xl font-bold text-emerald-400 font-mono">
            +${wallet.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Automated daily yields accumulated
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
          <span>Profit multiple</span>
          <span className="font-mono text-zinc-300 font-semibold">Min 4.0x</span>
        </div>
      </div>

      {/* 4. Deposits & Withdrawals Stats Column */}
      <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium uppercase tracking-wider">
            <span>History summary</span>
            <ArrowRightLeft size={14} className="text-slate-500" />
          </div>
          
          <div className="mt-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Deposited:</span>
              <span className="font-mono text-xs text-white font-bold">${wallet.totalDeposited.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Total Withdrawn:</span>
              <span className="font-mono text-xs text-slate-300 font-bold">${wallet.totalWithdrawn.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Pending deposits:</span>
          {pendingDepositsCount > 0 ? (
            <span className="rounded bg-amber-500/10 px-1.5 py-0.2 font-mono text-amber-500 font-bold animate-pulse">
              {pendingDepositsCount} pending
            </span>
          ) : (
            <span className="text-slate-500 font-mono">0 pending</span>
          )}
        </div>
      </div>

    </div>
  );
};
