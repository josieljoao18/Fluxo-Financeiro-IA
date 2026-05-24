/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  Search, 
  SearchX, 
  Trash2, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Plus, 
  Tag, 
  CircleDollarSign, 
  SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HistoryView: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  
  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'gain' | 'expense'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual transaction form states
  const [formAmount, setFormAmount] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState<'gain' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState("alimentação");
  const [formDate, setFormDate] = useState("2026-05-23");

  const categories = formType === 'expense' 
    ? ['alimentação', 'combustível', 'transporte', 'mercado', 'contas', 'lazer', 'saúde', 'outros']
    : ['salário', 'renda extra', 'vendas', 'comissões', 'outros'];

  // Automatically update selected category when type toggles to prevent mismatch
  const handleTypeChangeInForm = (type: 'gain' | 'expense') => {
    setFormType(type);
    if (type === 'expense') {
      setFormCategory('alimentação');
    } else {
      setFormCategory('salário');
    }
  };

  // Calculations for filters
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || t.type === selectedTypeFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || t.category === selectedCategoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate expenses breakdown per category
  const expensesOnly = transactions.filter(t => t.type === 'expense');
  const totalExpense = expensesOnly.reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = ['alimentação', 'combustível', 'transporte', 'mercado', 'contas', 'lazer', 'saúde', 'outros'].map(cat => {
    const amount = expensesOnly.filter(t => t.category === cat).reduce((sum, t) => sum + t.amount, 0);
    const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 105) : 0;
    return { name: cat, amount, percent };
  }).filter(c => c.amount > 0).sort((a,b) => b.amount - a.amount);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || !formDescription) {
      alert("Insira pelo menos Descrição e Valor!");
      return;
    }

    addTransaction({
      amount: parseFloat(formAmount),
      description: formDescription,
      category: formCategory,
      type: formType,
      date: formDate || "2026-05-23"
    });

    // Reset and close
    setFormAmount("");
    setFormDescription("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6" id="history-transactions-hub">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">Histórico de Gastos e Ganhos</h2>
          <p className="text-sm text-gray-400">Pesquise, filtre e audite todas as suas operações financeiras consolidadas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-650 text-white font-semibold flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition text-sm shadow-lg shadow-emerald-550/10"
        >
          <Plus size={16} />
          Lançar Manualmente
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown visualizer sidebar (1 Column) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-display font-semibold text-white tracking-tight flex items-center gap-1.5">
            <Tag size={14} className="text-amber-400" />
            Gastos por Categoria
          </h3>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-800 rounded-xl">Sem despesas registradas nesta visualização.</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium capitalize">{item.name}</span>
                    <span className="text-slate-400 font-mono">R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {/* custom progress fill */}
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(item.percent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transactions list & filters (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 outline-none transition"
                placeholder="Pesquisar descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-3 text-slate-550" />
            </div>

            {/* Type Filter */}
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 w-full sm:w-auto overflow-hidden">
              <button 
                onClick={() => setSelectedTypeFilter('all')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${selectedTypeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-450 hover:text-white'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setSelectedTypeFilter('gain')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${selectedTypeFilter === 'gain' ? 'bg-slate-800 text-emerald-400' : 'text-slate-450 hover:text-white'}`}
              >
                Receitas
              </button>
              <button 
                onClick={() => setSelectedTypeFilter('expense')}
                className={`flex-1 sm:flex-none text-2xs uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${selectedTypeFilter === 'expense' ? 'bg-slate-800 text-amber-500' : 'text-slate-450 hover:text-white'}`}
              >
                Despesas
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center space-y-3 flex flex-col items-center">
                <SearchX size={36} className="text-slate-650" />
                <h4 className="text-sm text-slate-300 font-semibold font-display">Nenhuma transação localizada</h4>
                <p className="text-xs text-slate-400 max-w-sm">Ajuste seus filtros de busca ou lance novos valores no console de transações!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {filteredTransactions.map((tx) => (
                  <motion.div 
                    layout
                    key={tx.id} 
                    className="p-4 flex justify-between items-center bg-slate-950/40 hover:bg-slate-900/20 transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${tx.type === 'gain' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {tx.type === 'gain' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <h4 className="text-xs text-white font-semibold font-sans">{tx.description}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-slate-550">
                          <span className="capitalize">{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-xs font-mono font-bold ${tx.type === 'gain' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {tx.type === 'gain' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button 
                        onClick={() => deleteTransaction(tx.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-400 rounded-lg hover:bg-rose-500/5 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Sheet Modal */}
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

              <h3 className="text-base font-display font-bold text-white mb-4">Lançar Transação Tradicional</h3>

              <form onSubmit={handleCreateTransaction} className="space-y-4 text-xs font-sans">
                {/* Type toggle selection */}
                <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                  <button 
                    type="button"
                    onClick={() => handleTypeChangeInForm('expense')}
                    className={`py-2 px-3 rounded-md font-semibold text-center ${formType === 'expense' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    Gasto / Despesa
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleTypeChangeInForm('gain')}
                    className={`py-2 px-3 rounded-md font-semibold text-center ${formType === 'gain' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
                  >
                    Ganho / Receita
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-450 block mb-1">Descrição</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none"
                      placeholder="ex: Mercado da Esquina, Uber Fim de Semana"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-450 block mb-1">Valor do Lançamento (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none font-mono"
                        placeholder="ex: 124.50"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-slate-450 block mb-1">Categoria</label>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none capitalize"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-450 block mb-1">Data</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-white outline-none font-mono"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition mt-2"
                >
                  Registrar Lançamento
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
