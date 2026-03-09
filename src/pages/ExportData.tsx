import { getTrades, exportToCSV } from "@/lib/tradeStore";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportData() {
  const trades = getTrades();

  const handleExportCSV = () => {
    const csv = exportToCSV(trades);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradetrack_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exportar Dados</h2>

      <div className="stat-card max-w-md space-y-4">
        <p className="text-muted-foreground">
          {trades.length} operações registradas
        </p>

        <Button onClick={handleExportCSV} className="w-full" disabled={trades.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>
    </div>
  );
}
