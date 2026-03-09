import { useState } from "react";
import { getBankConfig } from "@/lib/tradeStore";
import { Input } from "@/components/ui/input";
import { Calculator } from "lucide-react";

export default function GestionCalculator() {
  const bank = getBankConfig();
  const [balance, setBalance] = useState(bank.currentBalance);
  const [risk, setRisk] = useState(5);

  const idealEntry = (balance * risk) / 100;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Calculadora de Gestão</h2>

      <div className="stat-card max-w-md space-y-4">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Banca (R$)</label>
          <Input type="number" className="font-mono mt-1" value={balance} onChange={e => setBalance(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Risco (%)</label>
          <Input type="number" className="font-mono mt-1" value={risk} onChange={e => setRisk(Number(e.target.value))} />
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center">
          <Calculator className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Entrada Ideal</p>
          <p className="text-4xl font-bold font-mono text-primary mt-1">
            R${idealEntry.toFixed(2)}
          </p>
        </div>

        {/* Risk table */}
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tabela de Risco</p>
          <div className="space-y-1">
            {[1, 2, 3, 5, 10].map(r => (
              <div key={r} className="flex justify-between text-sm font-mono py-1 border-b border-border/50">
                <span className="text-muted-foreground">{r}%</span>
                <span className={r === risk ? 'text-primary font-bold' : ''}>R${((balance * r) / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
