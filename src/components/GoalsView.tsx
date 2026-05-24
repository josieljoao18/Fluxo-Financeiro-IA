/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  Plus, 
  Trash2, 
  Trophy, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  CircleAlert, 
  Coins, 
  Compass, 
  Medal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const GoalsView: React.FC = () => {
  const { goals, streakState, addGoal, updateGoalProgress, verifyStreak } = useFinance();

  // Modal manual goal states
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [category, setCategory] = useState("Reserva");
  const [deadline, setDeadline] = useState("2026-12-31");
  const [formProgress, setFormProgress] = useState<{ [id: string]: string }>({});

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) {
      alert("Defina o título e o valor da meta!");
      return;
    }

    addGoal({
      title,
      target: parseFloat(target),
      current: 0,
      category,
      deadline
    });

    setTitle("");
    setTarget("");
    alert("Meta financeira criada com sucesso! Desbloqueie conquistas ao bater o objetivo!");
  };

  const handleUpdateProgressSubmit = (id: string, currentVal: number) => {
    const inputVal = formProgress[id];
    if (!inputVal) return;

    const amtToAdd = parseFloat(inputVal);
    if (isNaN(amtToAdd) || amtToAdd <= 0) {
      alert("Insira um valor positivo válido!");
      return;
    }

    updateGoalProgress(id, amtToAdd);
    
    // Clear input state
    setFormProgress(prev => ({ ...prev, [id]: "" }));
  };

  // Mock list of locked/unlocked achievements based on current totals
  const achievements = [
    { 
      id: 'ac1', 
      title: 'Mente Organizada', 
      description: 'Lançou sua primeira despesa no console de IA.', 
      xp: '+50 XP', 
      unlocked: true 
    },
    { 
      id: 'ac2', 
      title: 'Resistência Financeira', 
      description: 'Mantenha um streak diário de 7 dias de controle.', 
      xp: '+150 XP', 
      unlocked: streakState.streakDays >= 7 
    },
    { 
      id: 'ac3', 
      title: 'Investidor Inicial', 
      description: 'Acumulou mais de R$ 3.000 em saldo líquido.', 
      xp: '+200 XP', 
      unlocked: goals.some(g => g.current >= 3000) 
    },
    { 
      id: 'ac4', 
      title: 'Independente Uber', 
      description: 'Logou seu primeiro faturamento líquido como parceiro app.', 
      xp: '+100 XP', 
      unlocked: true 
    }
  ];

  return (
    <div className="space-y-6" id="gamified-metas-hub">
      {/* Visual Gamified Level Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core level status block */}
        <div className="md:col-span-2 bg-gradient-to-br from-indigo-950/40 to-slate-950 p-6 rounded-2xl border border-indigo-900/30 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Trophy size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-white">Nível de Saúde Financeira</h3>
              <p className="text-xs text-indigo-200 opacity-80">Suba de nível ao bater metas e marcar streaks diários.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 py-2">
            {/* Level Counter circle */}
            <div className="w-20 h-20 rounded-full border-4 border-indigo-500 flex flex-col items-center justify-center bg-slate-900 shadow-lg shadow-indigo-500/10">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">LOG</span>
              <span className="text-2xl font-mono font-black text-indigo-300 -mt-1">{streakState.level}</span>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Experiência (XP):</span>
                <span className="text-indigo-400 font-mono font-bold">{streakState.points} / {streakState.nextLevelPoints} XP</span>
              </div>
              {/* Progress fill */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#6366f1]"
                  style={{ width: `${(streakState.points / streakState.nextLevelPoints) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-500 text-right">Faltam {streakState.nextLevelPoints - streakState.points} XP para o Nível {streakState.level + 1}</p>
            </div>
          </div>
        </div>

        {/* Daily streak ticking controller */}
        <div className="bg-gradient-to-br from-amber-950/20 to-slate-950 p-6 rounded-2xl border border-amber-900/20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-display font-semibold text-white">Streak Diário</h3>
              <p className="text-xs text-amber-500/80 font-mono tracking-tight font-bold flex items-center gap-1 mt-0.5">
                <Flame size={14} className="animate-bounce" />
                <span>{streakState.streakDays} Dias Seguidos</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed my-3">Não deixe sua consistência esfriar! Logue um gasto ou ganho hoje para manter sua rotina financeira ativa.</p>
          <button 
            onClick={verifyStreak}
            className="w-full py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs rounded-xl hover:bg-amber-500 hover:text-white transition duration-200"
          >
            Validar Controle de Hoje
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals additions and active lists (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-400" />
              Suas Metas de Sobrevivência e Lazer
            </h3>

            {goals.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center border border-dashed border-slate-800 rounded-xl">Nenhuma meta criada. Comece planejando abaixo!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((g) => {
                  const percent = Math.min(Math.round((g.current / g.target) * 100), 100);
                  return (
                    <div key={g.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-2xs bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400 block w-max uppercase mb-1">{g.category}</span>
                            <h4 className="text-sm text-white font-semibold">{g.title}</h4>
                          </div>
                          <span className={`text-xs font-mono font-bold ${g.achieved ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}>
                            {g.achieved ? "✓ Concluído" : `${percent}%`}
                          </span>
                        </div>

                        {/* progress bar */}
                        <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${g.achieved ? 'bg-emerald-500' : 'bg-emerald-500/85'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                          <span>Salvo: R$ {g.current}</span>
                          <span>Alvo: R$ {g.target}</span>
                        </div>
                      </div>

                      {/* Manual update input row */}
                      {!g.achieved && (
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            className="flex-1 bg-slate-950 text-slate-200 border border-slate-805 rounded-lg p-1.5 focus:border-indigo-500 font-mono text-xs outline-none"
                            placeholder="Adicionar R$"
                            value={formProgress[g.id] || ""}
                            onChange={(e) => setFormProgress({ ...formProgress, [g.id]: e.target.value })}
                          />
                          <button 
                            type="button"
                            onClick={() => handleUpdateProgressSubmit(g.id, g.current)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-2xs px-3 rounded-lg transition"
                          >
                            Poupar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Creation Form */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-display font-semibold text-white mb-4">Adicionar Novo Objetivo Financeiro</h3>
            <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="text-slate-450 block mb-1">Título da Meta</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500"
                  placeholder="ex: Viagem, Pneus Uber, Celular Novo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-450 block mb-1">Alvo Financeiro (R$)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: 3000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition"
                >
                  Estabelecer Meta
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Unlocked Achievements list sidebar (1 Column) */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-display font-semibold text-white flex items-center gap-1.5">
            <Medal size={16} className="text-amber-400" />
            Conquistas e Medalhas
          </h3>

          <div className="space-y-3">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${ach.unlocked ? 'bg-indigo-500/5 border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.05)]' : 'bg-slate-900/20 border-slate-900 opacity-40'}`}
              >
                <div className={`p-2 rounded-lg ${ach.unlocked ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className="flex justify-between items-center gap-2">
                    <h4 className="text-xs text-white font-bold">{ach.title}</h4>
                    {ach.unlocked && <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase">{ach.xp}</span>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{ach.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
