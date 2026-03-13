import { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, X, Loader2, CheckCircle, Copy } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

const DEPOSIT_VALUES = [5, 10, 25, 50, 100];

export function WalletButton() {
  const { balance, loading, createDeposit } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeposit = async (amount: number) => {
    if (amount < 1) return;
    setProcessing(true);
    setError("");
    setPixData(null);
    try {
      const result = await createDeposit(amount, "pix");
      if (result.qr_code_base64) {
        setPixData({ qr_code: result.qr_code, qr_code_base64: result.qr_code_base64 });
      } else if (result.init_point) {
        window.open(result.init_point, "_blank");
        setShowModal(false);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao criar pagamento");
    }
    setProcessing(false);
  };

  const copyPixCode = () => {
    if (pixData?.qr_code) {
      navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetModal = () => {
    setPixData(null);
    setError("");
    setCustomAmount("");
    setCopied(false);
  };

  return (
    <>
      <button
        onClick={() => { resetModal(); setShowModal(true); }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-[11px] font-semibold"
      >
        <Wallet className="h-3.5 w-3.5" />
        {loading ? "..." : `R$ ${Number(balance).toFixed(2)}`}
      </button>

      {createPortal(
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-card border border-border rounded-2xl w-full mx-auto max-h-[calc(100dvh-1.5rem)] overflow-y-auto ${pixData ? "max-w-md p-5" : "max-w-sm p-6"}`}
              >
                {pixData ? (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setPixData(null)}
                        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ← Voltar
                      </button>
                      <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-sm font-semibold">Escaneie o QR Code para depositar</p>

                    <div className="bg-secondary/30 border border-border rounded-xl p-3 flex justify-center">
                      <img
                        src={`data:image/png;base64,${pixData.qr_code_base64}`}
                        alt="QR Code Pix"
                        className="w-full max-w-[320px] aspect-square h-auto object-contain rounded-lg"
                      />
                    </div>

                    <p className="text-[11px] text-muted-foreground">Ou copie o código Pix:</p>
                    <button
                      onClick={copyPixCode}
                      className="w-full py-2.5 rounded-lg border border-border bg-secondary/50 text-[11px] font-medium hover:bg-secondary transition-all flex items-center justify-center gap-1.5"
                    >
                      {copied ? (
                        <><CheckCircle className="h-3 w-3 text-primary" /> Copiado!</>
                      ) : (
                        <><Copy className="h-3 w-3" /> Copiar código Pix</>
                      )}
                    </button>

                    <p className="text-[10px] text-muted-foreground/70">O saldo será creditado automaticamente após o pagamento.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <h3 className="text-base font-bold">Carteira</h3>
                      </div>
                      <button onClick={() => setShowModal(false)} className="p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="bg-secondary/50 border border-border rounded-xl p-4 text-center mb-5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Saldo atual</p>
                      <p className="text-2xl font-black text-primary">
                        R$ {Number(balance).toFixed(2)}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">Adicionar saldo via Pix:</p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {DEPOSIT_VALUES.map((val) => (
                        <button
                          key={val}
                          disabled={processing}
                          onClick={() => handleDeposit(val)}
                          className="py-2.5 rounded-lg border border-border bg-secondary/30 text-xs font-semibold hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50"
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                        <input
                          type="number"
                          min="1"
                          placeholder="0,00"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-border bg-secondary/30 text-xs font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
                        />
                      </div>
                      {customAmount && Number(customAmount) >= 1 && (
                        <button
                          disabled={processing}
                          onClick={() => handleDeposit(Number(customAmount))}
                          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                          Depositar
                        </button>
                      )}
                    </div>

                    {processing && (
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Gerando QR Code Pix...
                      </div>
                    )}

                    {error && <p className="text-[11px] text-destructive text-center">{error}</p>}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
