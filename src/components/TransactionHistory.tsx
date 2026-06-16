import React from 'react';
import { Investment, Deposit, Withdrawal } from '../types';
import { Clock, TrendingUp, CheckCircle, AlertCircle, ArrowUpCircle, ArrowDownCircle, Briefcase, Calendar, Check } from 'lucide-react';

interface TransactionHistoryProps {
  investments: Investment[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  onApproveDeposit: (depositId: string) => void;
  onRejectDeposit: (depositId: string) => void;
  onClaimWithdrawal: (withdrawalId: string) => void;
  onClaimYield: (investmentId: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  investments,
  deposits,
  withdrawals,
  onApproveDeposit,
  onRejectDeposit,
  onClaimWithdrawal,
  onClaimYield
}) => {
  const [activeTab, setActiveTab] = React.useState<'pools' | 'deposits' | 'withdrawals'>('pools');

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 shadow-xl">
      
      {/* Tab Switch Headers */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-1.5 font-sans">
          <Calendar size={18} className="text-blue-400" />
          Wallet Activity Register
        </h3>
        
        <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-1 text-xs">
          <button
            onClick={() => setActiveTab('pools')}
            className={`rounded-md px-3 py-1.5 font-semibold transition cursor-pointer ${
              activeTab === 'pools' ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Active Pools ({investments.length})
          </button>
          
          <button
            onClick={() => setActiveTab('deposits')}
            className={`rounded-md px-3 py-1.5 font-semibold transition cursor-pointer ${
              activeTab === 'deposits' ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Deposits ({deposits.length})
          </button>
          
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`rounded-md px-3 py-1.5 font-semibold transition cursor-pointer ${
              activeTab === 'withdrawals' ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            My Withdrawals ({withdrawals.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="mt-5">
        
        {/* TAB 1: ACTIVE POOLS */}
        {activeTab === 'pools' && (
          <div className="space-y-4">
            {investments.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Briefcase className="mx-auto h-12 w-12 text-zinc-700 stroke-[1.5]" />
                <p className="text-sm font-medium">No active packages in trading queue.</p>
                <p className="text-xs text-zinc-650">Select a trading pool above to activate yield returns.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...investments].reverse().map((item) => {
                  const progressPct = Math.min(100, (item.payoutsClaimed / item.durationDays) * 100);
                  const daysRemaining = Math.max(0, item.durationDays - item.payoutsClaimed);
                  const isClaimableYield = item.accruedAmount > 0;
                  
                  return (
                    <div 
                      key={item.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                        item.status === 'completed'
                          ? 'bg-slate-950/50 border-slate-950 opacity-75'
                          : item.status === 'pending_approval'
                          ? 'bg-slate-950 border-amber-500/20'
                          : 'bg-slate-950 border-slate-800 hover:border-blue-500/30'
                      }`}
                    >
                      <div>
                        {/* Status Line */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-slate-500 text-[10px] uppercase font-semibold">
                            ID: {item.id.slice(0, 8)}
                          </span>
                          
                          {item.status === 'completed' ? (
                            <span className="flex items-center gap-1 rounded-full bg-emerald-500/11 px-2.2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                              <CheckCircle size={10} /> Completed
                            </span>
                          ) : item.status === 'pending_approval' ? (
                            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.2 py-0.5 text-[10px] font-bold text-amber-500 font-mono animate-pulse">
                              <Clock size={10} /> Pending Admin Approval
                            </span>
                          ) : item.status === 'rejected' ? (
                            <span className="flex items-center gap-1 rounded-full bg-rose-500/10 px-2.2 py-0.5 text-[10px] font-bold text-rose-500 font-mono">
                              <AlertCircle size={10} /> Rejected
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.2 py-0.5 text-[10px] font-bold text-blue-400 font-mono animate-pulse">
                              <Clock size={10} /> Yield Queueing
                            </span>
                          )}
                        </div>

                        {/* Package Info */}
                        <h4 className="mt-2.5 font-display text-base font-bold text-white tracking-tight">
                          {item.packageName}
                        </h4>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-b border-slate-800 pb-3">
                          <div>
                            <span className="text-slate-400 font-medium font-sans">Invest Capital:</span>
                            <p className="font-mono font-bold text-white">${item.cost}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium font-sans">Total Returns:</span>
                            <p className="font-mono font-bold text-emerald-400">${item.totalExpectedProfit}</p>
                          </div>
                        </div>

                        {/* Real-time Yield Accumulation Details */}
                        <div className="mt-3.5 space-y-1.5 text-xs text-slate-300">
                          <div className="flex justify-between font-mono">
                            <span className="text-slate-400">Yield Balance Accrued:</span>
                            <span className="text-emerald-400 font-bold">${item.accruedAmount.toFixed(2)} USD</span>
                          </div>
                          
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>Payout Cycles:</span>
                            <span>{item.payoutsClaimed} / {item.durationDays} Days Paid</span>
                          </div>
                        </div>

                        {/* Progress Bar indicator */}
                        <div className="mt-3">
                          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Line */}
                      {item.status === 'active' && isClaimableYield && (
                        <div className="mt-3 bg-blue-600/10 border border-blue-500/20 rounded-xl p-2.5 flex items-center justify-between text-xs transition duration-200">
                          <span className="text-blue-200 font-semibold font-sans">+${item.accruedAmount.toFixed(2)} Wallet yield ready</span>
                          <button
                            onClick={() => onClaimYield(item.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1 text-[10px] font-bold transition cursor-pointer font-sans"
                          >
                            Claim Yield
                          </button>
                        </div>
                      )}

                      {/* Remaining Lock Counter */}
                      <div className="mt-4 pt-3.5 border-t border-zinc-805 flex items-center justify-between text-xs text-zinc-400">
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          Activated: {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        
                        {item.status === 'active' ? (
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                          </span>
                        ) : item.status === 'pending_approval' ? (
                          <span className="font-mono text-[11px] text-amber-500 font-semibold bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse">
                            Awaiting admin clearance
                          </span>
                        ) : item.status === 'rejected' ? (
                          <span className="font-mono text-[11px] text-rose-500 font-semibold bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                            Payment Denied
                          </span>
                        ) : (
                          <span className="font-mono text-[11px] text-zinc-500 line-through">
                            Fully Matured
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DEPOSIT REGISTER */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            {deposits.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ArrowDownCircle className="mx-auto h-12 w-12 text-slate-700 stroke-[1.5]" />
                <p className="text-sm font-medium">No deposit requests recorded.</p>
                <p className="text-xs text-slate-650">Deposits submitted via our receipt reference code are registered here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-3">Receipt Code</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Request Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[...deposits].reverse().map((dep) => (
                      <tr key={dep.id} className="hover:bg-slate-900/30 font-mono">
                        <td className="px-4 py-3 font-semibold text-white">{dep.refNumber}</td>
                        <td className="px-4 py-3 text-slate-400 text-[11px]">{dep.phoneNumber}</td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(dep.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">${dep.amount}</td>
                        <td className="px-4 py-3 text-right">
                          {dep.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-sans">
                              <CheckCircle size={10} /> Verified & Wallet Credited
                            </span>
                          )}
                          {dep.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 animate-pulse font-sans">
                              <AlertCircle size={10} /> Awaiting Verification
                            </span>
                          )}
                          {dep.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-500 font-sans">
                              <AlertCircle size={10} /> Disapproved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: WITHDRAWAL JOURNAL */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ArrowUpCircle className="mx-auto h-12 w-12 text-slate-700 stroke-[1.5]" />
                <p className="text-sm font-medium">No withdrawal payouts logged.</p>
                <p className="text-xs text-slate-650 font-sans">Withdrawal requests requested from your profit balance appear in this journal.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Receipt Phone</th>
                      <th className="px-4 py-3">Payout Timestamp</th>
                      <th className="px-4 py-3 text-right">Claim Funds</th>
                      <th className="px-4 py-3 text-right">Status</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[...withdrawals].reverse().map((w) => (
                      <tr key={w.id} className="hover:bg-slate-900/30 font-mono">
                        <td className="px-4 py-3 text-slate-400 text-xs text-slate-500">WD-{w.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs font-semibold">{w.phoneNumber}</td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(w.requestedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-sans text-center">
                          {w.status === 'approved' ? (
                            <button
                              onClick={() => {
                                onClaimWithdrawal(w.id);
                              }}
                              className="rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 text-[10px] shadow cursor-pointer transition animate-bounce"
                            >
                              Claim Payout (Receive Funds)
                            </button>
                          ) : w.status === 'completed' ? (
                            <span className="text-[10px] text-zinc-550 font-medium">Claimed successfully</span>
                          ) : (
                            <span className="text-[10px] text-zinc-550 font-medium">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-sans text-right">
                          {w.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                              <CheckCircle size={10} /> Dispatched & Claimed
                            </span>
                          ) : w.status === 'approved' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-400">
                              Cleared (Ready to Claim)
                            </span>
                          ) : w.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 animate-pulse">
                              <AlertCircle size={10} /> Review Disapproved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 animate-pulse">
                              Pending Admin Review
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-rose-450">-${w.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
