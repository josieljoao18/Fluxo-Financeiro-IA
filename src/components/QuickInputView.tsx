/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../FinanceContext';
import { 
  Mic, 
  MicOff, 
  Camera, 
  Send, 
  UploadCloud, 
  Check, 
  Cpu, 
  FileText, 
  RefreshCw, 
  CircleAlert,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const QuickInputView: React.FC = () => {
  const { parseFinancialCommand, scanReceiptOCR, isLoadingAI } = useFinance();
  
  // Text Input State
  const [typedCommand, setTypedCommand] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceCompatibilityError, setVoiceCompatibilityError] = useState(false);
  const recognitionRef = useRef<any>(null);

  // File OCR Scanner State
  const [dragActive, setDragActive] = useState(false);
  const [scannedResult, setScannedResult] = useState<{
    merchant: string;
    totalAmount: number;
    category: string;
    items: { name: string; price: number }[];
  } | null>(null);
  const [scannerStage, setScannerStage] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'pt-BR';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceTranscript("Ouvindo o seu comando...");
      };

      rec.onresult = (event: any) => {
        const transcriptText = event.results[0][0].transcript;
        setVoiceTranscript(transcriptText);
        setTypedCommand(transcriptText);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setVoiceCompatibilityError(true);
    }
  }, []);

  const handleToggleVoice = () => {
    if (voiceCompatibilityError) {
      alert("Seu navegador não tem suporte nativo para reconhecimento de voz. Recomendamos o uso do Google Chrome, Microsoft Edge ou Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setVoiceTranscript("");
      recognitionRef.current?.start();
    }
  };

  const handleSendCommand = async (text: string) => {
    const textToSubmit = text || typedCommand;
    if (!textToSubmit.trim()) return;

    setSuccessMessage(null);
    const addedTx = await parseFinancialCommand(textToSubmit);
    
    if (addedTx) {
      setSuccessMessage(
        `Sucesso! Adicionado: "R$ ${addedTx.amount.toFixed(2)} - ${addedTx.description}" (${addedTx.category})`
      );
      setTypedCommand("");
      setVoiceTranscript("");
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      alert("Houve um problema para interpretar o comando financeiro. Verifique a ortografia ou tente novamente!");
    }
  };

  // Receipt File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Certifique-se de carregar um arquivo de imagem (PNG, JPG, JPEG) correspondente ao recibo fiscal!");
      return;
    }

    setScannerStage('uploading');
    
    // Read and convert file to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Url = e.target?.result as string;
      setSelectedImageFile(base64Url);
      setScannerStage('processing');

      // Send to server OCR API
      const result = await scanReceiptOCR(base64Url, file.type);
      
      if (result) {
        setScannedResult({
          merchant: result.transaction.description,
          totalAmount: result.transaction.amount,
          category: result.transaction.category,
          items: result.items
        });
        setScannerStage('done');
      } else {
        alert("Falha ao digitalizar nota. Tente outra foto mais nítida.");
        setScannerStage('idle');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6" id="fast-entry-hub">
      <div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">Entrada Rápida por IA</h2>
        <p className="text-sm text-gray-400">Adicione receitas ou despesas em segundos com comando de voz, texto livre ou scanner de foto.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Left: Text & Voice Input Console */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6 min-h-[300px]">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold uppercase">Console de Voz / Texto</span>
              <span className="text-xs text-slate-500">• 1 clique automação</span>
            </div>

            <p className="text-xs text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-xl leading-relaxed">
              💡 <span className="text-white font-medium">Exemplos que você pode falar/digitar:</span><br />
              • <span className="italic">"Gastei 45 reais no mercado com churrasco"</span><br />
              • <span className="italic">"Recebi pix de 1500 reais de renda extra design"</span><br />
              • <span className="italic">"Paguei 210 de gasolina no posto Shell"</span>
            </p>

            {/* Simulated text panel block */}
            <div className="relative mt-4">
              <input 
                type="text" 
                className="w-full bg-slate-910 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-emerald-500 rounded-xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                placeholder="Fale ou digite aqui seu gasto/ganho..."
                value={typedCommand}
                onChange={(e) => setTypedCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendCommand(typedCommand);
                }}
              />
              <button 
                onClick={() => handleSendCommand(typedCommand)}
                disabled={typedCommand.trim() === "" || isLoadingAI}
                className="absolute right-2 top-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition disabled:opacity-40"
              >
                {isLoadingAI ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>

          {/* Voice Command Button Center */}
          <div className="flex flex-col items-center justify-center py-4 bg-slate-900/40 rounded-xl border border-slate-900">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleVoice}
              className={`p-5 rounded-full relative ${isListening ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white'} transition-all duration-300`}
            >
              {isListening ? (
                <>
                  <MicOff size={24} />
                  {/* Ripple Pulse Wave effect */}
                  <span className="absolute inset-0 rounded-full bg-rose-500 animate-ping opacity-25"></span>
                </>
              ) : (
                <Mic size={24} />
              )}
            </motion.button>

            {isListening ? (
              <div className="mt-3 text-center space-y-1">
                <p className="text-rose-400 text-xs font-mono font-bold animate-pulse">Gravando por voz...</p>
                <p className="text-slate-300 text-sm max-w-sm font-medium">"{voiceTranscript}"</p>
              </div>
            ) : typedCommand ? (
              <div className="mt-3 text-center">
                <p className="text-slate-300 text-xs text-slate-400">Transcrição finalizada. Clique em Enviar para registrar com Inteligência Artificial.</p>
              </div>
            ) : (
              <div className="mt-3 text-center">
                <p className="text-slate-400 text-xs">Pressione o microfone para ativar comando por voz em português.</p>
                {voiceCompatibilityError && (
                  <p className="text-[10px] text-rose-400 mt-1">Navegador incompatível com captação de voz nativa.</p>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2 mt-4"
              >
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                  <Check size={14} />
                </div>
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel Right: Multimodal OCR Scanner */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-1 px-2.5 rounded bg-violet-500/10 text-violet-400 font-mono text-xs font-bold uppercase text-center">Scanner de Recibo OCR</span>
              <span className="text-xs text-slate-500">• Extração Inteligente de Itens</span>
            </div>
            <p className="text-xs text-slate-400">Arraste uma nota fiscal, comprovante ou cupom tributário. A IA varrerá os dados e registrará todos os valores listados.</p>
          </div>

          {/* Drag area & scan effect */}
          {scannerStage === 'idle' && (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center cursor-pointer transition ${dragActive ? 'border-violet-400 bg-violet-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'}`}
            >
              <UploadCloud size={36} className="text-slate-500 mb-2" />
              <p className="text-xs text-slate-300 font-medium">Arraste ou clique para enviar foto da Nota</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG ou JPEG de faturas</p>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </div>
          )}

          {/* Uploading/Processing scanning lines laser anim */}
          {(scannerStage === 'uploading' || scannerStage === 'processing') && (
            <div className="relative border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center py-10 bg-slate-900/30">
              {/* Laser beam scan lines */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-violet-500/90 shadow-[0_0_12px_#8b5cf6] animate-bounce z-10"></div>
              
              {selectedImageFile && (
                <img 
                  src={selectedImageFile} 
                  alt="Scanning receipt" 
                  className="w-16 h-16 object-cover rounded mb-4 border border-violet-500/30 opacity-60" 
                />
              )}

              <p className="text-xs text-violet-400 font-mono font-bold animate-pulse flex items-center gap-1.5">
                <Cpu size={14} className="animate-spin" />
                {scannerStage === 'uploading' ? "Carregando comprovante..." : "IA escaneando nota fiscal fiscal..."}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">OCR estruturado extraindo totalizador e lista final de itens.</p>
            </div>
          )}

          {/* Done stage: Display parsed data and item lists */}
          {scannerStage === 'done' && scannedResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-900/80 p-4 rounded-xl border border-violet-900/30 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Estabelecimento Emissor</h4>
                  <p className="text-sm text-white font-semibold flex items-center gap-1.5">
                    <FileText size={14} className="text-violet-400" />
                    {scannedResult.merchant}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-violet-400 font-mono font-bold bg-violet-500/10 px-2 py-0.5 rounded">R$ {scannedResult.totalAmount.toFixed(2)}</span>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">{scannedResult.category}</p>
                </div>
              </div>

              {/* Parsed individual item Checklist */}
              {scannedResult.items && scannedResult.items.length > 0 && (
                <div>
                  <h5 className="text-[10px] text-slate-500 font-semibold mb-2 uppercase tracking-wider">Produtos Identificados por IA:</h5>
                  <div className="max-h-24 overflow-y-auto scrollbar-hide space-y-1 px-1.5 py-0.5 bg-slate-950/60 rounded-lg">
                    {scannedResult.items.map((item, id) => (
                      <div key={id} className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 text-ellipsis overflow-hidden whitespace-nowrap max-w-[180px]">• {item.name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">R$ {item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button 
                  onClick={() => setScannerStage('idle')}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <RefreshCw size={12} />
                  Novo Scanner
                </button>
                <div className="flex-1 bg-emerald-500/15 text-emerald-400 text-xs font-semibold py-2 rounded-lg border border-emerald-500/20 text-center flex items-center justify-center gap-1">
                  <Check size={12} />
                  Salvo em Gastos
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
