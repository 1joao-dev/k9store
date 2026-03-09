import { useState } from "react";
import { getTrades, addTrade, deleteTrade, type Trade } from "@/lib/tradeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export default function TradeLog() {
  const [trades, setTrades] = useState<Trade[]>(getTrades());
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'WIN' | 'LOSS'>('ALL');

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    asset: 'EURUSD',
    type: 'CALL' as 'CALL' | 'PUT',
    amount: 50,
    result: 'WIN' as 'WIN' | 'LOSS',
    payout: 40,
    observation: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTrade(form);
    setTrades(getTrades());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    deleteTrade(id);
    setTrades(getTrades());
  };

  const filtered = filter === 'ALL' ? trades : trades.filter(t => t.result === filter);

  const totalProfit = trades.reduce((s, t) => s + (t.result === 'WIN' ? t.payout : -t.amount), 0);
  const wins = trades.filter(t => t.result === 'WIN').length;
  const winRate = trades.length > 0 ? ((wins / trades.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Registro de Operações</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova
        </Button>
      </div>

      {/* Quick stats */}
      <div className="flex gap-4 text-sm font-mono">
        <span className="text-muted-foreground">Total: {trades.length}</span>
        <span className="profit-text">Wins: {wins}</span>
        <span className="loss-text">Loss: {trades.length - wins}</span>
        <span className="text-muted-foreground">WR: {winRate}%</span>
        <span className={totalProfit >= 0 ? 'profit-text' : 'loss-text'}>
          P&L: {totalProfit >= 0 ? '+' : ''}R${totalProfit.toFixed(2)}
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="stat-card space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Data</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Hora</label>
              <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ativo</label>
              <Input value={form.asset} onChange={e => setForm({ ...form, asset: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tipo</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'CALL' | 'PUT' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CALL">CALL</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Entrada (R$)</label>
              <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Resultado</label>
              <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v as 'WIN' | 'LOSS' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WIN">WIN</SelectItem>
                  <SelectItem value="LOSS">LOSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Lucro (R$)</label>
              <Input type="number" value={form.payout} onChange={e => setForm({ ...form, payout: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Observação</label>
              <Input value={form.observation} onChange={e => setForm({ ...form, observation: e.target.value })} />
            </div>
          </div>
          <Button type="submit">Salvar Operação</Button>
        </form>
      )}

      <div className="flex gap-2">
        {(['ALL', 'WIN', 'LOSS'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'Todas' : f}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="p-3">Data</th>
              <th className="p-3">Hora</th>
              <th className="p-3">Ativo</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Entrada</th>
              <th className="p-3">Resultado</th>
              <th className="p-3">Lucro</th>
              <th className="p-3">Obs</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-border/50 hover:bg-accent/30">
                <td className="p-3 font-mono">{t.date}</td>
                <td className="p-3 font-mono">{t.time}</td>
                <td className="p-3 font-semibold">{t.asset}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${t.type === 'CALL' ? 'profit-bg' : 'loss-bg'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-3 font-mono">R${t.amount}</td>
                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${t.result === 'WIN' ? 'profit-bg' : 'loss-bg'}`}>
                    {t.result}
                  </span>
                </td>
                <td className={`p-3 font-mono font-bold ${t.result === 'WIN' ? 'profit-text' : 'loss-text'}`}>
                  {t.result === 'WIN' ? '+' : '-'}R${t.result === 'WIN' ? t.payout : t.amount}
                </td>
                <td className="p-3 text-muted-foreground max-w-[120px] truncate">{t.observation}</td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                    <Trash2 className="h-4 w-4 text-loss" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Nenhuma operação registrada</p>
        )}
      </div>
    </div>
  );
}
