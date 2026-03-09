import { getTrades, calculateStats } from "@/lib/tradeStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Statistics() {
  const trades = getTrades();
  const stats = calculateStats(trades);

  // Build balance evolution chart data
  const sortedTrades = [...trades].reverse();
  let balance = 0;
  const chartData = sortedTrades.map((t, i) => {
    balance += t.result === 'WIN' ? t.payout : -t.amount;
    return { op: i + 1, balance, date: t.date };
  });

  // Monthly stats
  const now = new Date();
  const monthTrades = trades.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthStats = calculateStats(monthTrades);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Estatísticas</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Taxa de Acerto</p>
          <p className="text-3xl font-bold font-mono text-primary">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Operações</p>
          <p className="text-3xl font-bold font-mono">{stats.total}</p>
          <div className="flex gap-3 mt-1 text-sm font-mono">
            <span className="profit-text">W: {stats.wins}</span>
            <span className="loss-text">L: {stats.losses}</span>
          </div>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Maior Sequência Win</p>
          <p className="text-3xl font-bold font-mono profit-text">{stats.maxWinStreak}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Maior Sequência Loss</p>
          <p className="text-3xl font-bold font-mono loss-text">{stats.maxLossStreak}</p>
        </div>
      </div>

      <div className="stat-card">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Lucro do Mês</p>
        <p className={`text-3xl font-bold font-mono ${monthStats.totalProfit >= 0 ? 'profit-text' : 'loss-text'}`}>
          {monthStats.totalProfit >= 0 ? '+' : ''}R${monthStats.totalProfit.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {monthStats.total} operações • WR: {monthStats.winRate.toFixed(1)}%
        </p>
      </div>

      {chartData.length > 1 && (
        <div className="stat-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">Evolução do P&L</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
              <XAxis dataKey="op" stroke="hsl(215, 15%, 50%)" fontSize={12} />
              <YAxis stroke="hsl(215, 15%, 50%)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 14%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210, 20%, 92%)',
                }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="hsl(199, 89%, 48%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
