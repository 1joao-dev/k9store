export interface Trade {
  id: string;
  date: string;
  time: string;
  asset: string;
  type: 'CALL' | 'PUT';
  amount: number;
  result: 'WIN' | 'LOSS';
  payout: number;
  observation: string;
}

export interface BankConfig {
  initialBalance: number;
  currentBalance: number;
  dailyGoal: number;
  dailyStopLoss: number;
  dailyStopWin: number;
}

export interface Strategy {
  id: string;
  name: string;
  steps: string[];
}

export interface TradingSession {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

const TRADES_KEY = 'tradetrack_trades';
const BANK_KEY = 'tradetrack_bank';
const STRATEGIES_KEY = 'tradetrack_strategies';
const SESSIONS_KEY = 'tradetrack_sessions';

export function getTrades(): Trade[] {
  const data = localStorage.getItem(TRADES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTrades(trades: Trade[]) {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
}

export function addTrade(trade: Omit<Trade, 'id'>): Trade {
  const trades = getTrades();
  const newTrade: Trade = { ...trade, id: crypto.randomUUID() };
  trades.unshift(newTrade);
  saveTrades(trades);
  return newTrade;
}

export function deleteTrade(id: string) {
  const trades = getTrades().filter(t => t.id !== id);
  saveTrades(trades);
}

export function getBankConfig(): BankConfig {
  const data = localStorage.getItem(BANK_KEY);
  return data ? JSON.parse(data) : {
    initialBalance: 500,
    currentBalance: 500,
    dailyGoal: 150,
    dailyStopLoss: 100,
    dailyStopWin: 200,
  };
}

export function saveBankConfig(config: BankConfig) {
  localStorage.setItem(BANK_KEY, JSON.stringify(config));
}

export function getStrategies(): Strategy[] {
  const data = localStorage.getItem(STRATEGIES_KEY);
  return data ? JSON.parse(data) : [
    { id: '1', name: 'MHI', steps: ['1ª vela', '2ª vela', '3ª vela', 'Operar contra a maioria'] },
    { id: '2', name: 'Pullback', steps: ['Confirmar suporte', 'Esperar rejeição', 'Entrar próxima vela'] },
  ];
}

export function saveStrategies(strategies: Strategy[]) {
  localStorage.setItem(STRATEGIES_KEY, JSON.stringify(strategies));
}

export function getSessions(): TradingSession[] {
  const data = localStorage.getItem(SESSIONS_KEY);
  return data ? JSON.parse(data) : [
    { id: '1', name: 'Sessão Londres', startTime: '08:00', endTime: '11:00', active: true },
    { id: '2', name: 'Sessão Nova York', startTime: '10:30', endTime: '13:30', active: true },
    { id: '3', name: 'Sessão OTC', startTime: '19:00', endTime: '22:00', active: true },
  ];
}

export function saveSessions(sessions: TradingSession[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getTodayTrades(): Trade[] {
  const today = new Date().toISOString().split('T')[0];
  return getTrades().filter(t => t.date === today);
}

export function calculateStats(trades: Trade[]) {
  const wins = trades.filter(t => t.result === 'WIN').length;
  const losses = trades.filter(t => t.result === 'LOSS').length;
  const total = trades.length;
  const winRate = total > 0 ? (wins / total) * 100 : 0;
  const totalProfit = trades.reduce((sum, t) => sum + (t.result === 'WIN' ? t.payout : -t.amount), 0);

  let maxWinStreak = 0, maxLossStreak = 0, currentWin = 0, currentLoss = 0;
  for (const t of [...trades].reverse()) {
    if (t.result === 'WIN') { currentWin++; currentLoss = 0; maxWinStreak = Math.max(maxWinStreak, currentWin); }
    else { currentLoss++; currentWin = 0; maxLossStreak = Math.max(maxLossStreak, currentLoss); }
  }

  return { wins, losses, total, winRate, totalProfit, maxWinStreak, maxLossStreak };
}

export function getDailyPnL(): number {
  return getTodayTrades().reduce((sum, t) => sum + (t.result === 'WIN' ? t.payout : -t.amount), 0);
}

export function exportToCSV(trades: Trade[]): string {
  const header = 'Data,Hora,Ativo,Tipo,Entrada,Resultado,Lucro,Observação\n';
  const rows = trades.map(t =>
    `${t.date},${t.time},${t.asset},${t.type},${t.amount},${t.result},${t.result === 'WIN' ? t.payout : -t.amount},${t.observation}`
  ).join('\n');
  return header + rows;
}
