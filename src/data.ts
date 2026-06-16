import { InvestmentPackage } from './types';

export const INVESTMENT_PACKAGES: InvestmentPackage[] = [
  {
    id: 'bronze-10',
    name: 'Bronze Starter Pool',
    price: 10,
    totalReturn: 45,
    durationDays: 7,
    dailyYield: 45 / 7,
    tier: 'bronze',
    badgeColor: 'bg-amber-600 text-amber-50 border-amber-500/20',
    textColor: 'text-amber-500',
    bgColor: 'from-amber-950/40 to-[#0e1610]'
  },
  {
    id: 'silver-20',
    name: 'Silver Growth Pool',
    price: 20,
    totalReturn: 80,
    durationDays: 7,
    dailyYield: 80 / 7,
    tier: 'silver',
    badgeColor: 'bg-slate-400 text-slate-950 border-slate-300/20',
    textColor: 'text-slate-300',
    bgColor: 'from-slate-900/40 to-[#0e1610]'
  },
  {
    id: 'gold-50',
    name: 'Gold Accelerator Pool',
    price: 50,
    totalReturn: 250,
    durationDays: 3,
    dailyYield: 250 / 3,
    tier: 'gold',
    badgeColor: 'bg-yellow-500 text-yellow-950 border-yellow-400/20',
    textColor: 'text-yellow-400',
    bgColor: 'from-yellow-950/40 to-[#0e1610]'
  },
  {
    id: 'platinum-100',
    name: 'Platinum Elite Yield',
    price: 100,
    totalReturn: 800,
    durationDays: 3,
    dailyYield: 800 / 3,
    tier: 'platinum',
    badgeColor: 'bg-indigo-500 text-indigo-50 border-indigo-400/20',
    textColor: 'text-indigo-400',
    bgColor: 'from-indigo-950/40 to-[#0e1610]'
  },
  {
    id: 'diamond-300',
    name: 'Diamond Premium Pool',
    price: 300,
    totalReturn: 1500,
    durationDays: 7,
    dailyYield: 1500 / 7,
    tier: 'diamond',
    badgeColor: 'bg-cyan-400 text-cyan-950 border-cyan-400/20',
    textColor: 'text-cyan-400',
    bgColor: 'from-cyan-950/40 to-[#0e1610]'
  },
  {
    id: 'vip-500',
    name: 'VIP Super-Speed Pool',
    price: 500,
    totalReturn: 2000,
    durationDays: 1, // 24 hours
    dailyYield: 2000,
    tier: 'vip',
    badgeColor: 'bg-rose-500 text-rose-50 border-rose-400/20',
    textColor: 'text-rose-400',
    bgColor: 'from-rose-950/40 to-[#0e1610]'
  }
];

export const PAYMENT_PHONE_NUMBER = '0797166504';
export const PLATFORM_NAME = 'TZX Traders';
