/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  BrainCircuit, 
  Coins, 
  Flame 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { transactions, driverLogs, aiInsight, streakState, goals } = useFinance();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // Math Calculations
  const gains = transactions.filter(t => t.type === 'gain');
  const expenses = transactions.filter(t => t.type === 'expense');

  const totalGains = gains.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalGains - totalExpenses;

  // Calculating today's expenses
  const todayStr = '2026-05-23';
  const todayExpenses = expenses
    .filter(t => t.date === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  // Custom vector Area Chart coordinates generator
  // Let's summarize spending history day-by-day for last 7 days (ending 23th May)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date('2026-05-23');
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map((day, idx) => {
    const dayExpense = expenses
      .filter(t => t.date === day)
      .reduce((sum, t) => sum + t.amount, 0);
    const dayGain = gains
      .filter(t => t.date === day)
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Label
    const dateLabel = new Date(day).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    return {
      date: day,
      label: dateLabel.replace('.', ''),
      gains: dayGain,
      expense: dayExpense,
    };
  });

  // Calculate SVG Points for simple responsive plotting
  // Graph height = 150, width = 500
  const maxVal = Math.max(...chartData.map(d => Math.max(d.gains, d.expense, 100)), 500);
  
  const pointsExpense = chartData.map((d, i) => {
    const x = (i * (500 / 6)).toFixed(1);
    const y = (150 - (d.expense / maxVal) * 120).toFixed(1); // leave 30px padding on top
    return `${x},${y}`;
  });

  const pointsGains = chartData.map((d, i) => {
    const x = (i * (500 / 6)).toFixed(1);
    const y = (150 - (d.gains / maxVal) * 120).toFixed(1);
    return `${x},${y}`;
  });

  const svgPathExpense = `M 0,150 L ${pointsExpense.join(' L ')} L 500,150 Z`;
  const strokePathExpense = pointsExpense.length > 0 ? `M ${pointsExpense.join(' L ')}` : '';

  const svgPathGains = `M 0,150 L ${pointsGains.join(' L ')} L 500,150 Z`;
  const strokePathGains = pointsGains.length > 0 ? `M ${pointsGains.join(' L ')}` : '';

  return (
    <div className="space-y-6" id="dashboard-cockpit">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/40 p-5 rounded-2xl border border-gray-800/80 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Painel Financeiro</h1>
          <p className="text-sm text-gray-400">Análise integrada de saldos, inteligência artificial e metas de 2026.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg">
            <Flame size={16} className="animate-pulse" />
            <span>{streakState.streakDays} Dias</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">Nível {streakState.level} • Financer</div>
            <div className="w-24 bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(streakState.points / streakState.nextLevelPoints) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-all shadow-lg select-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Saldo Total</span>
            <Wallet size={18} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            R$ {currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-3 flex items-center gap-1 text-xs text-slate-400">
            <div className={`p-0.5 rounded ${currentBalance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {currentBalance >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            </div>
            <span>Finanças Saudáveis</span>
          </div>
        </div>

        {/* Card 2: Today Expenses */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800/80 hover:border-amber-500/30 transition-all shadow-lg select-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Gastos do Dia</span>
            <ArrowDownRight size={18} className="text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            R$ {todayExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
            <Calendar size={12} className="text-slate-500" />
            <span>Ref. à 23 de Maio</span>
          </div>
        </div>

        {/* Card 3: Month Earnings */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-all shadow-lg select-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Receitas do Mês</span>
            <ArrowUpRight size={18} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
            R$ {totalGains.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center gap-1">
            <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded">R$ +{totalGains.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
            <span className="text-slate-500 font-normal">entrada este mês</span>
          </div>
        </div>

        {/* Card 4: Future Prediction Progress */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-slate-800/80 hover:border-violet-500/30 transition-all shadow-lg relative overflow-hidden group select-none">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-500"></div>
          <div className="flex items-center justify-between mb-3 text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Saldo Previsto (Fim de Mês)</span>
            <Sparkles size={18} className="text-violet-400 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-violet-300 tracking-tight">
            R$ {(currentBalance * 1.15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-400">
            <BrainCircuit size={12} />
            <span>Cálculo preditivo de IA</span>
          </div>
        </div>
      </div>

      {/* Main Charts area and AI Consultation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2 cols) */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Análise de Fluxo de Caixa</h3>
              <p className="text-xs text-gray-400">Acompanhamento dos últimos 7 dias operacionais</p>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-slate-300">Ganhos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="text-slate-300">Gastos</span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Pure React & Framer Motion Canvas Chart */}
          <div className="relative h-44 w-full" id="canvas-container">
            <svg 
              viewBox="0 0 500 150" 
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="glowGains" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="glowExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

              {/* Area Plots */}
              <path d={svgPathGains} fill="url(#glowGains)" />
              <path d={svgPathExpense} fill="url(#glowExpenses)" />

              {/* Stroke Lines */}
              <motion.path 
                d={strokePathGains} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.path 
                d={strokePathExpense} 
                fill="none" 
                stroke="#f59e0b" 
                strokeWidth="2.5" 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
              />

              {/* Interactive Plot Dots */}
              {chartData.map((d, i) => {
                const x = i * (500 / 6);
                const yExp = 150 - (d.expense / maxVal) * 120;
                const yGain = 150 - (d.gains / maxVal) * 120;
                
                return (
                  <g key={i}>
                    {/* Expense dots */}
                    <circle 
                      cx={x} 
                      cy={yExp} 
                      r={hoveredPoint === i ? 6 : 3.5} 
                      fill="#0b0f19"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Gain dots */}
                    <circle 
                      cx={x} 
                      cy={yGain} 
                      r={hoveredPoint === i ? 6 : 3.5} 
                      fill="#0b0f19"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setHoveredPoint(i)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Float Tooltip */}
            <AnimatePresence>
              {hoveredPoint !== null && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute bg-slate-900 border border-slate-700/80 p-2.5 rounded-xl text-xs -top-12 z-20 pointer-events-none shadow-xl flex flex-col gap-1 font-mono"
                  style={{ left: `calc(${(hoveredPoint * (100 / 6))}% - 60px)` }}
                >
                  <p className="text-white font-semibold text-center">{chartData[hoveredPoint].label}</p>
                  <div className="flex gap-4">
                    <span className="text-emerald-400">Ganhos: R$ {chartData[hoveredPoint].gains}</span>
                    <span className="text-amber-400">Gastos: R$ {chartData[hoveredPoint].expense}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 mt-2 px-1">
            {chartData.map((d, i) => (
              <span key={i} className="w-12 text-center">{d.label}</span>
            ))}
          </div>
        </div>

        {/* Level, Goals or Side Quick metrics inside dashboard (1 column) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-display font-semibold text-white">Metas Ativas</h3>
            <span className="text-xs text-emerald-400 font-medium">Auto</span>
          </div>

          {goals.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center border border-dashed border-slate-800 rounded-xl">Sem metas registradas no momento.</p>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((g) => {
                const percent = Math.min(Math.round((g.current / g.target) * 100), 100);
                return (
                  <div key={g.id} className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-semibold">{g.title}</span>
                      <span className="text-slate-400 font-mono">{percent}%</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-emerald-500' : 'bg-emerald-500/85'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>R$ {g.current.toLocaleString('pt-BR')} de R$ {g.target.toLocaleString('pt-BR')}</span>
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{g.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* AI Intelligence Insights Center */}
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-5 rounded-3xl border border-indigo-900/20 relative overflow-hidden shadow-xl" id="insights-bento">
        {/* Glow element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BrainCircuit size={18} className="animate-pulse" />
          </div>
          <h3 className="text-lg font-display font-semibold text-white">IA Financeira: Centro de Gestão</h3>
          {aiInsight.loading && (
            <span className="text-xs text-indigo-400 animate-pulse ml-2">Pensando...</span>
          )}
        </div>

        {aiInsight.loading ? (
          <div className="space-y-3 py-4">
            <div className="h-4 bg-slate-800/60 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-slate-800/40 rounded w-5/6 animate-pulse"></div>
            <div className="h-10 bg-slate-800/30 rounded animate-pulse mt-4"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Direct advice summary paragraph */}
            <p className="text-slate-300 leading-relaxed text-sm bg-slate-900/50 p-4 rounded-xl border border-slate-800/60 font-medium">
              ✨ <span className="text-white font-semibold">Resumo Inteligente:</span> {aiInsight.summaryText}
            </p>

            <p className="text-xs text-indigo-300 italic font-mono flex items-center gap-1">
              <span>➔ {aiInsight.predictionText}</span>
            </p>

            {/* Bento Insights Grid List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              {aiInsight.insights && aiInsight.insights.map((insight, idx) => {
                let badgeColor = "border-amber-500/20 bg-amber-500/5 text-amber-300";
                if (insight.type === 'forecast') badgeColor = "border-indigo-500/20 bg-indigo-500/5 text-indigo-300";
                if (insight.type === 'tip') badgeColor = "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className={`border p-4 rounded-2xl flex flex-col justify-between ${badgeColor}`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider">{insight.title}</span>
                        {insight.valueTrend && (
                          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white/10">{insight.valueTrend}</span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed opacity-90">{insight.text}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
