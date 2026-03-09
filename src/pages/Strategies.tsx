import { useState } from "react";
import { getStrategies, saveStrategies, type Strategy } from "@/lib/tradeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, BookOpen } from "lucide-react";

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>(getStrategies());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', steps: '' });

  const handleAdd = () => {
    const newStrategy: Strategy = {
      id: crypto.randomUUID(),
      name: form.name,
      steps: form.steps.split('\n').filter(s => s.trim()),
    };
    const updated = [...strategies, newStrategy];
    setStrategies(updated);
    saveStrategies(updated);
    setShowForm(false);
    setForm({ name: '', steps: '' });
  };

  const handleDelete = (id: string) => {
    const updated = strategies.filter(s => s.id !== id);
    setStrategies(updated);
    saveStrategies(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estratégias</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova
        </Button>
      </div>

      {showForm && (
        <div className="stat-card space-y-3">
          <Input placeholder="Nome da estratégia" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <textarea
            className="w-full bg-muted border border-border rounded-lg p-3 text-sm text-foreground resize-none"
            rows={4}
            placeholder="Passos (um por linha)"
            value={form.steps}
            onChange={e => setForm({ ...form, steps: e.target.value })}
          />
          <Button onClick={handleAdd}>Salvar</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {strategies.map(s => (
          <div key={s.id} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="font-bold">{s.name}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                <Trash2 className="h-4 w-4 text-loss" />
              </Button>
            </div>
            <ol className="space-y-1">
              {s.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary font-mono text-xs mt-0.5">{i + 1}.</span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
