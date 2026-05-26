/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'gain' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
}

export interface DriverLog {
  id: string;
  date: string;
  platform: 'Uber' | '99' | 'InDrive' | 'Outros';
  km: number;
  hours: number;
  grossEarnings: number;
  fuelCost: number;
  otherCosts: number;
  notes: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
  deadline: string;
  achieved: boolean;
}

export interface FinancialInsight {
  id: string;
  type: 'alert' | 'tip' | 'forecast' | 'summary';
  title: string;
  text: string;
  valueTrend?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'alert' | 'goal' | 'system' | 'limit';
  date: string;
  read: boolean;
}

export interface GamificationState {
  streakDays: number;
  lastActiveDate: string;
  level: number;
  points: number;
  nextLevelPoints: number;
}

export interface DebtorPayment {
  id: string;
  date: string;
  amount: number;
}

export interface Debtor {
  id: string;
  name: string;
  phone: string;
  amount: number; // remaining balance
  initialAmount: number; // original amount
  date: string;
  dueDate: string;
  notes: string;
  status: 'pendente' | 'pago' | 'atrasado';
  payments: DebtorPayment[];
}

