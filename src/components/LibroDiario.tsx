import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { AsientoContable, Partida } from "@/types/accounting";

interface LibroDiarioProps {
  asientos: AsientoContable[];
  onAddAsiento: (asiento: Omit<AsientoContable, "id" | "createdAt">) => void;
  onDeleteAsiento: (id: string) => void;
}

const LibroDiario = ({ asientos, onAddAsiento, onDeleteAsiento }: LibroDiarioProps) => {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [partidas, setPartidas] = useState<Partida[]>([
    { cuenta: "", debe: 0, haber: 0 },
    { cuenta: "", debe: 0, haber: 0 },
  ]);

  const addPartida = () => {
    setPartidas([...partidas, { cuenta: "", debe: 0, haber: 0 }]);
  };

  const removePartida = (index: number) => {
    if (partidas.length > 2) {
      setPartidas(partidas.filter((_, i) => i !== index));
    }
  };

  const updatePartida = (index: number, field: keyof Partida, value: string | number) => {
    const updated = [...partidas];
    if (field === "cuenta") {
      updated[index][field] = value as string;
    } else {
      updated[index][field] = Number(value) || 0;
    }
    setPartidas(updated);
  };

  const totalDebe = partidas.reduce((sum, p) => sum + p.debe, 0);
  const totalHaber = partidas.reduce((sum, p) => sum + p.haber, 0);
  const isBalanced = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;

  const handleSubmit = () => {
    if (!fecha || !descripcion || !isBalanced) return;
    onAddAsiento({ fecha, descripcion, partidas });
    setFecha("");
    setDescripcion("");
    setPartidas([
      { cuenta: "", debe: 0, haber: 0 },
      { cuenta: "", debe: 0, haber: 0 },
    ]);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Libro Diario</h2>
          <p className="text-muted-foreground font-body text-sm">Registro cronológico de transacciones contables</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
              <Plus className="h-4 w-4 mr-2" /> Nueva Partida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Nueva Partida Contable</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 font-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Fecha</label>
                  <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Descripción</label>
                  <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Concepto de la partida" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2 text-xs font-semibold text-muted-foreground uppercase">
                  <span>Cuenta</span>
                  <span className="text-right">Debe</span>
                  <span className="text-right">Haber</span>
                  <span></span>
                </div>
                {partidas.map((p, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_100px_40px] gap-2">
                    <Input value={p.cuenta} onChange={(e) => updatePartida(i, "cuenta", e.target.value)} placeholder="Nombre de cuenta" />
                    <Input type="number" min="0" step="0.01" value={p.debe || ""} onChange={(e) => updatePartida(i, "debe", e.target.value)} className="text-right" />
                    <Input type="number" min="0" step="0.01" value={p.haber || ""} onChange={(e) => updatePartida(i, "haber", e.target.value)} className="text-right" />
                    <button onClick={() => removePartida(i)} className="text-muted-foreground hover:text-destructive transition-colors" disabled={partidas.length <= 2}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addPartida} className="font-body">
                <Plus className="h-3 w-3 mr-1" /> Agregar línea
              </Button>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm font-body">
                  <span className={`font-semibold ${isBalanced ? "text-success" : "text-destructive"}`}>
                    Debe: Q{totalDebe.toFixed(2)} | Haber: Q{totalHaber.toFixed(2)}
                    {isBalanced ? " ✓" : " — Descuadrado"}
                  </span>
                </div>
                <Button onClick={handleSubmit} disabled={!isBalanced || !fecha || !descripcion} className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
                  Guardar Partida
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left px-4 py-3 font-semibold text-foreground">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Cuenta</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Descripción</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground">Debe</th>
              <th className="text-right px-4 py-3 font-semibold text-foreground">Haber</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {asientos.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No hay partidas registradas. Haz clic en "Nueva Partida" para comenzar.
                </td>
              </tr>
            )}
            {asientos.map((asiento, asientoIdx) => (
              asiento.partidas.map((partida, partidaIdx) => (
                <tr key={`${asiento.id}-${partidaIdx}`} className={asientoIdx % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                  {partidaIdx === 0 && (
                    <>
                      <td className="px-4 py-2 align-top" rowSpan={asiento.partidas.length}>{asiento.fecha}</td>
                    </>
                  )}
                  <td className={`px-4 py-2 ${partida.haber > 0 && partida.debe === 0 ? "pl-10" : ""}`}>
                    {partida.cuenta}
                  </td>
                  {partidaIdx === 0 && (
                    <td className="px-4 py-2 text-muted-foreground align-top" rowSpan={asiento.partidas.length}>
                      {asiento.descripcion}
                    </td>
                  )}
                  <td className="px-4 py-2 text-right tabular-nums">{partida.debe > 0 ? `Q${partida.debe.toFixed(2)}` : ""}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{partida.haber > 0 ? `Q${partida.haber.toFixed(2)}` : ""}</td>
                  {partidaIdx === 0 && (
                    <td className="px-4 py-2 align-top" rowSpan={asiento.partidas.length}>
                      <button onClick={() => asiento.id && onDeleteAsiento(asiento.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LibroDiario;
