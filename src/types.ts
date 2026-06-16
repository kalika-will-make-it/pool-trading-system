export interface InvestmentPackage {
  id: string;
  name: string;
  price: number;
  totalReturn: number;
  durationDays: number;
  dailyYield: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'vip';
  badgeColor: string;
  textColor: string;
  bgColor: string;
}

export interface UserWallet {
  balance: number;
  totalDeposited: number;
  totalEarned: number;
  totalWithdrawn: number;
  phoneNumber: string;
}

export interface UserAccount {
  phoneNumber: string;
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  wallet: UserWallet;
  createdAt: string;
}

export interface Investment {
  id: string;
  userId: string; // mapped to phoneNumber
  packageId: string;
  packageName: string;
  cost: number;
  totalExpectedProfit: number;
  durationDays: number;
  dailyPayout: number;
  createdAt: string;
  lastPayoutAt: string;
  payoutsClaimed: number;
  accruedAmount: number;
  status: 'pending_approval' | 'active' | 'completed' | 'rejected';
}

export interface Deposit {
  id: string;
  userId: string; // mapped to phoneNumber
  amount: number;
  refNumber: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string; // mapped to phoneNumber
  amount: number;
  phoneNumber: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
}

