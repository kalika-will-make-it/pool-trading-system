import React from 'react';
import { INVESTMENT_PACKAGES } from '../data';
import { InvestmentPackage } from '../types';
import { Star, ShieldCheck, Flame, Cpu, Gem, Award, ArrowUpRight } from 'lucide-react';

interface PackagesListProps {
  onSelectPackage: (pkg: InvestmentPackage) => void;
  userBalance: number;
}

export const PackagesList: React.FC<PackagesListProps> = ({ onSelectPackage, userBalance }) => {
  
  // Icon mapper depending on package tiers
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return <Award className="text-amber-500 h-5 w-5" />;
      case 'silver':
        return <Cpu className="text-slate-300 h-5 w-5" />;
      case 'gold':
        return <Flame className="text-yellow-400 h-5 w-5 animate-pulse" />;
      case 'platinum':
        return <Star className="text-indigo-400 h-5 w-5" />;
      case 'diamond':
        return <Gem className="text-cyan-400 h-5 w-5" />;
      case 'vip':
        return <Flame className="text-rose-400 h-6 w-6 animate-bounce" />;
      default:
        return <Award className="text-zinc-400 h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Investment Pools ({INVESTMENT_PACKAGES.length})
          </h2>
          <p className="text-sm text-zinc-400">
            Select a trading pool package below. The minimum entry is 10 USD.
          </p>
        </div>
        
        <div className="flex items-center gap-1.5 self-start text-xs rounded bg-zinc-900 border border-zinc-800 px-3 py-1 text-zinc-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Automated Daily profit withdrawal enabled</span>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {INVESTMENT_PACKAGES.map((pkg) => {
          const multiple = (pkg.totalReturn / pkg.price).toFixed(1);
          const hasBalance = userBalance >= pkg.price;
          
          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-950/20`}
            >
              {/* Highlight Tag for VIP, Diamond or Gold */}
              {(pkg.tier === 'vip' || pkg.tier === 'gold') && (
                <div className="absolute top-0 right-0">
                  <span className="inline-flex items-center gap-1 rounded-bl-xl rounded-tr-xl bg-blue-600 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-white">
                    High demand
                  </span>
                </div>
              )}

              {/* Card Header & Tier Badge */}
              <div>
                <div className="flex items-center justify-between">
                  <div className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide ${pkg.badgeColor} flex items-center gap-1`}>
                    {getTierIcon(pkg.tier)}
                    <span className="capitalize">{pkg.tier} package</span>
                  </div>
                  
                  <div className="font-display text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {multiple}x total
                  </div>
                </div>

                <h3 className="mt-4 font-display text-lg font-bold text-white tracking-tight">
                  {pkg.name}
                </h3>
                
                {/* Seed Price details */}
                <div className="mt-4 flex items-baseline gap-1.5 border-b border-slate-800 pb-4">
                  <span className="text-3xl font-black text-white font-mono">
                    ${pkg.price}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">USD Seed</span>
                </div>

                {/* Pool specific ROI breakdown */}
                <div className="mt-5 space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Expected Total Return:</span>
                    <span className="font-mono text-emerald-400 font-bold text-base">
                      ${pkg.totalReturn} USD
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium font-sans">Pool Maturity Lock:</span>
                    <span className="font-mono text-slate-200 font-semibold flex items-center gap-1">
                      {pkg.durationDays} {pkg.durationDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Automatic Daily Yield:</span>
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.2 rounded">
                      ${pkg.dailyYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/day
                    </span>
                  </div>
                </div>
              </div>

              {/* Invest Button Section */}
              <div className="mt-6 pt-4">
                <button
                  onClick={() => onSelectPackage(pkg)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-sans text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                    hasBalance
                      ? 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-[1.01]'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span>Invest ${pkg.price} USD</span>
                  <ArrowUpRight size={14} className="stroke-[2.5]" />
                </button>
                
                <p className="mt-2 text-center text-[10px] text-slate-500 font-medium">
                  {hasBalance 
                    ? '⚡ Fast Activation via virtual wallet' 
                    : `⚠️ Balance insufficient. Prompts payment details upon click.`}
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
