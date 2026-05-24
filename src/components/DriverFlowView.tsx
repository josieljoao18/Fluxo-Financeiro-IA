/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
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
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DriverFlowView: React.FC = () => {
  const { driverLogs, addDriverLog, deleteDriverLog } = useFinance();
  
  // Shift state
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

  // Totals calculations
  const totalGross = driverLogs.reduce((sum, l) => sum + l.grossEarnings, 0);
  const totalFuel = driverLogs.reduce((sum, l) => sum + l.fuelCost, 0);
  const totalOther = driverLogs.reduce((sum, l) => sum + l.otherCosts, 0);
  const totalKm = driverLogs.reduce((sum, l) => sum + l.km, 0);
  const totalHours = driverLogs.reduce((sum, l) => sum + l.hours, 0);

  const totalCosts = totalFuel + totalOther;
  const netEarnings = totalGross - totalCosts;

  const netPerHour = totalHours > 0 ? (netEarnings / totalHours).toFixed(2) : "0.00";
  const costPerKm = totalKm > 0 ? (totalCosts / totalKm).toFixed(2) : "0.00";
  const grossPerKm = totalKm > 0 ? (totalGross / totalKm).toFixed(2) : "0.00";

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hours || !km || !grossEarnings || !fuelCost) {
      alert("Por favor, preencha as informações obrigatórias para logar o turno!");
      return;
    }

    addDriverLog({
      date,
      platform,
      hours: parseFloat(hours),
      km: parseFloat(km),
      grossEarnings: parseFloat(grossEarnings),
      fuelCost: parseFloat(fuelCost),
      otherCosts: otherCosts ? parseFloat(otherCosts) : 0,
      notes: notes || `Shift no ${platform}`
    });

    // Reset Form
    setHours("");
    setKm("");
    setGrossEarnings("");
    setFuelCost("");
    setOtherCosts("");
    setNotes("");

    alert("Turno adicionado com sucesso e computado no seu lucro líquido fiscal!");
  };

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
        setImportStatus(`Importando relatórios de corrida ${file.name}...`);
        
        setTimeout(() => {
          // Generate 2 structured driver logs automatically
          const platformMock = file.name.toLowerCase().includes("99") ? "99" : "Uber";
          
          addDriverLog({
            date: '2026-05-18',
            platform: platformMock as any,
            hours: 7.5,
            km: 142,
            grossEarnings: 310.00,
            fuelCost: 85.00,
            otherCosts: 5.00,
            notes: 'Importado automatico de PDF semanal'
          });

          addDriverLog({
            date: '2026-05-19',
            platform: platformMock as any,
            hours: 6.0,
            km: 110,
            grossEarnings: 235.00,
            fuelCost: 65.00,
            otherCosts: 0,
            notes: 'Importado de extrato CSV de ganhos'
          });

          setIsImporting(false);
          setImportStatus(null);
          alert(`Excelente! Importamos 2 novos turnos a partir do seu extrato da ${platformMock}!`);
        }, 1200);

      }, 1000);
    }
  };

  return (
    <div className="space-y-6" id="driver-portal">
      {/* Platform banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-indigo-950/20 p-5 rounded-2xl border border-indigo-500/10 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Car size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight">Driver Flow: Portal do Motorista</h2>
            <p className="text-sm text-gray-400">Automatize o cálculo de quilometragem, combustível, faturamento e lucro líquido operacional.</p>
          </div>
        </div>
        {/* Open Finance preparation status */}
        <div className="bg-slate-900 border border-slate-800 p-2.5 px-4 rounded-xl flex items-center gap-2">
          <Layers size={14} className="text-indigo-400 animate-pulse" />
          <span className="text-xs text-slate-300">Integração API 99 / Uber:</span>
          <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase font-bold">Preparado</span>
        </div>
      </div>

      {/* Driver stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Lucro líquido */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-mono">
            <span>Lucro Líquido</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-2">
            R$ {netEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Faturamento líquido real</p>
        </div>

        {/* KM total */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-mono">
            <span>Distância Total</span>
            <MapPin size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-mono font-bold text-white mt-2">
            {totalKm} KM
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Quilometragem acumulada</p>
        </div>

        {/* Horas */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-mono">
            <span>Tempo Logado</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <p className="text-xl font-mono font-bold text-white mt-2">
            {totalHours} h
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Horas trabalhadas em app</p>
        </div>

        {/* Rendimento por hora */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-mono">
            <span>Rendimento Líquido</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <p className="text-xl font-mono font-bold text-emerald-300 mt-2">
            R$ {netPerHour}/h
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Média por hora trabalhada</p>
        </div>

        {/* Operational Cost per KM */}
        <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs uppercase font-mono">
            <span>Custo por KM</span>
            <Fuel size={14} className="text-amber-500" />
          </div>
          <p className="text-xl font-mono font-bold text-amber-400 mt-2">
            R$ {costPerKm}/KM
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Despesa (Combustível+outros)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Shift Log Form */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-display font-bold text-white mb-4 flex items-center gap-1.5">
            <Plus size={16} className="text-indigo-400" />
            Logar Novo Turno de Trabalho
          </h3>

          <form onSubmit={handleAddShift} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Plataforma</label>
                <select 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-sans"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                >
                  <option value="Uber">Uber</option>
                  <option value="99">99 Táxi</option>
                  <option value="InDrive">InDrive</option>
                  <option value="Outros">Outras Corridas</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Data do Turno</label>
                <input 
                  type="date" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-indigo-500 font-mono"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Horas Online (h)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: 6.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">KM Rodados</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: 120"
                  value={km}
                  onChange={(e) => setKm(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ganhos Brutos (R$)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: 280.00"
                  value={grossEarnings}
                  onChange={(e) => setGrossEarnings(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Custo de Combustível (R$)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: 75.00"
                  value={fuelCost}
                  onChange={(e) => setFuelCost(e.target.value)}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Outros Custos (R$)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                  placeholder="ex: Aluguel / Pedágio"
                  value={otherCosts}
                  onChange={(e) => setOtherCosts(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Notas da Jornada</label>
              <input 
                type="text" 
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-indigo-500 font-sans"
                placeholder="ex: Alta movimentação no shopping..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
            >
              Computar Shift Corridas
            </button>
          </form>
        </div>

        {/* Rapid Excel/PDF report imports */}
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-display font-bold text-white mb-2 flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-indigo-400" />
              Importador Inteligente de Relatórios
            </h3>
            <p className="text-xs text-slate-400 mb-4">Economize tempo importando diretamente os extratos semanais de PDF, XLSX ou CSV baixados da Uber, 99 ou InDrive.</p>

            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={() => setImportReportType('csv')}
                className={`py-1.5 px-3 rounded-md font-mono text-2xs uppercase font-extrabold border ${importReportType === 'csv' ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-450'}`}
              >
                CSV Ganhos
              </button>
              <button 
                onClick={() => setImportReportType('pdf')}
                className={`py-1.5 px-3 rounded-md font-mono text-2xs uppercase font-extrabold border ${importReportType === 'pdf' ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-450'}`}
              >
                PDF Uber
              </button>
              <button 
                onClick={() => setImportReportType('xlsx')}
                className={`py-1.5 px-3 rounded-md font-mono text-2xs uppercase font-extrabold border ${importReportType === 'xlsx' ? 'bg-indigo-500/10 border-indigo-400 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-450'}`}
              >
                99 Excel
              </button>
            </div>

            {/* Drag Box for upload */}
            <div 
              onClick={triggerReportImport}
              className="border border-dashed border-slate-800 py-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-500/5 rounded-xl transition-all"
            >
              {isImporting ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-white mt-3 font-semibold">{importStatus}</p>
                </div>
              ) : (
                <>
                  <UploadCloud size={30} className="text-slate-500 mb-2" />
                  <p className="text-xs text-slate-300 font-medium font-sans">Importar Arquivo de Faturamento</p>
                  <p className="text-[10px] text-slate-550 mt-1">Clique para sandbox importar amostra de turnos</p>
                </>
              )}
            </div>

            <input 
              ref={importFileRef} 
              type="file" 
              accept=".csv,.pdf,.xls,.xlsx" 
              className="hidden" 
              onChange={handleImportFile} 
            />
          </div>

          {/* Current list of shifts logs */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto scrollbar-hide">
            <h3 className="text-sm font-display font-semibold text-white mb-3">Histórico de Jornadas</h3>

            {driverLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Nenhum turno registrado neste mês.</p>
            ) : (
              <div className="space-y-3">
                {driverLogs.map((log) => {
                  const net = log.grossEarnings - (log.fuelCost + log.otherCosts);
                  return (
                    <div key={log.id} className="bg-slate-900 p-3 rounded-xl border border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-500/10 p-2 text-indigo-400 rounded-lg">
                          <Car size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-white font-bold">{log.platform}</span>
                            <span className="text-[9px] font-mono text-slate-500">{log.date}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{log.km} KM rodados • {log.hours}h online</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-emerald-400">R$ +{net.toFixed(2)} líq.</span>
                          <span className="block text-[9px] text-slate-500 font-mono">Bruto: R$ {log.grossEarnings.toFixed(0)}</span>
                        </div>
                        <button 
                          onClick={() => deleteDriverLog(log.id)}
                          className="p-1 px-1.5 text-slate-600 hover:text-red-400 transition"
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
