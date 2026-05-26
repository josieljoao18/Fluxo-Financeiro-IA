/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Transaction, 
  DriverLog, 
  FinancialGoal, 
  FinancialInsight, 
  AppNotification,
  GamificationState,
  Debtor,
  DebtorPayment
} from './types';

interface FinanceContextProps {
  transactions: Transaction[];
  driverLogs: DriverLog[];
  goals: FinancialGoal[];
  streakState: GamificationState;
  notifications: AppNotification[];
  aiInsight: {
    summaryText: string;
    predictionText: string;
    insights: any[];
    loading: boolean;
  };
  isLoadingAI: boolean;
  apiStatus: 'online' | 'quota_exhausted' | 'offline';
  debtors: Debtor[];
  
  // Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => Transaction;
  deleteTransaction: (id: string) => void;
  addDriverLog: (log: Omit<DriverLog, 'id'>) => DriverLog;
  deleteDriverLog: (id: string) => void;
  addGoal: (goal: Omit<FinancialGoal, 'id' | 'achieved'>) => void;
  updateGoalProgress: (id: string, amount: number) => void;
  addPoints: (points: number) => void;
  verifyStreak: () => void;
  markNotificationsAsRead: () => void;
  addNotification: (title: string, body: string, type: AppNotification['type']) => void;

  addDebtor: (debtor: Omit<Debtor, 'id' | 'payments' | 'status'>) => void;
  deleteDebtor: (id: string) => void;
  addPaymentToDebtor: (id: string, amount: number, date: string) => void;
  markDebtAsPaid: (id: string) => void;

  // AI Integration Proxies
  parseFinancialCommand: (phrase: string) => Promise<Transaction | null>;
  scanReceiptOCR: (base64Image: string, mimeType: string) => Promise<{ transaction: Transaction; items: any[] } | null>;
  recalculateInsights: () => Promise<void>;
  askAIAdvisor: (messages: { role: 'user' | 'assistant'; content: string }[]) => Promise<string>;
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined);

// Initial placeholder mock data so that the app opens populated, immersive, and ultra premium!
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', amount: 4500.00, date: '2026-05-01', description: 'Salário Clt Recorrente', category: 'salário', type: 'gain' },
  { id: 't2', amount: 350.00, date: '2026-05-18', description: 'Renda Extra Desenho UX', category: 'renda extra', type: 'gain' },
  { id: 't3', amount: 120.00, date: '2026-05-20', description: 'Mercado Pão de Açúcar', category: 'mercado', type: 'expense' },
  { id: 't4', amount: 89.90, date: '2026-05-21', description: 'Pizza Gourmet & Bebidas', category: 'alimentação', type: 'expense' },
  { id: 't5', amount: 150.00, date: '2026-05-22', description: 'Abast. Posto Ipiranga', category: 'combustível', type: 'expense' },
  { id: 't6', amount: 32.50, date: '2026-05-22', description: 'Assinatura Spotify Premium', category: 'contas', type: 'expense' },
  { id: 't7', amount: 45.00, date: '2026-05-23', description: 'Almoço Restaurante Centro', category: 'alimentação', type: 'expense' }
];

const INITIAL_DRIVER_LOGS: DriverLog[] = [
  { id: 'dr1', date: '2026-05-20', platform: 'Uber', km: 125, hours: 6.5, grossEarnings: 280.00, fuelCost: 80.00, otherCosts: 12.00, notes: 'Quarta à noite com tarifa dinâmica alta' },
  { id: 'dr2', date: '2026-05-21', platform: '99', km: 98, hours: 5.0, grossEarnings: 195.00, fuelCost: 65.00, otherCosts: 0, notes: 'Quinta chuvosa, boas taxas' },
  { id: 'dr3', date: '2026-05-22', platform: 'Uber', km: 150, hours: 8.0, grossEarnings: 340.00, fuelCost: 95.00, otherCosts: 15.00, notes: 'Sexta-feira agitada! Metas batidas.' }
];

