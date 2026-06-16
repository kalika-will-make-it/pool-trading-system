import React, { useState, useEffect, useRef } from 'react';
import { InvestmentPackage, UserWallet, UserAccount, Investment, Deposit, Withdrawal } from './types';
import { INVESTMENT_PACKAGES, PAYMENT_PHONE_NUMBER, PLATFORM_NAME } from './data';
import { Header } from './components/Header';
import { WalletStats } from './components/WalletStats';
import { PackagesList } from './components/PackagesList';
import { InvestmentModal } from './components/InvestmentModal';
import { WithdrawalModal } from './components/WithdrawalModal';
import { TransactionHistory } from './components/TransactionHistory';
import { Auth } from './components/Auth';
import { AdminPanel } from './components/AdminPanel';
import { BookOpen, Smartphone, Award, Shield } from 'lucide-react';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  getDoc 
} from 'firebase/firestore';

export default function App() {
  // Sync core state arrays reactively from Firestore
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Modal visual controls
  const [selectedPkg, setSelectedPkg] = useState<InvestmentPackage | null>(null);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [quickNotification, setQuickNotification] = useState<string | null>(null);

  // Trigger brief alert notifications
  const showNotification = (msg: string) => {
    setQuickNotification(msg);
    setTimeout(() => {
      setQuickNotification(null);
    }, 4500);
  };

  // --- Real-Time Auth State and Firestore Sync Registries ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setCurrentUserId(authUser.uid);

        // 1. Subscribe to User details in real-time for live wallet balance updates
        const userRef = doc(db, 'users', authUser.uid);
        const unsubUser = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setCurrentUser(snap.data() as UserAccount);
          }
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`);
        });

        // Resolve admin status to subscribe to collections appropriately
        const isEmailAdmin = authUser.email === 'ritamakaps@gmail.com';
        const userSnap = await getDoc(userRef).catch(() => null);
        const isDbAdmin = userSnap?.exists() ? userSnap.data()?.isAdmin === true : false;
        const isAdminSession = isEmailAdmin || isDbAdmin;

        let unsubUsers = () => {};
        let unsubInvestments = () => {};
        let unsubDeposits = () => {};
        let unsubWithdrawals = () => {};

        if (isAdminSession) {
          // ADMIN CLEARANCE PORTAL: Listen globally to all data streams
          unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
            const list: UserAccount[] = [];
            snap.forEach(d => list.push(d.data() as UserAccount));
            setRegisteredUsers(list);
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'users');
          });

          unsubInvestments = onSnapshot(collection(db, 'investments'), (snap) => {
            const list: Investment[] = [];
            snap.forEach(d => list.push(d.data() as Investment));
            setInvestments(list);
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'investments');
          });

          unsubDeposits = onSnapshot(collection(db, 'deposits'), (snap) => {
            const list: Deposit[] = [];
            snap.forEach(d => list.push(d.data() as Deposit));
            setDeposits(list);
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'deposits');
          });

          unsubWithdrawals = onSnapshot(collection(db, 'withdrawals'), (snap) => {
            const list: Withdrawal[] = [];
            snap.forEach(d => list.push(d.data() as Withdrawal));
            setWithdrawals(list);
          }, (err) => {
            handleFirestoreError(err, OperationType.LIST, 'withdrawals');
          });

        } else {
          // INVESTOR PORTAL: Filter security reads under user's own credentials
          unsubInvestments = onSnapshot(
            query(collection(db, 'investments'), where('userId', '==', authUser.uid)),
            (snap) => {
              const list: Investment[] = [];
              snap.forEach(d => list.push(d.data() as Investment));
              setInvestments(list);
            },
            (err) => {
              handleFirestoreError(err, OperationType.LIST, 'investments');
            }
          );

          unsubDeposits = onSnapshot(
            query(collection(db, 'deposits'), where('userId', '==', authUser.uid)),
            (snap) => {
              const list: Deposit[] = [];
              snap.forEach(d => list.push(d.data() as Deposit));
              setDeposits(list);
            },
            (err) => {
              handleFirestoreError(err, OperationType.LIST, 'deposits');
            }
          );

          unsubWithdrawals = onSnapshot(
            query(collection(db, 'withdrawals'), where('userId', '==', authUser.uid)),
            (snap) => {
              const list: Withdrawal[] = [];
              snap.forEach(d => list.push(d.data() as Withdrawal));
              setWithdrawals(list);
            },
            (err) => {
              handleFirestoreError(err, OperationType.LIST, 'withdrawals');
            }
          );

          setRegisteredUsers([]);
        }

        return () => {
          unsubUser();
          unsubUsers();
          unsubInvestments();
          unsubDeposits();
          unsubWithdrawals();
        };

      } else {
        // Safe clear state boundaries on session teardowns
        setCurrentUserId(null);
        setCurrentUser(null);
        setRegisteredUsers([]);
        setInvestments([]);
        setDeposits([]);
        setWithdrawals([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- Real-time Yield Accrual Logic (30 seconds of real elapsed time = 1 Day of yield) ---
  const investmentsRef = useRef<Investment[]>([]);
  useEffect(() => {
    investmentsRef.current = investments;
  }, [investments]);

  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const DAY_CYCLE_MS = 30000; // 30 seconds = 1 Day cycle

      investmentsRef.current.forEach(async (inv) => {
        // Only run automatic accrual calculations for active pools owned by the client
        if (inv.status !== 'active' || inv.userId !== currentUserId) return;

        const creationTime = new Date(inv.createdAt).getTime();
        const diffMs = now - creationTime;
        const totalCyclesEarnedNum = Math.min(inv.durationDays, Math.floor(diffMs / DAY_CYCLE_MS));
        const cyclesToPay = totalCyclesEarnedNum - inv.payoutsClaimed;

        if (cyclesToPay > 0) {
          const payoutSum = cyclesToPay * inv.dailyPayout;
          const newClaimCount = inv.payoutsClaimed + cyclesToPay;
          const isComplete = newClaimCount >= inv.durationDays;

          try {
            await updateDoc(doc(db, 'investments', inv.id), {
              payoutsClaimed: newClaimCount,
              accruedAmount: inv.accruedAmount + payoutSum,
              lastPayoutAt: new Date().toISOString(),
              status: isComplete ? 'completed' : 'active'
            });
          } catch (err) {
            console.error("Accrual write cycle suspended:", err);
          }
        }
      });
    }, 4000); // Process query loop evaluation every 4 seconds

    return () => clearInterval(interval);
  }, [currentUserId]);

  // Auth logout callbacks
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('🔒 Session terminated safely. Secure checkout logged.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    showNotification(`⚡ Welcome back, ${user.username}! Access keys synchronized.`);
  };

  // --- INVESTOR ACTIONS ---

  // 1. Direct subscription on packages
  const handleConfirmDirectInvest = async (pkg: InvestmentPackage) => {
    if (!currentUser || !currentUserId) return;

    if (currentUser.wallet.balance < pkg.price) {
      showNotification('❌ Transaction unsuccessful. Available balance is insufficient.');
      return;
    }

    try {
      // Deduct balance from user profile document
      await updateDoc(doc(db, 'users', currentUserId), {
        'wallet.balance': currentUser.wallet.balance - pkg.price
      });

      // Track pool entry
      const newInvId = `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newInvest: Investment = {
        id: newInvId,
        userId: currentUserId,
        packageId: pkg.id,
        packageName: pkg.name,
        cost: pkg.price,
        totalExpectedProfit: pkg.totalReturn,
        durationDays: pkg.durationDays,
        dailyPayout: pkg.dailyYield,
        createdAt: new Date().toISOString(),
        lastPayoutAt: new Date().toISOString(),
        payoutsClaimed: 0,
        accruedAmount: 0,
        status: 'pending_approval'
      };

      await setDoc(doc(db, 'investments', newInvId), newInvest);
      showNotification(`⏳ Subscribed: ${pkg.name}. Placed in pending clearance queue for Admin approval!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentUserId}`);
    }
  };

  // 2. Submit payment manual references
  const handleSubmitPendingDeposit = async (amount: number, refCode: string) => {
    if (!currentUser || !currentUserId) return;

    const depId = `dep-${Date.now()}`;
    const newDepositEntry: Deposit = {
      id: depId,
      userId: currentUserId,
      amount,
      refNumber: refCode,
      phoneNumber: currentUser.phoneNumber,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'deposits', depId), newDepositEntry);
      showNotification(`⏳ Reference code ${refCode} compiled. Awaiting Admin clearance.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `deposits/${depId}`);
    }
  };

  // 3. Initiate withdrawals
  const handleConfirmWithdrawal = async (amount: number, withdrawPhone: string) => {
    if (!currentUser || !currentUserId) return;

    if (currentUser.wallet.balance < amount) {
      showNotification('❌ Withdrawal failed: available balance is insufficient.');
      return;
    }

    const wdrId = `wdr-${Date.now()}`;
    try {
      // Reserve balance to block double spend
      await updateDoc(doc(db, 'users', currentUserId), {
        'wallet.balance': currentUser.wallet.balance - amount
      });

      const newWithdraw: Withdrawal = {
        id: wdrId,
        userId: currentUserId,
        amount,
        phoneNumber: withdrawPhone,
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      await setDoc(doc(db, 'withdrawals', wdrId), newWithdraw);
      showNotification(`💸 Withdrawal of $${amount.toFixed(2)} USD submitted! Pending administrator verification.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `withdrawals/${wdrId}`);
    }
  };

  // 4. Claim authorized payouts
  const handleClaimWithdrawal = async (withdrawalId: string) => {
    const w = withdrawals.find(w => w.id === withdrawalId);
    if (!w || !currentUserId || !currentUser || w.status !== 'approved') return;

    try {
      await updateDoc(doc(db, 'users', currentUserId), {
        'wallet.totalWithdrawn': currentUser.wallet.totalWithdrawn + w.amount
      });

      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'completed'
      });

      showNotification(`💸 Payout claimed! Mobile payment of $${w.amount.toFixed(2)} USD dispatched to ${w.phoneNumber}!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `withdrawals/${withdrawalId}`);
    }
  };

  // 5. Claim earned investment pool yields
  const handleClaimYield = async (investmentId: string) => {
    const inv = investments.find(i => i.id === investmentId);
    if (!inv || inv.accruedAmount <= 0 || !currentUserId || !currentUser) return;
    const claimAmount = inv.accruedAmount;

    try {
      await updateDoc(doc(db, 'users', currentUserId), {
        'wallet.balance': currentUser.wallet.balance + claimAmount,
        'wallet.totalEarned': currentUser.wallet.totalEarned + claimAmount
      });

      await updateDoc(doc(db, 'investments', investmentId), {
        accruedAmount: 0
      });

      showNotification(`🎉 Claimed $${claimAmount.toFixed(2)} USD yield directly into available balance!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `investments/${investmentId}`);
    }
  };

  // --- ADMINISTRATOR OPTIONS ---

  // 1. Approve manual receipts top up
  const handleApproveDeposit = async (depositId: string) => {
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status !== 'pending') return;

    try {
      const investorRef = doc(db, 'users', dep.userId);
      const investorSnap = await getDoc(investorRef);

      if (investorSnap.exists()) {
        const invData = investorSnap.data() as UserAccount;
        await updateDoc(investorRef, {
          'wallet.balance': invData.wallet.balance + dep.amount,
          'wallet.totalDeposited': invData.wallet.totalDeposited + dep.amount
        });
      }

      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'approved'
      });

      showNotification(`✅ Authorized deposit of $${dep.amount} USD! User wallet credited.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `deposits/${depositId}`);
    }
  };

  // 2. Reject manual receipts top up
  const handleRejectDeposit = async (depositId: string) => {
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status !== 'pending') return;

    try {
      await updateDoc(doc(db, 'deposits', depositId), {
        status: 'rejected'
      });
      showNotification(`❌ Disapproved reference ${dep.refNumber}. Reject status confirmed.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `deposits/${depositId}`);
    }
  };

  // 3. Approve withdrawals dispatch
  const handleApproveWithdrawal = async (withdrawalId: string) => {
    const w = withdrawals.find(w => w.id === withdrawalId);
    if (!w || w.status !== 'pending') return;

    try {
      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'approved'
      });
      showNotification(`✅ Cleared withdrawal of $${w.amount} USD! User can claim funds.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `withdrawals/${withdrawalId}`);
    }
  };

  // 4. Reject and refund withdrawals
  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const w = withdrawals.find(w => w.id === withdrawalId);
    if (!w || w.status !== 'pending') return;

    try {
      const investorRef = doc(db, 'users', w.userId);
      const investorSnap = await getDoc(investorRef);

      if (investorSnap.exists()) {
        const invData = investorSnap.data() as UserAccount;
        await updateDoc(investorRef, {
          'wallet.balance': invData.wallet.balance + w.amount
        });
      }

      await updateDoc(doc(db, 'withdrawals', withdrawalId), {
        status: 'rejected'
      });

      showNotification(`❌ Disapproved cash request. Refunded $${w.amount} USD back to user balance.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `withdrawals/${withdrawalId}`);
    }
  };

  // 5. Activate pending pool submissions
  const handleApproveInvestment = async (investmentId: string) => {
    const inv = investments.find(i => i.id === investmentId);
    if (!inv || inv.status !== 'pending_approval') return;

    try {
      await updateDoc(doc(db, 'investments', investmentId), {
        status: 'active'
      });
      showNotification(`🚀 Authorized investment activation for pool ID ${investmentId.slice(0, 8)}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `investments/${investmentId}`);
    }
  };

  // 6. Reject pending pool and refund capital
  const handleRejectInvestment = async (investmentId: string) => {
    const inv = investments.find(i => i.id === investmentId);
    if (!inv || inv.status !== 'pending_approval') return;

    try {
      const investorRef = doc(db, 'users', inv.userId);
      const investorSnap = await getDoc(investorRef);

      if (investorSnap.exists()) {
        const invData = investorSnap.data() as UserAccount;
        await updateDoc(investorRef, {
          'wallet.balance': invData.wallet.balance + inv.cost
        });
      }

      await updateDoc(doc(db, 'investments', investmentId), {
        status: 'rejected'
      });

      showNotification(`❌ Denied activation. Seed capital of $${inv.cost} USD has been refunded.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `investments/${investmentId}`);
    }
  };

  // Filter investor-specific list rows locally for UI displays
  const myInvestments = currentUser 
    ? investments.filter(inv => inv.userId === currentUserId)
    : [];

  const myDeposits = currentUser 
    ? deposits.filter(dep => dep.userId === currentUserId)
    : [];

  const myWithdrawals = currentUser 
    ? withdrawals.filter(w => w.userId === currentUserId)
    : [];

  const activePoolSum = myInvestments
    .filter(inv => inv.status === 'active')
    .reduce((current, inv) => current + inv.cost, 0);

  const pendingDepositsCount = myDeposits.filter((dep) => dep.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#060806] font-sans text-zinc-100 pb-12">
      
      {/* Platform Header */}
      <Header
        currentUser={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Floating Alert Notifications */}
      {quickNotification && (
        <div id="quick-alert" className="fixed top-20 right-4 z-50 max-w-sm rounded-xl border border-blue-500/20 bg-slate-950 px-4 py-3 text-xs text-blue-400 font-bold shadow-2xl animate-bounce">
          {quickNotification}
        </div>
      )}

      {/* RENDER PORTALS */}
      {!currentUser ? (
        /* PATH A: Authentication Required */
        <main className="mx-auto max-w-7xl px-4 py-12 flex flex-col justify-center items-center">
          <Auth onLoginSuccess={handleLoginSuccess} />
        </main>
      ) : currentUser.isAdmin ? (
        /* PATH B: Admin Portal Dashboard */
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-8 animate-fade-in">
          <div className="flex items-center gap-2 bg-blue-950/20 border border-blue-500/10 p-4 rounded-xl">
            <Shield size={18} className="text-blue-400" />
            <span className="text-xs font-semibold text-slate-300 font-sans">
              System Console — Logged in as <strong className="text-blue-450 uppercase font-bold">{currentUser.username}</strong> with Admin clearance
            </span>
          </div>

          <AdminPanel
            deposits={deposits}
            withdrawals={withdrawals}
            investments={investments}
            users={registeredUsers}
            onApproveDeposit={handleApproveDeposit}
            onRejectDeposit={handleRejectDeposit}
            onApproveWithdrawal={handleApproveWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            onApproveInvestment={handleApproveInvestment}
            onRejectInvestment={handleRejectInvestment}
          />

          <footer className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 font-sans">
            <p>© 2026 {PLATFORM_NAME} Investment System. Authorized Operations Hub.</p>
          </footer>
        </main>
      ) : (
        /* PATH C: Investor Portal Dashboard */
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-8 animate-fade-in">
          
          {/* Receipt Phone Banner */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/20 to-indigo-950/10 p-5 border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <Smartphone size={24} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-base text-white font-sans">
                  Official Receipt Channel: <span className="text-blue-400 font-mono select-all font-black">{PAYMENT_PHONE_NUMBER}</span>
                </h3>
                <p className="text-xs text-slate-404 leading-relaxed max-w-2xl font-sans">
                  Ready to activate trading pool seeds? Submit payments directly to <span className="text-blue-450 font-bold">{PAYMENT_PHONE_NUMBER}</span>, click "Invest" on any package below, submit reference and enjoy daily profit accrual automatically. Minimum entry starts at 10 USD!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-stretch justify-center md:self-auto shrink-0 bg-blue-500/10 px-3 py-1.5 rounded-xl text-blue-450 text-xs font-bold border border-blue-500/25">
              <Award size={15} />
              <span>Daily Profit Withdrawals Enabled</span>
            </div>
          </section>

          {/* Stateful Wallet Indicators */}
          <WalletStats
            wallet={currentUser.wallet}
            activeInvestmentsTotal={activePoolSum}
            onOpenDeposit={() => {
              setSelectedPkg(INVESTMENT_PACKAGES[0]);
              setIsInvestModalOpen(true);
            }}
            onOpenWithdrawal={() => setIsWithdrawModalOpen(true)}
            pendingDepositsCount={pendingDepositsCount}
          />

          {/* Structured Packages List with returns */}
          <PackagesList
            onSelectPackage={(pkg) => {
              setSelectedPkg(pkg);
              setIsInvestModalOpen(true);
            }}
            userBalance={currentUser.wallet.balance}
          />

          {/* User-filtered Activity History Registers */}
          <TransactionHistory
            investments={myInvestments}
            deposits={myDeposits}
            withdrawals={myWithdrawals}
            onApproveDeposit={handleApproveDeposit}
            onRejectDeposit={handleRejectDeposit}
            onClaimWithdrawal={handleClaimWithdrawal}
            onClaimYield={handleClaimYield}
          />

          {/* Information Guide panel */}
          <section className="rounded-2xl bg-slate-900/40 border border-slate-800 p-5 sm:p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2 font-sans">
              <BookOpen size={18} className="text-blue-400" />
              Yield Pool Clearance & Documentation Guidelines
            </h3>

            <div className="grid gap-4 md:grid-cols-2 text-xs leading-relaxed text-slate-400">
              <div className="space-y-2 border-r border-slate-800/45 pr-4">
                <span className="font-semibold text-slate-300 block">💸 Clearance Cycle Payouts</span>
                <p>
                  Each registered active pool performs automated trading operations. Profits are automatically paid to your active pool yield registry. Yield cascades and accrues incrementally in real-time, matching standard trading intervals.
                </p>
                <p>
                  Once accrued, click <span className="text-blue-400 font-bold">"Claim Yield"</span> in the registry to move earnings into your account balance, then request instant withdrawals straight to your specified payment channel.
                </p>
              </div>

              <div className="space-y-2 font-sans">
                <span className="font-semibold text-slate-300 block">💎 Premium Package Breakdown</span>
                <ul className="space-y-1 list-disc pl-4 text-slate-400">
                  <li><strong className="text-slate-200">Bronze Starter ($10)</strong>: Earns $45 returns within 7 Days</li>
                  <li><strong className="text-slate-200">Silver Growth ($20)</strong>: Earns $80 returns within 7 Days</li>
                  <li><strong className="text-slate-200">Gold Accelerator ($50)</strong>: Earns $250 returns within 3 Days</li>
                  <li><strong className="text-slate-200">Platinum Elite ($100)</strong>: Earns $800 returns within 3 Days</li>
                  <li><strong className="text-slate-200">Diamond Premium ($300)</strong>: Earns $1500 returns within 7 Days</li>
                  <li><strong className="text-slate-200">VIP Super-Speed ($500)</strong>: Earns $2000 returns within 24 Hours!</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Plain Footer with copyright details */}
          <footer className="border-t border-slate-900 pt-8 text-center text-xs text-slate-600 font-sans">
            <p>© 2026 {PLATFORM_NAME} Investment System. All rights reserved.</p>
            <p className="mt-1">Trading involves risk. Always ensure you are trading responsibly in real scenarios.</p>
          </footer>

          {/* INVESTMENT MODAL */}
          {selectedPkg && (
            <InvestmentModal
              pkg={selectedPkg}
              userBalance={currentUser.wallet.balance}
              isOpen={isInvestModalOpen}
              onClose={() => {
                setIsInvestModalOpen(false);
                setSelectedPkg(null);
              }}
              onConfirmDirectInvest={handleConfirmDirectInvest}
              onSubmitPendingDeposit={handleSubmitPendingDeposit}
            />
          )}

          {/* WITHDRAWAL MODAL */}
          {isWithdrawModalOpen && (
            <WithdrawalModal
              userBalance={currentUser.wallet.balance}
              isOpen={isWithdrawModalOpen}
              onClose={() => setIsWithdrawModalOpen(false)}
              onConfirmWithdrawal={handleConfirmWithdrawal}
            />
          )}
        </main>
      )}
    </div>
  );
}
