import { useState } from "react";
import { getBankConfig, saveBankConfig, type BankConfig } from "@/lib/tradeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BankControl() {
  const [config, setConfig] = useState<BankConfig>(getBankConfig());
  const [editing, setEditing] = useState(false);

  const handleSave = () => {
    saveBankConfig(config);
    setEditing(false);
  };

  const growth = config.currentBalance - config.initialBalance;
  const growthPct = config.initialBalance > 0 ? ((growth / config.initialBalance) * 100).toFixed(1) : '0';
  const positive = growth >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Controle de Banca</h2>
        <Button onClick={() => editing ? handleSave() : setEditing(true)}>
          {editing ? 'Salvar' : 'Editar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Banca Inicial</p>
          {editing ? (
            <Input type="number" className="mt-2 font-mono" value={config.initialBalance}
              onChange={e => setConfig({ ...config, initialBalance: Number(e.target.value) })} />
          ) : (
            <p className="text-2xl font-bold font-mono mt-1">R${config.initialBalance.toFixed(2)}</p>
          )}
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Banca Atual</p>
          {editing ? (
            <Input type="number" className="mt-2 font-mono" value={config.currentBalance}
              onChange={e => setConfig({ ...config, currentBalance: Number(e.target.value) })} />
          ) : (
            <p className="text-2xl font-bold font-mono mt-1">R${config.currentBalance.toFixed(2)}</p>
          )}
          <p className={`text-sm font-mono mt-1 ${positive ? 'profit-text' : 'loss-text'}`}>
            {positive ? '+' : ''}{growthPct}% ({positive ? '+' : ''}R${growth.toFixed(2)})
          </p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Meta Diária</p>
          {editing ? (
            <Input type="number" className="mt-2 font-mono" value={config.dailyGoal}
              onChange={e => setConfig({ ...config, dailyGoal: Number(e.target.value) })} />
          ) : (
            <p className="text-2xl font-bold font-mono mt-1 text-primary">R${config.dailyGoal.toFixed(2)}</p>
          )}
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Stop Loss Diário</p>
          {editing ? (
            <Input type="number" className="mt-2 font-mono" value={config.dailyStopLoss}
              onChange={e => setConfig({ ...config, dailyStopLoss: Number(e.target.value) })} />
          ) : (
            <p className="text-2xl font-bold font-mono mt-1 loss-text">-R${config.dailyStopLoss.toFixed(2)}</p>
          )}
        </div>

        <div className="stat-card col-span-full sm:col-span-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Stop Win Diário</p>
          {editing ? (
            <Input type="number" className="mt-2 font-mono" value={config.dailyStopWin}
              onChange={e => setConfig({ ...config, dailyStopWin: Number(e.target.value) })} />
          ) : (
            <p className="text-2xl font-bold font-mono mt-1 profit-text">+R${config.dailyStopWin.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="stat-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Evolução da Banca</p>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, (config.currentBalance / (config.initialBalance * 2)) * 100))}%`,
              backgroundColor: positive ? 'hsl(var(--profit))' : 'hsl(var(--loss))',
            }}
          />
        </div>
      </div>
    </div>
  );
}