const INITIAL_GOALS: FinancialGoal[] = [
  { id: 'g1', title: 'Reserva de Emergência', target: 10000, current: 4850, category: 'Poupança', deadline: '2026-12-31', achieved: false },
  { id: 'g2', title: 'Troca de Pneus Uber', target: 1200, current: 800, category: 'Manutenção', deadline: '2026-07-15', achieved: false },
  { id: 'g3', title: 'Viagem de Ano Novo', target: 5000, current: 1500, category: 'Lazer', deadline: '2026-12-25', achieved: false }
];

const INITIAL_GAMIFICATION: GamificationState = {
  streakDays: 7,
  lastActiveDate: '2026-05-22',
  level: 3,
  points: 420,
  nextLevelPoints: 1000
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  { id: 'n1', title: 'Meta em Progresso', body: 'Você atingiu 66% da meta "Troca de Pneus". Falta muito pouco!', type: 'goal', date: '2026-05-22T10:30:00Z', read: false },
  { id: 'n2', title: 'Cuidado extra com Lazer', body: 'Seus gastos em Alimentação cresceram esta semana. Fique atento!', type: 'limit', date: '2026-05-23T08:00:00Z', read: false }
];

const INITIAL_DEBTORS: Debtor[] = [
  {
    id: 'db1',
    name: 'Carlos Oliveira',
    phone: '11988887777',
    amount: 150.00,
    initialAmount: 250.00,
    date: '2026-05-15',
    dueDate: '2026-05-30',
    notes: 'Ajuste de conserto de parachoque Uber',
    status: 'pendente',
    payments: [
      { id: 'p1_db1', date: '2026-05-20', amount: 100.00 }
    ]
  },
  {
    id: 'db2',
    name: 'Juliana Portela',
    phone: '21977776666',
    amount: 320.00,
    initialAmount: 320.00,
    date: '2026-05-22',
    dueDate: '2026-06-05',
    notes: 'Acessório de celular para viagens de aplicativo',
    status: 'pendente',
    payments: []
  },
  {
    id: 'db3',
    name: 'Marcos Souza',
    phone: '11966665555',
    amount: 0,
    initialAmount: 180.00,
    date: '2026-05-10',
    dueDate: '2026-05-20',
    notes: 'Reserva provisória de combustível para corridas extra',
    status: 'pago',
    payments: [
      { id: 'p1_db3', date: '2026-05-18', amount: 180.00 }
    ]
  }
];

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('ff_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [driverLogs, setDriverLogs] = useState<DriverLog[]>(() => {
    const saved = localStorage.getItem('ff_driver_logs');
    return saved ? JSON.parse(saved) : INITIAL_DRIVER_LOGS;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    const saved = localStorage.getItem('ff_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [streakState, setStreakState] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('ff_gamification');
    return saved ? JSON.parse(saved) : INITIAL_GAMIFICATION;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('ff_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [debtors, setDebtors] = useState<Debtor[]>(() => {
    const saved = localStorage.getItem('ff_debtors');
    return saved ? JSON.parse(saved) : INITIAL_DEBTORS;
  });

  // State for calculated AI insights
  const [aiInsight, setAiInsight] = useState<{
    summaryText: string;
    predictionText: string;
    insights: any[];
    loading: boolean;
  }>({
    summaryText: "Carregando a sua análise de inteligência financeira personalizada...",
    predictionText: "Analisando saldo futuro...",
    insights: [],
    loading: true
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'quota_exhausted' | 'offline'>('online');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ff_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ff_driver_logs', JSON.stringify(driverLogs));
  }, [driverLogs]);

  useEffect(() => {
    localStorage.setItem('ff_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('ff_gamification', JSON.stringify(streakState));
  }, [streakState]);

  useEffect(() => {
    localStorage.setItem('ff_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ff_debtors', JSON.stringify(debtors));
  }, [debtors]);

  // Load AI Insights triggers on init or when operations change
  useEffect(() => {
    recalculateInsights();
  }, [transactions, driverLogs]);

  // Calculate Streak & gamification state
  const verifyStreak = () => {
    const todayStr = '2026-05-23';
    if (streakState.lastActiveDate === todayStr) return; // already ticked

    let newStreak = streakState.streakDays;
    const lastActive = new Date(streakState.lastActiveDate);
    const today = new Date(todayStr);
    
    const diffTime = Math.abs(today.getTime() - lastActive.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
      addNotification('Streak Diário Mantido!', `Seu streak de controle subiu para ${newStreak} dias! +15 XP`, 'system');
    } else if (diffDays > 1) {
      newStreak = 1; // broken
      addNotification('Novo Streak Iniciado!', 'Seu streak de uso diário foi reiniciado para 1 dia. Mantenha o ritmo!', 'system');
    }

    // Add logging points
    addPoints(15);
    setStreakState(prev => ({
      ...prev,
      streakDays: newStreak,
      lastActiveDate: todayStr
    }));
  };

  const addPoints = (amount: number) => {
    setStreakState(prev => {
      let newPts = prev.points + amount;
      let newLvl = prev.level;
      let nextThreshold = prev.nextLevelPoints;
      
      if (newPts >= nextThreshold) {
        newLvl += 1;
        newPts = newPts - nextThreshold;
        nextThreshold = Math.round(nextThreshold * 1.5);
        
        // Trigger push notification inside app
        setTimeout(() => {
          addNotification('Novo Nível Desbloqueado! 🏆', `Parabéns! Você alcançou o Nível ${newLvl} demonstrando excelente controle financeiro.`, 'goal');
        }, 300);
      }
      
      return {
        ...prev,
        points: newPts,
        level: newLvl,
        nextLevelPoints: nextThreshold
      };
    });
  };

  const addNotification = (title: string, body: string, type: AppNotification['type']) => {
    const newNotify: AppNotification = {
      id: 'n_' + Date.now(),
      title,
      body,
      type,
      date: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotify, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Transaction Operations
  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...t,
      id: 't_' + Math.random().toString(36).substring(2, 11)
    };
    setTransactions(prev => [newTx, ...prev]);
    addPoints(10); // +10XP for logging expenses
    verifyStreak();

    // Limit Alertas
    if (t.type === 'expense') {
      const currentCategoryExpense = transactions
        .filter(tx => tx.type === 'expense' && tx.category === t.category)
        .reduce((sum, tx) => sum + tx.amount, 0) + t.amount;

      if (currentCategoryExpense > 600 && t.category === 'alimentação') {
        addNotification('Atenção: Limite Chegando 🍕', `Seus gastos em Alimentação atingiram R$ ${currentCategoryExpense.toFixed(0)}. Limite aconselhado de R$ 800.`, 'limit');
      }
    }

    return newTx;
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Driver Log Operations
  const addDriverLog = (log: Omit<DriverLog, 'id'>) => {
    const newLog: DriverLog = {
      ...log,
      id: 'dr_' + Math.random().toString(36).substring(2, 11)
    };
    setDriverLogs(prev => [newLog, ...prev]);
    addPoints(25); // +25XP for logged shifts
    verifyStreak();

    // Check goals
    const driverShiftCount = driverLogs.length + 1;
    if (driverShiftCount === 3) {
      addNotification('Conquista: Piloto de Elite! 🏎️', 'Você registrou 3 turnos automáticos de motorista. +50 XP', 'goal');
    }

    return newLog;
  };

  const deleteDriverLog = (id: string) => {
    setDriverLogs(prev => prev.filter(l => l.id !== id));
  };

  // Debtor Operations
  const addDebtor = (d: Omit<Debtor, 'id' | 'payments' | 'status'>) => {
    const today = '2026-05-23';
    const isOverdue = d.dueDate < today;
    const newDebtor: Debtor = {
      ...d,
      id: 'db_' + Math.random().toString(36).substring(2, 11),
      status: isOverdue ? 'atrasado' : 'pendente',
      payments: []
    };
    setDebtors(prev => [newDebtor, ...prev]);
    addPoints(15);
    addNotification('Cobrança Criada 📂', `Você registrou uma cobrança de R$ ${d.amount.toFixed(2)} para ${d.name}.`, 'system');
  };

  const deleteDebtor = (id: string) => {
    setDebtors(prev => prev.filter(d => d.id !== id));
  };

  const addPaymentToDebtor = (id: string, amount: number, date: string) => {
    setDebtors(prev => prev.map(d => {
      if (d.id !== id) return d;
      
      const newAmount = Math.max(0, d.amount - amount);
      const newPayments = [
        ...d.payments,
        {
          id: 'pay_' + Math.random().toString(36).substring(2, 11),
          date,
          amount
        }
      ];
      
      const newlyPaid = newAmount === 0;
      
      if (newlyPaid) {
        addNotification('Dívida Quitada! 🎉', `${d.name} quitou a dívida total de R$ ${d.initialAmount.toFixed(2)}!`, 'goal');
        addPoints(40);
        // Add as a gain transaction automatically to balance ledger!
        addTransaction({
          amount: d.initialAmount,
          description: `Recebimento: Quitação de ${d.name}`,
          category: 'vendas',
          type: 'gain',
          date
        });
      } else {
        addNotification('Pagamento Registrado 💰', `${d.name} pagou R$ ${amount.toFixed(2)}. Restante: R$ ${newAmount.toFixed(2)}.`, 'system');
        addPoints(15);
        // Add partial payment as a gain transaction automatically to balance ledger!
        addTransaction({
          amount,
          description: `Recebimento Parcial: ${d.name}`,
          category: 'vendas',
          type: 'gain',
          date
        });
      }

      return {
        ...d,
        amount: newAmount,
        status: newlyPaid ? 'pago' : d.status,
        payments: newPayments
      };
    }));
  };

  const markDebtAsPaid = (id: string) => {
    const today = '2026-05-23';
    setDebtors(prev => prev.map(d => {
      if (d.id !== id) return d;
      if (d.amount === 0) return d;
      
      const remainingAmount = d.amount;
      const newPayments = [
        ...d.payments,
        {
          id: 'pay_' + Math.random().toString(36).substring(2, 11),
          date: today,
          amount: remainingAmount
        }
      ];

      addNotification('Dívida Quitada! 🎉', `${d.name} quitou o valor de R$ ${remainingAmount.toFixed(2)}!`, 'goal');
      addPoints(40);
      
      // Add as a gain transaction automatically to balance ledger
      addTransaction({
        amount: remainingAmount,
        description: `Recebimento: Quitação de ${d.name}`,
        category: 'vendas',
        type: 'gain',
        date: today
      });

      return {
        ...d,
        amount: 0,
        status: 'pago',
        payments: newPayments
      };
    }));
  };

  // Financial Goals Goals
  const addGoal = (g: Omit<FinancialGoal, 'id' | 'achieved'>) => {
    const newGoal: FinancialGoal = {
      ...g,
      id: 'g_' + Math.random().toString(36).substring(2, 11),
      achieved: g.current >= g.target
    };
    setGoals(prev => [newGoal, ...prev]);
    addPoints(20);
  };

  const updateGoalProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const newCurrent = g.current + amount;
      const alreadyAchieved = g.achieved;
      const newlyAchieved = newCurrent >= g.target;
      
      if (newlyAchieved && !alreadyAchieved) {
        addNotification('Meta Alcançada! 🎉', `Excelente! Você conquistou o objetivo: "${g.title}". +100 XP`, 'goal');
        addPoints(100);
      }
      
      return {
        ...g,
        current: newCurrent,
        achieved: newlyAchieved
      };
    }));
  };

  // ==========================================
  // EXPLICIT SERVER AI METHOD PROXIES
  // ==========================================

  const updateApiStatusFromData = (data: any) => {
    if (data) {
      if (data.apiQuotaExceeded) {
        setApiStatus('quota_exhausted');
      } else if (data.usingLocalFallback) {
        setApiStatus('offline');
      } else {
        setApiStatus('online');
      }
    }
  };

  // Method 1: Speech recognition response or manual text parser proxy
  const parseFinancialCommand = async (phrase: string): Promise<Transaction | null> => {
    setIsLoadingAI(true);
    try {
      const res = await fetch("/api/financial/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase })
      });
      if (!res.ok) throw new Error("Parse request failed");
      const data = await res.json();
      
      updateApiStatusFromData(data);

      if (data && data.amount > 0) {
        // Complete data mapping
        const transactionAdded = addTransaction({
          amount: data.amount,
          description: data.description || phrase,
          category: data.category || 'outros',
          type: data.type || 'expense',
          date: data.date || '2026-05-23'
        });
        return transactionAdded;
      }
      return null;
    } catch (err) {
      console.error("parseFinancialCommand failed:", err);
      return null;
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Method 2: OCR Receipt base64 scanner proxy
  const scanReceiptOCR = async (base64Image: string, mimeType: string): Promise<{ transaction: Transaction; items: any[] } | null> => {
    setIsLoadingAI(true);
    try {
      const res = await fetch("/api/financial/parse-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image, mimeType })
      });
      if (!res.ok) throw new Error("OCR Scanning request failed");
      const data = await res.json();

      updateApiStatusFromData(data);

      if (data && data.amount) {
        const txObj = addTransaction({
          amount: data.amount,
          description: data.description || "Scanner Comprovante",
          category: data.category || "mercado",
          type: "expense",
          date: data.date || "2026-05-23"
        });

        return {
          transaction: txObj,
          items: data.detectedItems || []
        };
      }
      return null;
    } catch (err) {
      console.error("scanReceiptOCR error:", err);
      return null;
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Method 3: Insights generator trigger recalculator
  const recalculateInsights = async () => {
    const netTotalGains = transactions.filter(t => t.type === 'gain').reduce((sum, s) => sum + s.amount, 0);
    const netTotalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, s) => sum + s.amount, 0);
    const currentBal = netTotalGains - netTotalExpenses;

    setAiInsight(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch("/api/financial/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactions,
          driverLogs,
          currentBalance: currentBal
        })
      });
      if (!res.ok) throw new Error("Insights failed");
      const data = await res.json();
      
      updateApiStatusFromData(data);

      setAiInsight({
        summaryText: data.summaryText,
        predictionText: data.predictionText,
        insights: data.insights || [],
        loading: false
      });
    } catch (err) {
      console.error("recalculateInsights error:", err);
      // Fallback in-case endpoint failed (local calculations already on server.ts client fallback)
      setAiInsight(prev => ({ ...prev, loading: false }));
    }
  };

  // Method 4: AI chatbot dialog manager
  const askAIAdvisor = async (messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> => {
    try {
      const netTotalGains = transactions.filter(t => t.type === 'gain').reduce((sum, s) => sum + s.amount, 0);
      const netTotalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, s) => sum + s.amount, 0);

      const res = await fetch("/api/financial/consultant-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          context: {
            currentBalance: netTotalGains - netTotalExpenses,
            totalGains: netTotalGains,
            totalExpenses: netTotalExpenses,
            transactionCount: transactions.length,
            driverLogCount: driverLogs.length,
            activeGoalsCount: goals.filter(g => !g.achieved).length,
            streak: streakState.streakDays
          }
        })
      });
      if (!res.ok) throw new Error("Advisor API failed");
      const data = await res.json();
      
      updateApiStatusFromData(data);

      return data.response || "Tive um desvio de atenção, pode repetir seu pedido?";
    } catch (err) {
      console.error("askAIAdvisor error:", err);
      return "Olá! Sou o Flowy. Estou em modo de contingência local por problemas de conexão. Posso te dizer que seu saldo atual total é positivo e você está mandando bem no streak!";
    }
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      driverLogs,
      goals,
      streakState,
      notifications,
      aiInsight,
      isLoadingAI,
      apiStatus,
      debtors,
      addTransaction,
      deleteTransaction,
      addDriverLog,
      deleteDriverLog,
      addGoal,
      updateGoalProgress,
      addPoints,
      verifyStreak,
      markNotificationsAsRead,
      addNotification,
      addDebtor,
      deleteDebtor,
      addPaymentToDebtor,
      markDebtAsPaid,
      parseFinancialCommand,
      scanReceiptOCR,
      recalculateInsights,
      askAIAdvisor
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
