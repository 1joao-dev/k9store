import { useState } from "react";
import { getSessions, saveSessions, type TradingSession } from "@/lib/tradeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Clock, Plus, Trash2 } from "lucide-react";

export default function Sessions() {
  const [sessions, setSessions] = useState<TradingSession[]>(getSessions());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startTime: '08:00', endTime: '11:00' });

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isInSession = (s: TradingSession) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    return currentMinutes >= start && currentMinutes <= end;
  };

  const handleAdd = () => {
    const newSession: TradingSession = { id: crypto.randomUUID(), ...form, active: true };
    const updated = [...sessions, newSession];
    setSessions(updated);
    saveSessions(updated);
    setShowForm(false);
    setForm({ name: '', startTime: '08:00', endTime: '11:00' });
  };

  const toggleActive = (id: string) => {
    const updated = sessions.map(s => s.id === id ? { ...s, active: !s.active } : s);
    setSessions(updated);
    saveSessions(updated);
  };

  const handleDelete = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Horários de Operação</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Sessão
        </Button>
      </div>

      {showForm && (
        <div className="stat-card space-y-3">
          <Input placeholder="Nome da sessão" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Início</label>
              <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Fim</label>
              <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleAdd}>Salvar</Button>
        </div>
      )}

      <div className="grid gap-4">
        {sessions.map(s => {
          const live = isInSession(s) && s.active;
          return (
            <div key={s.id} className={`stat-card flex items-center justify-between ${live ? 'border-profit/50 glow-primary' : ''}`}>
              <div className="flex items-center gap-4">
                <Clock className={`h-5 w-5 ${live ? 'text-profit' : 'text-muted-foreground'}`} />
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {s.startTime} - {s.endTime}
                  </p>
                </div>
                {live && (
                  <span className="text-xs font-bold profit-bg px-2 py-1 rounded animate-pulse">
                    AO VIVO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={s.active} onCheckedChange={() => toggleActive(s.id)} />
                <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                  <Trash2 className="h-4 w-4 text-loss" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
