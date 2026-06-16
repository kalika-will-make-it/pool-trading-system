import React, { useState, useEffect } from 'react';
import { ShieldCheck, CalendarRange, Clock, TrendingUp, UserCheck, LogOut, KeyRound } from 'lucide-react';
import { PLATFORM_NAME } from '../data';
import { UserAccount } from '../types';

interface HeaderProps {
  currentUser: UserAccount | null;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSignOut
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        
        {/* App Branding logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-blue-900/40 shadow-lg">
            <TrendingUp size={22} className="stroke-[2.5]" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 id="app-title-main" className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                {PLATFORM_NAME}
              </h1>
              <span className="hidden rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-blue-400 sm:inline-block">
                Investment System
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Trading Pool & Automated Yields</p>
          </div>
        </div>

        {/* Dynamic Mock Stats from design spec */}
        <div className="hidden lg:flex items-center space-x-8 text-xs shrink-0 pl-4 border-l border-slate-800">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">DAILY PROFIT RATE</p>
            <p className="text-sm font-bold text-emerald-500 tracking-tight leading-none mt-1">
              +18.4% <span className="text-[10px] text-slate-400 font-normal">Avg.</span>
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-800"></div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">ACTIVE POOLS</p>
            <p className="text-sm font-bold text-slate-100 tracking-tight leading-none mt-1 font-mono">12,842</p>
          </div>
        </div>

        {/* Dynamic Simulated Info Display */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          
          {/* Simulated Clock panel */}
          <div className="flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-slate-300">
            <CalendarRange size={14} className="text-blue-400" />
            <span className="font-mono text-slate-150 font-medium">
              {currentTime.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="text-slate-800">|</span>
            <Clock size={14} className="text-blue-400 ml-1" />
            <span className="font-mono text-slate-150 font-medium font-semibold">
              {currentTime.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>

          {/* Active User session profile detail */}
          {currentUser && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-950 border border-slate-800 pl-3 pr-2 py-1">
              <div className="flex items-center gap-1.5 text-[11px]">
                {currentUser.isAdmin ? (
                  <div className="p-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20 flex items-center gap-1 font-sans font-black text-[9px] uppercase tracking-wider">
                    <KeyRound size={10} /> Admin Setup
                  </div>
                ) : (
                  <div className="p-1 rounded bg-slate-850 text-slate-305 flex items-center gap-1 font-sans font-bold text-[9px] uppercase tracking-wider">
                    <UserCheck size={10} /> Investor
                  </div>
                )}
                
                <span className="text-slate-500 font-sans">|</span>
                
                <div className="flex flex-col text-left">
                  <span className="font-bold text-white text-[11px] leading-tight font-sans">
                    {currentUser.username}
                  </span>
                  <span className="font-mono text-[9px] text-slate-400 hover:text-white leading-none">
                    {currentUser.phoneNumber}
                  </span>
                </div>
              </div>

              <div className="h-6 w-[1.2px] bg-slate-800/80 mx-1"></div>

              {/* Sign out key option */}
              <button
                onClick={onSignOut}
                title="Disconnect Account Session"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1.5 text-emerald-400">
            <ShieldCheck size={14} />
            <span className="font-medium font-sans">Direct Wallet Secure</span>
          </div>

        </div>

      </div>
    </header>
  );
};
