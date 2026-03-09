import { useState, useMemo } from "react";
import { getBankConfig } from "@/lib/tradeStore";
import { Input } from "@/components/ui/input";
import { Calculator, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function GestionCalculator() {
  const bank = getBankConfig();
  const [balance, setBalance] = useState(bank.currentBalance);
  const [risk, setRisk] = useState(5);

  // Soros calculator state
  const [sorosBalance, setSorosBalance] = useState(bank.currentBalance);
  const [sorosPayout, setSorosPayout] = useState(80); // payout % (e.g. 80% return)
  const [sorosOpsPerDay, setSorosOpsPerDay] = useState(5);
  const [sorosWinRate, setSorosWinRate] = useState(68);
  const [sorosDays, setSorosDays] = useState(22); // trading days in a month

  const idealEntry = (balance * risk) / 100;

  const sorosData = useMemo(() => {
    const data: { day: number; balance: number }[] = [];
    let currentBalance = sorosBalance;
    data.push({ day: 0, balance: currentBalance });

    for (let day = 1; day <= sorosDays; day++) {
      for (let op = 0; op < sorosOpsPerDay; op++) {
        const entry = (currentBalance * risk) / 100;
        const isWin = Math.random() * 100 < sorosWinRate;
        // For Soros simulation we use expected value instead of random
        // Actually let's use deterministic expected value per op
        const expectedPnl = entry * (sorosPayout / 100) * (sorosWinRate / 100) - entry * ((100 - sorosWinRate) / 100);
        currentBalance += expectedPnl;
        if (currentBalance <= 0) { currentBalance = 0; break; }
      }
      data.push({ day, balance: Math.round(currentBalance * 100) / 100 });
      if (currentBalance <= 0) break;
    }
    return data;
  }, [sorosBalance, sorosPayout, sorosOpsPerDay, sorosWinRate, sorosDays, risk]);

  const finalBalance = sorosData[sorosData.length - 1]?.balance ?? 0;
  const sorosProfit = finalBalance - sorosBalance;
  const sorosGrowth = sorosBalance > 0 ? ((sorosProfit / sorosBalance) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Calculadora de Gestão</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry calculator */}
        <div className="stat-card space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" /> Entrada Ideal
          </h3>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Banca (R$)</label>
            <Input type="number" className="font-mono mt-1" value={balance} onChange={e => setBalance(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide">Risco (%)</label>
            <Input type="number" className="font-mono mt-1" value={risk} onChange={e => setRisk(Number(e.target.value))} />
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Entrada Ideal</p>
            <p className="text-4xl font-bold font-mono text-primary mt-1">
              R${idealEntry.toFixed(2)}
            </p>
          </div>

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

        {/* Soros Calculator */}
        <div className="stat-card space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-profit" /> Calculadora Soros (1 Mês)
          </h3>
          <p className="text-xs text-muted-foreground">
            Simula juros compostos reinvestindo o lucro a cada operação.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Banca Inicial (R$)</label>
              <Input type="number" className="font-mono mt-1" value={sorosBalance} onChange={e => setSorosBalance(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Payout (%)</label>
              <Input type="number" className="font-mono mt-1" value={sorosPayout} onChange={e => setSorosPayout(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Ops/Dia</label>
              <Input type="number" className="font-mono mt-1" value={sorosOpsPerDay} onChange={e => setSorosOpsPerDay(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate (%)</label>
              <Input type="number" className="font-mono mt-1" value={sorosWinRate} onChange={e => setSorosWinRate(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Dias Úteis</label>
              <Input type="number" className="font-mono mt-1" value={sorosDays} onChange={e => setSorosDays(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">Risco/Op (%)</label>
              <Input type="number" className="font-mono mt-1" value={risk} onChange={e => setRisk(Number(e.target.value))} />
            </div>
          </div>

          {/* Result */}
          <div className={`rounded-lg p-5 text-center ${sorosProfit >= 0 ? 'profit-bg' : 'loss-bg'}`}>
            <p className="text-xs uppercase tracking-wide mb-1">Banca Final Estimada</p>
            <p className="text-3xl font-bold font-mono">R${finalBalance.toFixed(2)}</p>
            <p className="text-sm font-mono mt-1">
              {sorosProfit >= 0 ? '+' : ''}R${sorosProfit.toFixed(2)} ({sorosGrowth}%)
            </p>
          </div>

          {/* Chart */}
          {sorosData.length > 1 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Projeção Diária</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={sorosData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="day" stroke="hsl(215, 15%, 50%)" fontSize={11} label={{ value: 'Dia', position: 'insideBottom', offset: -2, fill: 'hsl(215, 15%, 50%)' }} />
                  <YAxis stroke="hsl(215, 15%, 50%)" fontSize={11} tickFormatter={v => `R$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 10%)',
                      border: '1px solid hsl(220, 14%, 18%)',
                      borderRadius: '8px',
                      color: 'hsl(210, 20%, 92%)',
                    }}
                    formatter={(value: number) => [`R$${value.toFixed(2)}`, 'Banca']}
                  />
                  <Line type="monotone" dataKey="balance" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily breakdown table */}
          <details className="text-sm">
            <summary className="text-xs text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors">
              Ver tabela dia a dia
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-0.5">
              {sorosData.map(d => (
                <div key={d.day} className="flex justify-between font-mono py-1 border-b border-border/30 text-xs">
                  <span className="text-muted-foreground">Dia {d.day}</span>
                  <span className={d.balance >= sorosBalance ? 'profit-text' : 'loss-text'}>
                    R${d.balance.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}