import React, { useState } from 'react';
import { ShieldCheck, User, Phone, LogIn, KeyRound, ArrowRight } from 'lucide-react';
import { PLATFORM_NAME } from '../data';
import { UserAccount } from '../types';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onLoginSuccess: (user: UserAccount) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Setup form states for new Google users
  const [signUpRequired, setSignUpRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user) {
        throw new Error("No user fetched from Google authorization exchange.");
      }

      // Check if user has an active profile document in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef).catch(err => {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        throw err;
      });

      if (userSnap.exists()) {
        const profile = userSnap.data() as UserAccount;
        setSuccess(`Welcome back, ${profile.username}!`);
        setTimeout(() => {
          onLoginSuccess(profile);
        }, 1200);
      } else {
        // First login! Must configure username and phone number
        setPendingUser(user);
        setUsername(user.displayName || '');
        setSignUpRequired(true);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authorization failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    setError('');
    setSuccess('');
    const trimmedPhone = phoneNumber.trim();
    const trimmedUsername = username.trim();

    if (!trimmedPhone) {
      setError('Phone number is required for transaction routing');
      return;
    }
    if (!trimmedUsername) {
      setError('Username display identifier is required');
      return;
    }

    setLoading(true);

    try {
      // Determine if they are the bootstrapped admin
      const isEmailAdmin = pendingUser.email === 'ritamakaps@gmail.com';

      const newUser: UserAccount = {
        phoneNumber: trimmedPhone,
        username: trimmedUsername,
        passwordHash: 'firebase_auth', // Placeholder password field for model compliance
        email: pendingUser.email || '',
        isAdmin: isEmailAdmin,
        wallet: {
          balance: 0.00, // Balance starts empty to prevent fraud, user deposits real funds
          totalDeposited: 0.00,
          totalEarned: 0.00,
          totalWithdrawn: 0.00,
          phoneNumber: trimmedPhone
        },
        createdAt: new Date().toISOString()
      };

      // Store in users collection using UID
      const userDocRef = doc(db, 'users', pendingUser.uid);
      await setDoc(userDocRef, newUser).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `users/${pendingUser.uid}`);
        throw err;
      });

      setSuccess(`Account registered successfully!`);
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize profile document.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8">
      <div 
        id="auth-card" 
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl shadow-blue-950/15 animate-fade-in"
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 px-6 pt-8 pb-4 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-900/40">
            <ShieldCheck size={26} className="stroke-[2.5]" />
          </div>
          <h2 className="font-display text-2xl font-black tracking-tight text-white">
            {PLATFORM_NAME}
          </h2>
          <p className="mt-1 text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Trading Pool Network
          </p>
        </div>

        {/* Content Portal */}
        <div className="p-6">
          {!signUpRequired ? (
            /* PHASE 1: Sign-in with Google */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
                  <LogIn size={18} className="text-blue-500" />
                  Access Security Gateway
                </h3>
                <p className="text-xs text-slate-404 mt-2 leading-relaxed">
                  Sign in securely with your Google account to access yield farming registries, view balances, and command seed capital pools.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-500">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 font-bold">
                  ✓ {success}
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800 py-4 text-xs font-bold text-white transition-all cursor-pointer shadow-lg hover:scale-[1.01]"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.281 1.022 15.54 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.18-1.925H12.24z"
                  />
                </svg>
                <span>{loading ? 'Authorizing Session...' : 'Sign In with Google'}</span>
              </button>

              <div className="rounded-xl bg-slate-950 border border-slate-850 p-4 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Clearance Rules</span>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Sign-ins are protected under strict cloud security rules. Administrative roles are assigned automatically based on authorized clearance protocols.
                </p>
              </div>
            </div>
          ) : (
            /* PHASE 2: Register details phone and username */
            <form onSubmit={handleSetupSubmit} className="space-y-5 animate-fade-in">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <User size={18} className="text-blue-500" />
                  Additional Security Verification
                </h3>
                <p className="text-xs text-slate-404 mt-1">
                  Complete your investor credential configuration before entering the dashboard.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-500">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-400 font-bold animate-pulse">
                  ✓ {success}
                </div>
              )}

              {/* Display Name Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                  Username display name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <User size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Jane Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
                  Payout Phone Number (Essential)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                    <Phone size={14} />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="E.g. +254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs font-semibold font-mono text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[10.5px] text-slate-500 italic leading-snug">
                  * Must be capable of receiving official payout clearances across local channels.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white hover:bg-blue-500 transition-all cursor-pointer shadow-lg shadow-blue-500/10 hover:scale-[1.01]"
              >
                <span>{loading ? 'Deploying profile...' : 'Complete Registration Setup'}</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
