/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  Plus, 
  Trash2, 
  UserPlus, 
  Search, 
  Phone, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  FileText, 
  X,
  TrendingDown,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MeDevemView: React.FC = () => {
  const { debtors, addDebtor, deleteDebtor, addPaymentToDebtor, markDebtAsPaid } = useFinance();

  // Component states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendente' | 'pago' | 'atrasado'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selected debtor for payment/detailed view modal
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  
  // Add Debtor Form States
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("2026-05-23");
  const [formDueDate, setFormDueDate] = useState("2026-06-23");
  const [formNotes, setFormNotes] = useState("");

  // Clean phone string to avoid link breakages
  const cleanPhoneString = (num: string) => {
    return num.replace(/\D/g, '');
  };

  const handleCreateDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formAmount || !formDueDate) {
      alert("Por favor, preencha o Nome, Valor e Data de Vencimento.");
      return;
    }

    const amt = parseFloat(formAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Insira um valor maior que zero.");
      return;
    }

    addDebtor({
      name: formName,
      phone: formPhone ? cleanPhoneString(formPhone) : "",
      amount: amt,
      initialAmount: amt,
      date: formDate,
      dueDate: formDueDate,
      notes: formNotes || "Cobrança rápida lançada"
    });

    // Reset Form & Close
    setFormName("");
    setFormPhone("");
    setFormAmount("");
    setFormNotes("");
    setIsModalOpen(false);
  };

  const selectedDebtor = useMemo(() => {
    return debtors.find(d => d.id === selectedDebtorId);
  }, [debtors, selectedDebtorId]);

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtorId || !paymentAmount) return;

    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Valor inválido.");
      return;
    }

    if (selectedDebtor && amt > selectedDebtor.amount) {
      alert(`O valor do pagamento (R$ ${amt.toFixed(2)}) é maior do que o saldo restante da dívida (R$ ${selectedDebtor.amount.toFixed(2)}).`);
      return;
    }

    const today = '2026-05-23';
    addPaymentToDebtor(selectedDebtorId, amt, today);
    setPaymentAmount("");
    
    // Close detail view if debt fully paid
    if (selectedDebtor && selectedDebtor.amount - amt <= 0) {
      setSelectedDebtorId(null);
    }
  };

  // Quick whatsapp billing text template generator
  const getWhatsAppLink = (debtor: typeof debtors[0]) => {
    const textMsg = `Olá ${debtor.name}! Estou usando o Finance Flow para organizar minhas pendências e lembrei da nossa conta de R$ ${debtor.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${debtor.notes}) que vence em ${debtor.dueDate}. Você pode fazer o Pix quando puder? Obrigado!`;
    const cleanPhone = cleanPhoneString(debtor.phone);
    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(textMsg)}`;
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    let pending = 0;
    let paid = 0;
    let overdue = 0;
    const todayStr = '2026-05-23';

    debtors.forEach(d => {
      // If remaining amount is 0, it's paid
      if (d.amount === 0) {
        // Calculate total payments received
        paid += d.initialAmount;
      } else {
        // Active debt
        if (d.dueDate < todayStr) {
          overdue += d.amount;
        } else {
          pending += d.amount;
        }
      }
    });

    return { pending, paid, overdue, totalActive: pending + overdue };
  }, [debtors]);

  // Filters applications
  const filteredDebtors = useMemo(() => {
    const todayStr = '2026-05-23';
    return debtors.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'pago') {
        matchesStatus = d.amount === 0;
      } else if (statusFilter === 'pendente') {
        matchesStatus = d.amount > 0 && d.dueDate >= todayStr;
      } else if (statusFilter === 'atrasado') {
        matchesStatus = d.amount > 0 && d.dueDate < todayStr;
      }

      return matchesSearch && matchesStatus;
    });
  }, [debtors, searchTerm, statusFilter]);

  return (
    <div className="space-y-6" id="me-devem-portal">
      
      {/* Visual Portal Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">Me Devem: Controle de Cobranças</h2>
            <p className="text-sm text-gray-400">Gerencie empréstimos, corridas rachadas e venda de ativos com lembretes rápidos via WhatsApp.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-xs text-white font-semibold flex items-center gap-1.5 px-4.5 py-3 rounded-xl transition shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <Plus size={16} />
          Cadastrar Nova Cobrança
        </button>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total a Receber */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Total Pendente</span>
            <Clock size={14} className="text-indigo-400" />
          </div>
          <p className="text-xl font-mono font-bold text-white mt-2">
            R$ {metrics.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Dentro do prazo regulamentar</p>
        </div>

        {/* Total Atrasado */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          {metrics.overdue > 0 && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl animate-pulse"></div>
          )}
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Atrasos Críticos</span>
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <p className={`text-xl font-mono font-bold mt-2 ${metrics.overdue > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            R$ {metrics.overdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Contas fora do limite estabelecido</p>
        </div>

        {/* Total Pago / Recebido */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Total Recebido</span>
            <CheckCircle size={14} className="text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-2">
            R$ {metrics.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Valores quitados e arquivados</p>
        </div>

        {/* Saldo a Liquidar */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between bg-gradient-to-br from-slate-950 to-emerald-950/20">
          <div className="flex justify-between items-center text-slate-400 text-2xs uppercase font-mono tracking-wider">
            <span>Saldo em Aberto</span>
            <DollarSign size={14} className="text-emerald-300" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-300 mt-2">
            R$ {metrics.totalActive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Sua liquidez futura garantida</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rapid Add Card & Stats summary graph (1 Column) */}
        <div className="space-y-6">
          
          {/* Circular Chart Representation */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-display font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-emerald-400" />
              Proporção de Recebimentos
            </h3>

            {debtors.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Nenhuma conta cadastrada para gerar gráfico.</p>
            ) : (
              <div className="space-y-4 text-xs font-sans">
                {/* Horizontal progress visualization stack */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-2xs">Meta Total de Cobrança:</span>
                    <span className="font-mono text-slate-300 font-bold">R$ {(metrics.paid + metrics.totalActive).toFixed(0)}</span>
                  </div>
                  
                  {/* Stacked bar */}
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500" 
                      style={{ width: `${((metrics.paid / (metrics.paid + metrics.totalActive || 1)) * 100)}%` }} 
                      title="Recebido"
                    />
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-500" 
                      style={{ width: `${((metrics.pending / (metrics.paid + metrics.totalActive || 1)) * 100)}%` }} 
                      title="Pendente"
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500 animate-pulse" 
                      style={{ width: `${((metrics.overdue / (metrics.paid + metrics.totalActive || 1)) * 100)}%` }} 
                      title="Atrasado"
                    />
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-3 gap-1 pt-1.5 text-[9px] text-center font-mono font-medium">
                    <div className="flex items-center justify-center gap-1 text-emerald-400 bg-emerald-500/5 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Recebido ({Math.round((metrics.paid / (metrics.paid + metrics.totalActive || 1)) * 100)}%)</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-indigo-400 bg-indigo-500/5 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      <span>No Prazo ({Math.round((metrics.pending / (metrics.paid + metrics.totalActive || 1)) * 100)}%)</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-rose-400 bg-rose-500/5 py-1 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>Atrasados ({Math.round((metrics.overdue / (metrics.paid + metrics.totalActive || 1)) * 100)}%)</span>
                    </div>
                  </div>
                </div>

                {/* Helpful Tip Box */}
                <div className="p-3 bg-emerald-950/10 border border-emerald-500/10 rounded-xl flex gap-2 text-[10px] text-emerald-300 leading-relaxed">
                  <Info size={14} className="shrink-0 text-emerald-400 mt-0.5" />
                  <span>
                    Cobranças parciais ou totais registradas entram <strong>automaticamente</strong> como receitas consolidadas no seu fluxo de caixa geral e dashboard principal!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Info Block */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-display font-semibold text-white tracking-wider uppercase">Vantagens das Cobranças Finance Flow:</h4>
            <ul className="text-xs text-slate-450 space-y-2 list-none">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                <span>Fração de despesas compartilhadas instantâneas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                <span>Organização de fiados e acordos comerciais</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                <span>Lembretes amigáveis para evitar conflitos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Debtors List, Search and Operations (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col sm:flex-row gap-3 items-center">
            
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 outline-none transition"
                placeholder="Pesquisar devedor ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-550" />
            </div>

            {/* Type/Status Filter Tabs */}
            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto overflow-hidden">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-white'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setStatusFilter('pendente')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${statusFilter === 'pendente' ? 'bg-slate-800 text-indigo-400' : 'text-slate-450 hover:text-white'}`}
              >
                Pendente
              </button>
              <button 
                onClick={() => setStatusFilter('atrasado')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${statusFilter === 'atrasado' ? 'bg-slate-800 text-rose-500' : 'text-slate-450 hover:text-white'}`}
              >
                Atrasado
              </button>
              <button 
                onClick={() => setStatusFilter('pago')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${statusFilter === 'pago' ? 'bg-slate-805 text-emerald-400 font-black' : 'text-slate-450 hover:text-white'}`}
              >
                Pago
              </button>
            </div>
          </div>

          {/* List panel */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {filteredDebtors.length === 0 ? (
              <div className="p-16 text-center space-y-3 flex flex-col items-center">
                <Search size={36} className="text-slate-700 animate-pulse" />
                <h4 className="text-sm text-slate-300 font-semibold font-display">Nenhuma cobrança encontrada</h4>
                <p className="text-xs text-slate-550 max-w-sm">Use o botão superior para cadastrar seu primeiro devedor de forma simples!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {filteredDebtors.map((debtor) => {
                  const todayStr = '2026-05-23';
                  const isPaid = debtor.amount === 0;
                  const isOverdue = debtor.amount > 0 && debtor.dueDate < todayStr;
                  const percentPaid = Math.min(100, Math.round(((debtor.initialAmount - debtor.amount) / debtor.initialAmount) * 100));

                  return (
                    <motion.div 
                      layout
                      key={debtor.id} 
                      className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 hover:bg-slate-900/10 transition-all duration-150"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs text-white font-bold tracking-tight truncate">{debtor.name}</h4>
                          
                          {/* Badges status */}
                          {isPaid ? (
                            <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Pago</span>
                          ) : isOverdue ? (
                            <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded uppercase animate-pulse">Atrasado</span>
                          ) : (
                            <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">No Prazo</span>
                          )}

                          {debtor.phone && (
                            <a 
                              href={`tel:${debtor.phone}`}
                              className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 font-mono hover:underline"
                            >
                              <Phone size={10} />
                              {debtor.phone}
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 font-sans leading-normal break-words">{debtor.notes}</p>

                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-550 flex-wrap">
                          <span className="flex items-center gap-0.5">
                            <Calendar size={10} /> Vencimento: {debtor.dueDate}
                          </span>
                          <span>•</span>
                          <span>Data Inicial: {debtor.date}</span>
                        </div>

                        {/* Remaining payment fill */}
                        {!isPaid && (
                          <div className="space-y-1 pt-1 max-w-xs">
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <span>Cobrado: R$ {debtor.initialAmount}</span>
                              <span>Pendente: {100 - percentPaid}%</span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all" 
                                style={{ width: `${percentPaid}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right actions and balances */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-start w-full sm:w-auto mt-2 sm:mt-0 border-t border-slate-900 sm:border-0 pt-3 sm:pt-0 gap-3">
                        
                        <div className="text-left sm:text-right">
                          {isPaid ? (
                            <p className="text-xs font-mono font-bold text-emerald-400">Total Recebido</p>
                          ) : (
                            <p className="text-xs font-mono font-bold text-white">Saldo Restante</p>
                          )}
                          <p className={`text-md font-mono font-black ${isPaid ? 'text-emerald-400' : isOverdue ? 'text-rose-400' : 'text-white'}`}>
                            R$ {isPaid ? debtor.initialAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : debtor.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Lembrete WhatsApp link */}
                          {!isPaid && debtor.phone && (
                            <a 
                              href={getWhatsAppLink(debtor)}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-indigo-400 hover:text-white bg-indigo-500/5 hover:bg-emerald-600 rounded-lg transition"
                              title="Enviar lembrete de cobrança no WhatsApp"
                            >
                              <MessageSquare size={13} />
                            </a>
                          )}

                          {/* Detail & Pay entry selector */}
                          {!isPaid && (
                            <button 
                              onClick={() => setSelectedDebtorId(debtor.id)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-2xs text-slate-300 rounded-lg transition flex items-center gap-1 font-semibold"
                            >
                              <span>Abater</span>
                              <ArrowRight size={10} />
                            </button>
                          )}

                          {/* Quick checkout rest of debt */}
                          {!isPaid && (
                            <button 
                              onClick={() => markDebtAsPaid(debtor.id)}
                              className="p-2 text-emerald-400 hover:text-white bg-emerald-500/5 hover:bg-emerald-500 rounded-lg transition"
                              title="Marcar dívida completa como quitada"
                            >
                              <CheckCircle size={13} />
                            </button>
                          )}

                          {/* Delete */}
                          <button 
                            onClick={() => deleteDebtor(debtor.id)}
                            className="p-2 text-slate-650 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition"
                            title="Remover conta permanentemente"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW DEBTOR */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <UserPlus size={16} />
                </div>
                <h3 className="text-base font-display font-bold text-white">Criar Nova Cobrança</h3>
              </div>

              <form onSubmit={handleCreateDebtor} className="space-y-4 text-xs font-sans">
                
                <div>
                  <label className="text-slate-450 block mb-1">Nome do Devedor *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none"
                    placeholder="ex: João Silva, Roberta Pires"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-450 block mb-1">Telefone (opcional)</label>
                    <input 
                      type="tel" 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none font-mono"
                      placeholder="ex: 11999998888"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-450 block mb-1">Valor Total (R$) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none font-mono"
                      placeholder="ex: 150.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-450 block mb-1">Data de Lançamento</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none font-mono"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-slate-450 block mb-1">Vencimento da Conta *</label>
                    <input 
                      type="date" 
                      required
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none font-mono"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-450 block mb-1">Detalhes / Observações</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none h-16 font-sans resize-none"
                    placeholder="ex: Divisão do conserto, empréstimo gasolina"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition mt-2 cursor-pointer"
                >
                  Confirmar Cobrança
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DETAIL SUMMARY & PAY ABATE */}
      <AnimatePresence>
        {selectedDebtorId && selectedDebtor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDebtorId(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-base font-display font-bold text-white mb-1">Detalhamento de Cobrança</h3>
              <p className="text-xs text-slate-400 mb-4">{selectedDebtor.name}</p>

              <div className="space-y-4">
                {/* Visual statistics for active modal debtor */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Dívida Original</span>
                    <span className="text-sm font-bold text-slate-300 font-mono">R$ {selectedDebtor.initialAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-mono">Falta Pagar</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">R$ {selectedDebtor.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payments history ledger inside modal */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-white">Histórico de Quitação</h4>
                  {selectedDebtor.payments.length === 0 ? (
                    <p className="text-2xs text-slate-500 text-center py-4 bg-slate-900/40 rounded-lg">Nenhum pagamento parcial registrado ainda.</p>
                  ) : (
                    <div className="bg-slate-900/40 rounded-xl max-h-28 overflow-y-auto divide-y divide-slate-800 text-xs p-2">
                      {selectedDebtor.payments.map((p) => (
                        <div key={p.id} className="py-2 px-1 flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-mono">{p.date}</span>
                          <span className="text-slate-300 font-medium">Abate Parcial</span>
                          <span className="text-emerald-400 font-mono font-bold">R$ {p.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Abatement quick-form logger */}
                <form onSubmit={handleRegisterPayment} className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-white">Registrar Pagamento Parcial</h4>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-slate-500 font-mono text-[11px]">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white outline-none font-mono"
                        placeholder="0.00"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="px-4 bg-emerald-500 hover:bg-emerald-600 font-bold font-sans text-xs text-white rounded-lg transition shrink-0"
                    >
                      Abater Valor
                    </button>
                  </div>
                </form>

                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      markDebtAsPaid(selectedDebtor.id);
                      setSelectedDebtorId(null);
                    }}
                    className="w-full py-2.5 bg-indigo-500/15 hover:bg-indigo-500 hover:text-white border border-indigo-500/25 text-indigo-300 text-2xs font-semibold rounded-lg transition"
                  >
                    Marcar como Totalmente Quitada (Recebido)
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
