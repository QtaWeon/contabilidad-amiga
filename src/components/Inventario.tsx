import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { CURRENCY_CONFIG } from "@/lib/currency";
import { Plus, Trash2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ItemInventario } from "@/types/accounting";
import { exportInventarioPDF } from "@/lib/pdfExport";

interface InventarioProps {
  items: ItemInventario[];
  onAddItem: (item: Omit<ItemInventario, "id" | "createdAt" | "costoTotal">) => void;
  onDeleteItem: (id: string) => void;
}

const Inventario = ({ items, onAddItem, onDeleteItem }: InventarioProps) => {
  const [open, setOpen] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [costoUnitario, setCostoUnitario] = useState(0);
  const [categoria, setCategoria] = useState("");

  const handleSubmit = () => {
    if (!codigo || !descripcion || cantidad <= 0 || costoUnitario <= 0) return;
    onAddItem({ codigo, descripcion, cantidad, costoUnitario, categoria });
    setCodigo("");
    setDescripcion("");
    setCantidad(0);
    setCostoUnitario(0);
    setCategoria("");
    setOpen(false);
  };

  const totalInventario = items.reduce((s, i) => s + i.costoTotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Inventario</h2>
          <p className="text-muted-foreground font-body text-sm">Control de bienes y mercadería</p>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <Button variant="outline" onClick={() => exportInventarioPDF(items)} className="font-body">
              <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Artículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Nuevo Artículo de Inventario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 font-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Código</label>
                  <Input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="INV-001" />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <Input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Mobiliario" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción del artículo" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cantidad</label>
                  <Input type="number" min="1" value={cantidad || ""} onChange={(e) => setCantidad(Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium">Costo Unitario ({CURRENCY_CONFIG.symbol})</label>
                  <Input type="number" min="0" step="0.01" value={costoUnitario || ""} onChange={(e) => setCostoUnitario(Number(e.target.value))} />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm font-semibold">
                  Total: {formatCurrency(cantidad * costoUnitario)}
                </span>
                <Button onClick={handleSubmit} disabled={!codigo || !descripcion || cantidad <= 0 || costoUnitario <= 0} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Guardar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left px-4 py-3 font-semibold">Código</th>
              <th className="text-left px-4 py-3 font-semibold">Descripción</th>
              <th className="text-left px-4 py-3 font-semibold">Categoría</th>
              <th className="text-right px-4 py-3 font-semibold">Cantidad</th>
              <th className="text-right px-4 py-3 font-semibold">Costo Unit.</th>
              <th className="text-right px-4 py-3 font-semibold">Costo Total</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  No hay artículos en el inventario. Haz clic en "Nuevo Artículo" para agregar.
                </td>
              </tr>
            )}
            {items.map((item, i) => (
              <tr key={item.id} className={i % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                <td className="px-4 py-2 font-medium">{item.codigo}</td>
                <td className="px-4 py-2">{item.descripcion}</td>
                <td className="px-4 py-2 text-muted-foreground">{item.categoria}</td>
                <td className="px-4 py-2 text-right tabular-nums">{item.cantidad}</td>
                <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(item.costoUnitario)}</td>
                <td className="px-4 py-2 text-right tabular-nums font-semibold">{formatCurrency(item.costoTotal)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => item.id && onDeleteItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {items.length > 0 && (
            <tfoot>
              <tr className="border-t bg-muted">
                <td colSpan={5} className="px-4 py-3 text-right font-semibold">Total Inventario:</td>
                <td className="px-4 py-3 text-right font-bold tabular-nums">{formatCurrency(totalInventario)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default Inventario;
