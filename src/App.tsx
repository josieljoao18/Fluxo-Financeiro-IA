/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './FinanceContext';
import { DashboardView } from './components/DashboardView';
import { QuickInputView } from './components/QuickInputView';
import { DriverFlowView } from './components/DriverFlowView';
import { HistoryView } from './components/HistoryView';
import { GoalsView } from './components/GoalsView';
import { ConsultantTab } from './components/ConsultantTab';
import { MeDevemView } from './components/MeDevemView';
import { 
  LayoutDashboard, 
  Mic, 
  Car, 
  History, 
  Trophy, 
  Sparkles, 
  Bell, 
  Clock, 
  Menu, 
  X,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  HandCoins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'voice' | 'driver' | 'history' | 'goals' | 'advisor' | 'debtors'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  
  const { notifications, markNotificationsAsRead, apiStatus } = useFinance();
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabsConfig = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardView },
    { id: 'voice', label: 'Entrada IA', icon: Mic, component: QuickInputView },
    { id: 'driver', label: 'Driver Flow', icon: Car, component: DriverFlowView },
    { id: 'debtors', label: 'Me Devem', icon: HandCoins, component: MeDevemView },
    { id: 'history', label: 'Extrato', icon: History, component: HistoryView },
    { id: 'goals', label: 'Metas', icon: Trophy, component: GoalsView },
    { id: 'advisor', label: 'Consultoria IA', icon: Sparkles, component: ConsultantTab },
  ];

  const ActiveComponent = tabsConfig.find(t => t.id === activeTab)?.component || DashboardView;

  const handleOpenNotifications = () => {
    setIsNotificationPanelOpen(!isNotificationPanelOpen);
    if (!isNotificationPanelOpen) {
      markNotificationsAsRead();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" id="main-applet-root">
      
      {/* 🚀 Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-emerald-500 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/10 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="font-display font-black text-lg tracking-tight text-white block">Finance Flow</span>
              <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase leading-none block">AI-AUTOMATED • 2026</span>
            </div>
          </div>

          {/* Desktop Nav Tabs Links */}
          <nav className="hidden lg:flex items-center bg-slate-900/60 p-1.5 rounded-xl border border-slate-900 gap-1 text-xs">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${isSelected ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Widgets Center: notifications & clocks */}
          <div className="flex items-center gap-3">
            {/* UTC clock widget */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-850 p-2 px-3 rounded-lg text-2xs font-mono text-slate-400">
              <Clock size={12} className="text-slate-500" />
              <span>23 MAI • 13:55</span>
            </div>

            {/* Notification bell widget */}
            <div className="relative">
              <button 
                onClick={handleOpenNotifications}
                className="p-2 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-xl text-slate-350 transition relative focus:outline-none"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                )}
              </button>

              {/* Notification Popup dropdown */}
              <AnimatePresence>
                {isNotificationPanelOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2.5 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-805 pb-2">
                      <h4 className="text-xs font-display font-medium text-white flex items-center gap-1.5">
                        <Bell size={12} className="text-emerald-400" />
                        Notificações de Alerta
                      </h4>
                      <button 
                        onClick={() => setIsNotificationPanelOpen(false)}
                        className="text-slate-500 hover:text-white text-xs font-mono"
                      >
                        Fechar
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto scrollbar-hide space-y-2.5">
                      {notifications.length === 0 ? (
                        <p className="text-2xs text-slate-500 text-center py-4">Nenhuma notificação registrada.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-2.5 bg-slate-950/40 rounded-lg text-2xs border border-slate-850">
                            <span className="font-bold text-white block mb-0.5">{n.title}</span>
                            <span className="text-slate-400 leading-normal block">{n.body}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 bg-slate-900 border border-slate-850 rounded-xl text-slate-355 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* ⚠️ Warning banner when Gemini API quota is exhausted */}
      {apiStatus === 'quota_exhausted' && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-300 font-medium flex items-center justify-center gap-2">
          <span className="text-amber-400">⚠️</span>
          <span>
            <strong>Modo Inteligente Local Ativo:</strong> O limite de cota da API Gemini foi atingido. O Finance Flow continua funcionando normalmente offline com inteligência sintética e simulações rápidas!
          </span>
        </div>
      )}

      {/* 🛡️ Info banner when GEMINI_API_KEY is not configured */}
      {apiStatus === 'offline' && (
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-indigo-500/20 px-4 py-2 text-center text-xs text-indigo-300 font-medium flex items-center justify-center gap-2">
          <span className="text-indigo-400">ℹ️</span>
          <span>
            <strong>Modo Off-line Heurístico:</strong> Executando com o motor analítico local seguro. Todas as funções financeiras e simulações continuam 100% disponíveis offline.
          </span>
        </div>
      )}

      {/* 📱 Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900 border-b border-slate-800 overflow-hidden z-30"
          >
            <div className="px-4 py-3 space-y-1">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-medium transition ${isSelected ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎪 Main Application Frame Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 relative mb-12">
        <ActiveComponent />
      </main>

      {/* Footer Branding Credit */}
      <footer className="w-full text-center py-6 text-[10px] font-mono text-slate-600 border-t border-slate-900 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 sm:px-6 gap-2">
          <span>© 2026 Finance Flow Inc. Todos os direitos reservados.</span>
          <span className="flex items-center gap-1.5 text-slate-550">
            <HelpCircle size={10} />
            Equipado com Inteligência Artificial Gemini 3.5 & Cloud Ingress Port 3000
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <DashboardLayout />
    </FinanceProvider>
  );
}
