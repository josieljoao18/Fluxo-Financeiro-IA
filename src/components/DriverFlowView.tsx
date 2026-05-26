/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  Plus, 
  Trash2, 
  Car, 
  Fuel, 
  Clock, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  FileSpreadsheet, 
  UploadCloud, 
  Check, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
  Sliders,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DriverFlowView: React.FC = () => {
  const { driverLogs, addDriverLog, deleteDriverLog, addPoints, addNotification } = useFinance();
  
  // Active Filter: 'hoje' | 'semana' | 'mes' | 'tudo'
  const [timeFilter, setTimeFilter] = useState<'hoje' | 'semana' | 'mes' | 'tudo'>('tudo');
  
  // Custom Daily Target State
  const [dailyTarget, setDailyTarget] = useState<number>(300);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState("300");

  // New Shift Log Form States
  const [platform, setPlatform] = useState<'Uber' | '99' | 'InDrive' | 'Outros'>('Uber');
  const [date, setDate] = useState('2026-05-23');
  const [hours, setHours] = useState("");
  const [km, setKm] = useState("");
  const [grossEarnings, setGrossEarnings] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  const [notes, setNotes] = useState("");

  // Sandbox Importation state
  const [isImporting, setIsImporting] = useState(false);
  const [importReportType, setImportReportType] = useState<'csv' | 'pdf' | 'xlsx'>('csv');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const todayStr = '2026-05-23';

  // Apply filters
  const filteredLogs = useMemo(() => {
    return driverLogs.filter(log => {
      if (timeFilter === 'tudo') return true;
      if (timeFilter === 'hoje') return log.date === todayStr;
      
      const logDate = new Date(log.date);
      const referenceDate = new Date(todayStr);
      const diffTime = Math.abs(referenceDate.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeFilter === 'semana') return diffDays <= 7;
      if (timeFilter === 'mes') return diffDays <= 30;

      return true;
    });
  }, [driverLogs, timeFilter]);

  // Aggregate stats based on active filter logs
  const stats = useMemo(() => {
    let gross = 0;
    let fuel = 0;
    let other = 0;
    let km = 0;
    let hours = 0;

    filteredLogs.forEach(l => {
      gross += l.grossEarnings;
      fuel += l.fuelCost;
      other += l.otherCosts;
      km += l.km;
      hours += l.hours;
    });

    const net = gross - (fuel + other);

    // Platform breakdowns
    const platformBreakdown = {
      Uber: { gross: 0, count: 0 },
      99: { gross: 0, count: 0 },
      InDrive: { gross: 0, count: 0 },
      Outros: { gross: 0, count: 0 }
    };

    filteredLogs.forEach(l => {
      if (platformBreakdown[l.platform]) {
        platformBreakdown[l.platform].gross += l.grossEarnings;
        platformBreakdown[l.platform].count += 1;
      }
    });

    return {
      gross,
      fuel,
      other,
      totalCosts: fuel + other,
      net,
      km,
      hours,
      netPerHour: hours > 0 ? (net / hours).toFixed(2) : "0.00",
      costPerKm: km > 0 ? ((fuel + other) / km).toFixed(2) : "0.00",
      grossPerKm: km > 0 ? (gross / km).toFixed(2) : "0.00",
      platformBreakdown
    };
  }, [filteredLogs]);

  // Daily target completion calculations (based on selected period faturamento or today's earnings)
  const earningsForGoalProgress = useMemo(() => {
    // We look at today's gross earnings specifically to track daily goal matching
    return driverLogs
      .filter(l => l.date === todayStr)
      .reduce((sum, l) => sum + l.grossEarnings, 0);
  }, [driverLogs]);

  const targetPercentage = useMemo(() => {
    return Math.min(100, Math.round((earningsForGoalProgress / dailyTarget) * 100));
  }, [earningsForGoalProgress, dailyTarget]);

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !km || !grossEarnings || !fuelCost) {
      alert("Por favor, preencha as informações obrigatórias para salvar o turno!");
      return;
    }

    const h = parseFloat(hours);
    const k = parseFloat(km);
    const gross = parseFloat(grossEarnings);
    const fuel = parseFloat(fuelCost);
    const other = otherCosts ? parseFloat(otherCosts) : 0;

    if (isNaN(h) || isNaN(k) || isNaN(gross) || isNaN(fuel)) {
      alert("Valores numéricos inválidos.");
      return;
    }

    addDriverLog({
      date,
      platform,
      hours: h,
      km: k,
      grossEarnings: gross,
      fuelCost: fuel,
      otherCosts: other,
      notes: notes || `Turno via ${platform}`
    });

    // Notify of possible goal achievement
    if (earningsForGoalProgress + gross >= dailyTarget && earningsForGoalProgress < dailyTarget) {
      addNotification('Meta do Dia Batida! 🏁', `Faturamento bruto de hoje superou seus R$ ${dailyTarget.toFixed(2)} programados no Rebu Flow!`, 'goal');
      addPoints(50);
    }

    // Reset Form
    setHours("");
    setKm("");
    setGrossEarnings("");
    setFuelCost("");
    setOtherCosts("");
    setNotes("");

    // Scroll to upper portal view smoothly
    document.getElementById("driver-portal")?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUpdateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempTarget);
    if (!isNaN(val) && val > 0) {
      setDailyTarget(val);
      setIsEditingTarget(false);
      addNotification('Meta Diária Modificada 🎯', `Sua meta diária de ganhos de motorista foi configurada para R$ ${val.toFixed(2)}.`, 'system');
    }
  };

  // Automated Rebu Analytical Intelligence summary text formulation
  const smartPilotInsight = useMemo(() => {
    if (filteredLogs.length === 0) {
      return {
        rating: "Aguardando Logs",
        color: "text-slate-400 border-slate-800 bg-slate-900/50",
        message: "Registre ou importe extratos semanais de faturamento para que a IA Rebu possa emitir consultoria e diagnóstico de performance e canais dinâmicos operacionais de fôlego."
      };
    }

    const fuelRatio = stats.gross > 0 ? (stats.fuel / stats.gross) * 100 : 0;
    const isEfficient = parseFloat(stats.netPerHour) > 35;
    const idealKmCost = parseFloat(stats.costPerKm) < 0.8;

    if (fuelRatio > 40) {
      return {
        rating: "Atenção: Consumo Alto",
        color: "text-amber-400 border-amber-500/20 bg-amber-500/5",
        message: `O combustível consome ${fuelRatio.toFixed(0)}% do seu faturamento bruto. Sugerimos aceitar somente corridas acima de R$ 2.00 por KM em horários de pico dinâmicos para economizar percursos em vazio!`
      };
    }

    if (isEfficient && idealKmCost) {
      return {
        rating: "Performance Excelente! 🚀",
        color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
        message: `Seu faturamento líquido médio de R$ ${stats.netPerHour}/h demonstra excelente seleção de chamadas. Seu custo operacional por KM rodado está sob forte controle (R$ ${stats.costPerKm}). Continue assim!`
      };
    }

    return {
      rating: "Eficiência Regular",
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-500/5",
      message: `Rendimento líquido consolidado de R$ ${stats.netPerHour}/h para o período. Tente diversificar entre os aplicativos Uber e 99 táxi para aproveitar melhores dinâmicas tarifárias simultâneas.`
    };

  }, [filteredLogs, stats]);

  // Import mock Excel report
  const triggerReportImport = () => {
    importFileRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsImporting(true);
      const file = e.target.files[0];
      setImportStatus("Lendo relatório...");

      setTimeout(() => {
        setImportStatus(`Parsing e mapeamento dinâmico de faturamento ${file.name}...`);
        
        setTimeout(() => {
          const is99 = file.name.toLowerCase().includes("99");
          const provider = is99 ? "99" : "Uber";
          
          addDriverLog({
            date: '2026-05-23',
            platform: provider as any,
            hours: 8.0,
            km: 165,
            grossEarnings: 380.00,
            fuelCost: 95.00,
            otherCosts: 10.00,
            notes: `Extrato ${provider} importado semanal`
          });

          addDriverLog({
            date: '2026-05-22',
            platform: '99',
            hours: 5.5,
            km: 90,
            grossEarnings: 210.00,
            fuelCost: 55.00,
            otherCosts: 0,
            notes: 'Extrato analítico complementar'
          });

          setIsImporting(false);
          setImportStatus(null);
          // Reward points for automation
          addPoints(40);
          addNotification('Relatório Importado! 📂', `Seus extratos da ${provider} foram capturados. +40 XP de automação.`, 'system');
        }, 1200);

      }, 1000);
    }
  };

  return (
    <div className="space-y-6" id="driver-portal">
      
      {/* Visual Header Grid inspired by Rebu */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-indigo-950/20 p-5 rounded-2xl border border-indigo-500/20 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/10">
            <Car size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-white tracking-tight">Driver Rebu Flow</h2>
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-indigo-500 text-white rounded font-mono animate-pulse">Copiloto</span>
            </div>
            <p className="text-xs text-gray-400 max-w-xl">Inteligência operacional especializada em motoristas de aplicativo. Maximize seu faturamento, controle combustível e reduza o custo por quilômetro.</p>
          </div>
        </div>

        {/* Dynamic Period Selector Controls */}
        <div className="flex gap-1 bg-slate-900 ring-1 ring-slate-800 p-1 rounded-xl w-full xl:w-auto overflow-x-auto">
          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'semana', label: '7 Dias' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'tudo', label: 'Todo o Histórico' }
          ].map(opt => (
            <button 
              key={opt.id}
              onClick={() => setTimeFilter(opt.id as any)}
              className={`text-[10px] sm:text-2xs font-extrabold uppercase tracking-wider px-3.5 py-2.5 rounded-lg transition whitespace-nowrap ${timeFilter === opt.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Bento Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Lucro Líquido Real Dashboard */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950 p-4.5 rounded-2xl border border-indigo-500/20 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-slate-950 to-indigo-950/20">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Result. Líquido Real</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-emerald-400 tracking-tight mt-3">
              R$ {stats.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Ganhos descontando custos</p>
          </div>
          
          <div className="border-t border-slate-900 mt-3 pt-2.5 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Bruto: R$ {stats.gross.toFixed(0)}</span>
            <span>Custos: R$ {stats.totalCosts.toFixed(0)}</span>
          </div>
        </div>

        {/* Quilômetros Rodados */}
        <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>KM Rodados</span>
            <MapPin size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-white mt-3">
              {stats.km.toLocaleString('pt-BR')} <span className="text-xs text-slate-400">KM</span>
            </p>
            <p className="text-[10px] text-slate-550 mt-1">Quilometragem acumulada</p>
          </div>
          
          <div className="border-t border-slate-900 mt-3 pt-2.5 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>R$ {stats.grossPerKm}/KM faturado</span>
          </div>
        </div>

        {/* Horas Online de Trabalho */}
        <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Horas Digitadas</span>
            <Clock size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-white mt-3">
              {stats.hours.toFixed(1)} <span className="text-xs text-slate-400">hrs</span>
            </p>
            <p className="text-[10px] text-slate-550 mt-1">Tempo online logado</p>
          </div>

          <div className="border-t border-slate-900 mt-3 pt-2.5 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Turnos salvos: {filteredLogs.length}</span>
          </div>
        </div>

        {/* Lucro de faturamento real por hora */}
        <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Velocidade de Ganhos</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-emerald-300 mt-3 animate-pulse">
              R$ {stats.netPerHour} <span className="text-xs text-slate-400">/h</span>
            </p>
            <p className="text-[10px] text-slate-550 mt-1">Seu termômetro de produtividade</p>
          </div>

          <div className="border-t border-slate-900 mt-3 pt-2.5 flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Estabilidade analítica</span>
          </div>
        </div>

        {/* Custo Real operacional por KM */}
        <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Custo Real por KM</span>
            <Fuel size={14} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-mono font-black text-amber-500 mt-3">
              R$ {stats.costPerKm} <span className="text-xs text-slate-400">/KM</span>
            </p>
            <p className="text-[10px] text-slate-550 mt-1">Gastos em rodagem de veículo</p>
          </div>

          <div className="border-t border-slate-900 mt-3 pt-2.5 flex justify-between text-[10px] text-amber-500/70 font-mono">
            <span>Combustível: R$ {stats.fuel.toFixed(0)}</span>
          </div>
        </div>

      </div>

      {/* Customizable Daily Goal Widgets & Copilot Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rebu Customizable Goal Tracker Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 relative overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900/40">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-display font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-indigo-400" />
              Meta de Faturamento (Hoje)
            </h3>
            
            {/* Editing buttons toggle */}
            {isEditingTarget ? (
              <form onSubmit={handleUpdateTarget} className="flex gap-1 shrink-0">
                <input 
                  type="number"
                  className="w-16 bg-slate-800 border border-slate-700 p-1 text-[11px] font-mono text-center text-white outline-none rounded"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                />
                <button type="submit" className="px-2 py-1 bg-emerald-500 text-white rounded text-[10px] font-bold">Ok</button>
              </form>
            ) : (
              <button 
                onClick={() => {
                  setTempTarget(dailyTarget.toString());
                  setIsEditingTarget(true);
                }}
                className="text-[10px] text-indigo-400 hover:text-white font-semibold transition underline"
              >
                Ajustar Meta
              </button>
            )}
          </div>

          {/* Goal Gauge Layout */}
          <div className="flex items-center gap-5 pt-1.5">
            {/* Animated Ring representation */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              {/* Ring Base SVG */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="#1e293b" fill="transparent" />
                <circle cx="40" cy="40" r="32" strokeWidth="6" stroke="url(#indigoGrad)" fill="transparent" 
                  strokeDasharray="201"
                  strokeDashoffset={201 - (201 * targetPercentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-sm font-mono font-black text-white">{targetPercentage}%</span>
                <span className="text-[8px] text-slate-550 uppercase">Progresso</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">Lançado Hoje: <strong className="text-white font-mono font-bold">R$ {earningsForGoalProgress.toFixed(2)}</strong></p>
              <p className="text-xs text-slate-400 font-mono">Meta Configurável: <strong className="text-indigo-400">R$ {dailyTarget.toFixed(2)}</strong></p>
              
              {targetPercentage >= 100 ? (
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <CheckCircle2 size={12} />
                  <span>Meta batida de hoje! Parabéns!</span>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500">Restam R$ {Math.max(0, dailyTarget - earningsForGoalProgress).toFixed(0)} para faturar e bater o dia!</p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Rebu Automated Intelligence Pilot Copilot (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950 to-indigo-950/10">
          <div className="flex justify-between items-start">
            <h3 className="text-xs font-display font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-yellow-400 animate-pulse" />
              Diagnóstico do Copiloto Rebu AI
            </h3>
            <span className={`text-[9px] font-mono font-bold border px-2 py-0.5 rounded ${smartPilotInsight.color}`}>
              {smartPilotInsight.rating}
            </span>
          </div>

          <p className="text-xs text-slate-350 leading-relaxed mt-3 py-1 font-sans">
            "{smartPilotInsight.message}"
          </p>

          <div className="border-t border-slate-900 mt-3 pt-3 flex items-center justify-between">
            <div className="flex gap-4 text-[10px] font-mono text-slate-500">
              <span>Faturamento Total do Período: <strong>R$ {stats.gross.toFixed(0)}</strong></span>
              <span>•</span>
              <span>Custo de rodagem total: <strong>R$ {stats.totalCosts.toFixed(0)}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Splitted views for Shift Submission and Performance Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Rapid Shift Registry (5 Columns) */}
        <div className="xl:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Plus size={15} className="text-indigo-400" />
            Entrada Rápida de Faturamento Diário
          </h3>

          <form onSubmit={handleAddShift} className="space-y-3 pt-1 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-450 block mb-1">Aplicativo de Origem</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                >
                  <option value="Uber">Uber Brasil</option>
                  <option value="99">99 App</option>
                  <option value="InDrive">InDrive</option>
                  <option value="Outros">Corridas Extra / Particular</option>
                </select>
              </div>

              <div>
                <label className="text-slate-450 block mb-1">Data da Jornada</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-mono"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-455 block mb-1">Duração (hrs)</label>
                <input 
                  type="number" 
                  step="0.1"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-mono text-center"
                  placeholder="ex: 6.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-455 block mb-1">Distância (KM)</label>
                <input 
                  type="number" 
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-mono text-center"
                  placeholder="ex: 125"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-455 block mb-1">Ganho Bruto (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-mono text-center"
                  placeholder="ex: 280.00"
                  value={grossEarnings}
                  onChange={(e) => setGrossEarnings(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-450 block mb-1">Combustível Gasto (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: 75.00"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-450 block mb-1">Manutenção e Outros (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: Lavagem, Aluguel"
                  value={otherCosts}
                  onChange={(e) => setOtherCosts(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-450 block mb-1">Notas Opcionais</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-sans"
                placeholder="ex: Muita dinâmica na rodoviária..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 font-extrabold text-white text-xs uppercase tracking-wider rounded-lg transition shrink-0 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-95"
            >
              Logar Turno no Sistema
            </button>
          </form>
        </div>

        {/* Platform Breakdown & Logging History List (7 Columns) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Platform breakdown card and Report import sandbox split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Platform breakdowns bar chart */}
            <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 space-y-3.5">
              <h4 className="text-xs font-display font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-indigo-400" />
                Desempenho por Aplicativo
              </h4>

              {filteredLogs.length === 0 ? (
                <p className="text-2xs text-slate-500 text-center py-6">Registre faturamentos para ver divisão.</p>
              ) : (
                <div className="space-y-2.5">
                  {(['Uber', '99', 'InDrive', 'Outros'] as const).map(pKey => {
                    const breakdown = stats.platformBreakdown[pKey] || { gross: 0, count: 0 };
                    const prct = stats.gross > 0 ? (breakdown.gross / stats.gross) * 100 : 0;
                    
                    return (
                      <div key={pKey} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="text-slate-300 font-bold">{pKey}</span>
                          <span className="text-slate-400">R$ {breakdown.gross.toFixed(0)} ({prct.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${pKey === 'Uber' ? 'bg-indigo-500' : pKey === '99' ? 'bg-amber-500' : pKey === 'InDrive' ? 'bg-teal-400' : 'bg-slate-600'}`}
                            style={{ width: `${prct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sandbox rapid file importer */}
            <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-display font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet size={13} className="text-indigo-400" />
                  Importação Automática
                </h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Arraste ou clique abaixo para importar extratos consolidados da Uber (.pdf) ou da 99 (.csv ou .xlsx).
                </p>
              </div>

              <div className="mt-3">
                {/* Upload dragbox */}
                <div 
                  onClick={triggerReportImport}
                  className="border border-dashed border-slate-800 hover:border-indigo-400 hover:bg-indigo-500/5 py-4 cursor-pointer text-center rounded-xl transition"
                >
                  {isImporting ? (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[9px] text-indigo-400 mt-1 font-bold">{importStatus}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud size={20} className="text-slate-500" />
                      <span className="text-[11px] text-slate-350 font-medium font-sans mt-1">Carregar Relatório Semanal</span>
                      <span className="text-[8px] text-slate-550 mt-0.5">Clique para simular importação</span>
                    </div>
                  )}
                </div>
              </div>

              <input 
                ref={importFileRef}
                type="file"
                accept=".csv,.pdf,.xls,.xlsx"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>

          </div>

          {/* Detailed Historical logs list scrollable */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4.5 border-b border-slate-905 flex justify-between items-center bg-slate-900/10">
              <h3 className="text-xs font-display font-bold text-white uppercase tracking-wider">Histórico Detalhado do Período</h3>
              <span className="text-[10px] text-slate-450 font-mono">Mostrando {filteredLogs.length} turnos</span>
            </div>

            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <p className="text-xs">Nenhum log gravado neste intervalo de tempo.</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-900 divide-dashed">
                {filteredLogs.map(log => {
                  const net = log.grossEarnings - (log.fuelCost + log.otherCosts);
                  const isPositive = net > 0;
                  
                  return (
                    <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-900/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-xs font-bold leading-none ${log.platform === 'Uber' ? 'bg-indigo-500/10 text-indigo-400' : log.platform === '99' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                          {log.platform.substring(0, 4)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-white">{log.notes || `Shift em ${log.platform}`}</span>
                            <span className="text-[9px] font-mono text-slate-550">{log.date}</span>
                          </div>
                          <div className="flex gap-2 text-[10px] text-slate-500 pt-0.5 font-mono">
                            <span>{log.km} KM rodados</span>
                            <span>•</span>
                            <span>{log.hours}h de rodagem</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className={`text-xs font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
                            R$ {isPositive ? '+' : ''}{net.toFixed(2)} líq.
                          </p>
                          <p className="text-[9px] text-slate-550 font-mono">combust.: R$ {log.fuelCost}</p>
                        </div>

                        <button 
                          onClick={() => {
                            if (confirm("Confirmar exclusão desta jornada? O lucro líquido total será reajustado.")) {
                              deleteDriverLog(log.id);
                            }
                          }}
                          className="p-1.5 text-slate-700 hover:text-rose-450 hover:bg-rose-500/5 rounded-lg transition"
                          title="Excluir Shift"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
