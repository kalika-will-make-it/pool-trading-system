import React, { useState } from 'react';
import { Deposit, Withdrawal, Investment, InvestmentPackage, UserAccount, SupportTicket } from '../types';
import { CheckCircle2, XCircle, Clock, Check, X, ShieldAlert, Award, FileSearch, Coins, PiggyBank, BadgeAlert, ArrowUpRight, TrendingUp, HelpCircle } from 'lucide-react';
import { SupportTicketComponent } from './SupportTicket';

interface AdminPanelProps {
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  investments: Investment[];
  users: UserAccount[];
  tickets: SupportTicket[];
  currentUser: UserAccount;
  onApproveDeposit: (id: string) => void;
  onRejectDeposit: (id: string) => void;
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
  onApproveInvestment: (id: string) => void;
  onRejectInvestment: (id: string) => void;
  onRespondToTicket: (id: string, response: string) => Promise<void>;
  onCloseTicket: (id: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  deposits,
  withdrawals,
  investments,
  users,
  tickets,
  currentUser,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onRejectWithdrawal,
  onApproveInvestment,
  onRejectInvestment,
  onRespondToTicket,
  onCloseTicket
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'withdrawals' | 'packages' | 'users' | 'tickets'>('deposits');

  // Stats Counters
  const pendingDeposits = deposits.filter((d) => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const pendingInvestments = investments.filter((i) => i.status === 'pending_approval');
  const pendingTickets = tickets.filter((t) => t.status === 'pending');

  const totalVaultDeposits = deposits
    .filter((d) => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalVaultWithdrawals = withdrawals
    .filter((w) => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalUsersBalance = users.reduce((sum, u) => sum + u.wallet.balance, 0);

  return (
    <div className="space-y-6">
      
      {/* Admin Title Banner */}
      <div className="rounded-2xl border border-blue-900 bg-slate-900/40 p-5 sm:p-6 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-400 shrink-0">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black text-white flex items-center gap-2">
                Administrative Clearing Panel
                <span className="rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold">
                  Authorized Admin Only
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review payment proof references, authorize manual payout requests, and unlock priority investment packages instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Administrative Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                Clearance Ledger Deposits
              </span>
              <p className="font-mono text-xl font-black text-emerald-400 mt-1">
                ${totalVaultDeposits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <PiggyBank size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Approved cumulative deposit value</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                Cleared Withdrawals
              </span>
              <p className="font-mono text-xl font-black text-rose-400 mt-1">
                ${totalVaultWithdrawals.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Coins size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Total processed user payout releases</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                Accumulated User Balances
              </span>
              <p className="font-mono text-xl font-black text-blue-400 mt-1">
                ${totalUsersBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Sum of all current virtual wallet balances</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-sans">
                Active Investors
              </span>
              <p className="font-mono text-xl font-black text-white mt-1">
                {users.filter(u => !u.isAdmin).length} Users
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Award size={16} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-sans">Registered non-admin active profiles</p>
        </div>

      </div>

      {/* Admin Operations Sub-navigation */}
      <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs">
        <button
          onClick={() => setActiveSubTab('deposits')}
          className={`flex-1 rounded-lg py-2 cursor-pointer font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'deposits' ? 'bg-blue-600/15 text-blue-450 border border-blue-500/20' : 'text-slate-450 hover:text-white'
          }`}
        >
          Deposits Review ({pendingDeposits.length})
        </button>
        <button
          onClick={() => setActiveSubTab('withdrawals')}
          className={`flex-1 rounded-lg py-2 cursor-pointer font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'withdrawals' ? 'bg-blue-600/15 text-blue-450 border border-blue-500/20' : 'text-slate-450 hover:text-white'
          }`}
        >
          Withdrawals Review ({pendingWithdrawals.length})
        </button>
        <button
          onClick={() => setActiveSubTab('packages')}
          className={`flex-1 rounded-lg py-2 cursor-pointer font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'packages' ? 'bg-blue-600/15 text-blue-450 border border-blue-500/20' : 'text-slate-450 hover:text-white'
          }`}
        >
          Investments Review ({pendingInvestments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 rounded-lg py-1.5 cursor-pointer font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'users' ? 'bg-blue-600/15 text-blue-450 border border-blue-500/20' : 'text-slate-450 hover:text-white'
          }`}
        >
          Users Registry
        </button>
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`flex-1 rounded-lg py-1.5 cursor-pointer font-semibold transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'tickets' ? 'bg-blue-600/15 text-blue-450 border border-blue-500/20' : 'text-slate-450 hover:text-white'
          }`}
        >
          Support Tickets ({pendingTickets.length})
        </button>
      </div>

      {/* A. DEPOSITS TAB */}
      {activeSubTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <FileSearch size={16} className="text-blue-400" />
              Deposit Submissions Clearing
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{pendingDeposits.length} Pending Review</span>
          </div>

          {pendingDeposits.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-900 border border-slate-850 rounded-2xl">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-800 stroke-[1.5]" />
              <p className="text-xs font-semibold mt-2">No pending deposit approvals in queue.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">All mobile money incoming receipts are cleared.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-455 font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Receipt Code</th>
                    <th className="px-4 py-3">Sender Phone</th>
                    <th className="px-4 py-3">Submit Date</th>
                    <th className="px-4 py-3 text-right">Credit Value</th>
                    <th className="px-4 py-3 text-center">Authorization Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingDeposits.map((dep) => (
                    <tr key={dep.id} className="hover:bg-slate-900/40 font-mono text-slate-300">
                      <td className="px-4 py-3 font-semibold text-white">{dep.refNumber}</td>
                      <td className="px-4 py-3">{dep.phoneNumber}</td>
                      <td className="px-4 py-3 font-semibold text-[11px] text-slate-500">
                        {new Date(dep.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-450">+${dep.amount.toFixed(2)}</td>
                      <td className="px-4 py-clearing text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onApproveDeposit(dep.id)}
                            className="flex items-center gap-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <Check size={11} className="stroke-[3]" /> Approve
                          </button>
                          <button
                            onClick={() => onRejectDeposit(dep.id)}
                            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <X size={11} className="stroke-[3]" /> Disapprove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* B. WITHDRAWALS TAB */}
      {activeSubTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <Coins size={16} className="text-blue-400" />
              Manual Profit Withdrawal Requests
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{pendingWithdrawals.length} Pending Approval</span>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-900 border border-slate-850 rounded-2xl">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-800 stroke-[1.5]" />
              <p className="text-xs font-semibold mt-2">No pending withdrawal requests.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">All requested payout clears have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-455 font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Withdrawal ID</th>
                    <th className="px-4 py-3">Payout Phone Number</th>
                    <th className="px-4 py-3">Request Date</th>
                    <th className="px-4 py-3 text-right">Payout Value</th>
                    <th className="px-4 py-3 text-center">Authorization Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-900/40 font-mono text-slate-300">
                      <td className="px-4 py-3 font-semibold text-slate-500">WD-{w.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3 font-semibold text-white">{w.phoneNumber}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {new Date(w.requestedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-rose-450">-${w.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center animate-fade-in">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onApproveWithdrawal(w.id)}
                            className="flex items-center gap-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <Check size={11} className="stroke-[3]" /> Clear Payout (Approve)
                          </button>
                          <button
                            onClick={() => onRejectWithdrawal(w.id)}
                            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <X size={11} className="stroke-[3]" /> Decline
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* C. INVESTMENTS/PACKAGES TAB */}
      {activeSubTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <Award size={16} className="text-blue-400" />
              Investment Pools Approval (Purchase / Enlistments)
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{pendingInvestments.length} Pending Activation</span>
          </div>

          {pendingInvestments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-900 border border-slate-850 rounded-2xl">
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-800 stroke-[1.5]" />
              <p className="text-xs font-semibold mt-2">No pending investment package activations.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">All active pools are fully activated and running.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-455 font-bold text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-3">Investment ID</th>
                    <th className="px-4 py-3">User Profile</th>
                    <th className="px-4 py-3">Target Pool Package</th>
                    <th className="px-4 py-3 text-right">Seed Capital</th>
                    <th className="px-4 py-3 text-right">Potential Return</th>
                    <th className="px-4 py-3 text-center">Authorization Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pendingInvestments.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/40 font-mono text-slate-300">
                      <td className="px-4 py-3 font-semibold text-slate-500">{inv.id.slice(0, 10).toUpperCase()}</td>
                      <td className="px-4 py-3 font-semibold text-white">{inv.userId}</td>
                      <td className="px-4 py-3 text-slate-350">{inv.packageName}</td>
                      <td className="px-4 py-3 text-right font-black text-white">${inv.cost}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-450">${inv.totalExpectedProfit}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onApproveInvestment(inv.id)}
                            className="flex items-center gap-1 rounded bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <Check size={11} className="stroke-[3]" /> Approve Activation
                          </button>
                          <button
                            onClick={() => onRejectInvestment(inv.id)}
                            className="flex items-center gap-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            <X size={11} className="stroke-[3]" /> Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* D. USERS REGISTRY TAB */}
      {activeSubTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <FileSearch size={16} className="text-blue-400" />
              Registered Investor Accounts
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{users.length} Total Users</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-455 font-bold text-[10px] uppercase tracking-wider">
                  <th className="px-4 py-3">Phone Identification</th>
                  <th className="px-4 py-3">Display Name</th>
                  <th className="px-4 py-3">Role Status</th>
                  <th className="px-4 py-3 text-right">Available Balance</th>
                  <th className="px-4 py-3 text-right">Total Deposited</th>
                  <th className="px-4 py-3 text-right">Total Earned</th>
                  <th className="px-4 py-3 text-right">Total Withdrawn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono text-slate-305">
                {users.map((u) => (
                  <tr key={u.phoneNumber} className="hover:bg-slate-900/40 text-left">
                    <td className="px-4 py-3 font-bold text-white">{u.phoneNumber}</td>
                    <td className="px-4 py-3 text-slate-200 font-semibold">{u.username}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin ? (
                        <span className="rounded bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blue-400 font-bold">
                          Administrator
                        </span>
                      ) : (
                        <span className="rounded bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400 font-bold">
                          Investor
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">${u.wallet.balance.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">${u.wallet.totalDeposited.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-slate-400">${u.wallet.totalEarned.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-rose-450">-${u.wallet.totalWithdrawn.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* E. TICKETS TAB */}
      {activeSubTab === 'tickets' && (
        <SupportTicketComponent
          currentUser={currentUser}
          tickets={tickets}
          onSubmitTicket={async () => {}} // admin won't submit tickets from admin dashboard
          onCloseTicket={onCloseTicket}
          isAdmin={true}
          onRespondToTicket={onRespondToTicket}
        />
      )}

    </div>
  );
};
