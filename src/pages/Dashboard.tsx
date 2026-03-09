import { useState, useEffect } from "react";
import { getTodayTrades, calculateStats, getBankConfig, getDailyPnL, getSessions } from "@/lib/tradeStore";
import { TrendingUp, TrendingDown, Target, Clock, BarChart3, Activity } from "lucide-react";

export default function Dashboard() {
  const [, setTick] = useState(0);
  useEffect(() => { setTick(1); }, []);

  const todayTrades = getTodayTrades();
  const todayStats = calculateStats(todayTrades);
  const bank = getBankConfig();
  const dailyPnL = getDailyPnL();
  const sessions = getSessions();

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextSession = sessions
    .filter(s => s.active)
    .map(s => {
      const [h, m] = s.startTime.split(':').map(Number);
      return { ...s, minutes: h * 60 + m };
    })
    .filter(s => s.minutes > currentMinutes)
    .sort((a, b) => a.minutes - b.minutes)[0];

  const pnlPositive = dailyPnL >= 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Saldo Atual</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono">
            R${bank.currentBalance.toFixed(2)}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Lucro/Prejuízo Hoje</span>
            {pnlPositive ? <TrendingUp className="h-4 w-4 text-profit" /> : <TrendingDown className="h-4 w-4 text-loss" />}
          </div>
          <p className={`text-2xl font-bold font-mono ${pnlPositive ? 'profit-text' : 'loss-text'}`}>
            {pnlPositive ? '+' : ''}R${dailyPnL.toFixed(2)}
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Meta Diária</span>
            <Target className="h-4 w-4 text-warning" />
          </div>
          <p className="text-2xl font-bold font-mono">R${bank.dailyGoal.toFixed(2)}</p>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (dailyPnL / bank.dailyGoal) * 100)}%`,
                backgroundColor: dailyPnL >= bank.dailyGoal ? 'hsl(var(--profit))' : 'hsl(var(--primary))',
              }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Operações Hoje</span>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold font-mono">{todayStats.total}</p>
          <div className="flex gap-3 mt-1 text-sm font-mono">
            <span className="profit-text">W: {todayStats.wins}</span>
            <span className="loss-text">L: {todayStats.losses}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Win Rate Hoje</span>
            <BarChart3 className="h-4 w-4 text-profit" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {todayStats.winRate.toFixed(1)}%
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Próximo Horário</span>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <p className="text-2xl font-bold font-mono">
            {nextSession ? nextSession.startTime : '--:--'}
          </p>
          {nextSession && (
            <p className="text-xs text-muted-foreground mt-1">{nextSession.name}</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {dailyPnL <= -bank.dailyStopLoss && (
        <div className="loss-bg rounded-lg p-4 flex items-center gap-3 font-semibold">
          ⚠️ Stop Loss atingido! Pare de operar.
        </div>
      )}
      {dailyPnL >= bank.dailyStopWin && (
        <div className="profit-bg rounded-lg p-4 flex items-center gap-3 font-semibold">
          🎯 Stop Win atingido! Meta batida!
        </div>
      )}
      {todayStats.maxLossStreak >= 3 && (
        <div className="warning-bg rounded-lg p-4 flex items-center gap-3 font-semibold">
          ⚠️ {todayStats.maxLossStreak} LOSS seguidos. Considere parar.
        </div>
      )}
    </div>
  );
}
