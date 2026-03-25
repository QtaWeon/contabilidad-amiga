import { useState, useMemo } from "react";
import { Plus, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MovimientoKardex, KardexLinea } from "@/types/accounting";
import { formatCurrency } from "@/lib/currency";
import { CURRENCY_CONFIG } from "@/lib/currency";
import { exportKardexPDF } from "@/lib/pdfExport";

interface KardexFIFOProps {
  movimientos: MovimientoKardex[];
  onAddMovimiento: (mov: Omit<MovimientoKardex, "id" | "createdAt" | "userId">) => void;
}

interface LoteFIFO {
  cantidad: number;
  costoUnitario: number;
}

const calcularKardex = (movimientos: MovimientoKardex[], productoId: string): KardexLinea[] => {
  const movs = movimientos
    .filter(m => m.productoId === productoId)
    .sort((a, b) => {
      const dateComp = a.fecha.localeCompare(b.fecha);
      if (dateComp !== 0) return dateComp;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

  const lotes: LoteFIFO[] = [];
  const lineas: KardexLinea[] = [];

  for (const mov of movs) {
    if (mov.tipo === "compra") {
      lotes.push({ cantidad: mov.cantidad, costoUnitario: mov.costoUnitario });
      const saldoCantidad = lotes.reduce((s, l) => s + l.cantidad, 0);
      const saldoTotal = lotes.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);

      lineas.push({
        fecha: mov.fecha,
        descripcion: mov.descripcion,
        tipo: "compra",
        entradaCantidad: mov.cantidad,
        entradaCosto: mov.costoUnitario,
        entradaTotal: mov.cantidad * mov.costoUnitario,
        salidaCantidad: 0,
        salidaCosto: 0,
        salidaTotal: 0,
        saldoCantidad,
        saldoCosto: saldoCantidad > 0 ? saldoTotal / saldoCantidad : 0,
        saldoTotal,
      });
    } else {
      // FIFO: sell from oldest lots first
      let remaining = mov.cantidad;
      let totalCostoSalida = 0;

      while (remaining > 0 && lotes.length > 0) {
        const lote = lotes[0];
        const taken = Math.min(remaining, lote.cantidad);
        totalCostoSalida += taken * lote.costoUnitario;
        lote.cantidad -= taken;
        remaining -= taken;
        if (lote.cantidad <= 0) lotes.shift();
      }

      const actualSold = mov.cantidad - remaining;
      const costoPromSalida = actualSold > 0 ? totalCostoSalida / actualSold : 0;
      const saldoCantidad = lotes.reduce((s, l) => s + l.cantidad, 0);
      const saldoTotal = lotes.reduce((s, l) => s + l.cantidad * l.costoUnitario, 0);

      lineas.push({
        fecha: mov.fecha,
        descripcion: mov.descripcion,
        tipo: "venta",
        entradaCantidad: 0,
        entradaCosto: 0,
        entradaTotal: 0,
        salidaCantidad: actualSold,
        salidaCosto: costoPromSalida,
        salidaTotal: totalCostoSalida,
        saldoCantidad,
        saldoCosto: saldoCantidad > 0 ? saldoTotal / saldoCantidad : 0,
        saldoTotal,
      });
    }
  }

  return lineas;
};

const KardexFIFO = ({ movimientos, onAddMovimiento }: KardexFIFOProps) => {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"compra" | "venta">("compra");
  const [cantidad, setCantidad] = useState(0);
  const [costoUnitario, setCostoUnitario] = useState(0);
  const [productoId, setProductoId] = useState("");
  const [productoNombre, setProductoNombre] = useState("");
  const [selectedProducto, setSelectedProducto] = useState<string>("all");

  // Get unique products
  const productos = useMemo(() => {
    const map = new Map<string, string>();
    movimientos.forEach(m => map.set(m.productoId, m.productoNombre));
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [movimientos]);

  const kardexLineas = useMemo(() => {
    if (selectedProducto === "all") return [];
    return calcularKardex(movimientos, selectedProducto);
  }, [movimientos, selectedProducto]);

  const handleSubmit = () => {
    if (!fecha || !descripcion || cantidad <= 0 || !productoId || !productoNombre) return;
    if (tipo === "compra" && costoUnitario <= 0) return;
    onAddMovimiento({ fecha, descripcion, tipo, cantidad, costoUnitario, productoId, productoNombre });
    setFecha("");
    setDescripcion("");
    setCantidad(0);
    setCostoUnitario(0);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Kardex FIFO</h2>
          <p className="text-muted-foreground font-body text-sm">Control de inventario — Método Primeras Entradas, Primeras Salidas</p>
        </div>
        <div className="flex gap-2">
          {kardexLineas.length > 0 && selectedProducto !== "all" && (
            <Button variant="outline" onClick={() => {
              const prod = productos.find(p => p.id === selectedProducto);
              exportKardexPDF(kardexLineas, prod?.nombre || "Producto");
            }} className="font-body">
              <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
                <Plus className="h-4 w-4 mr-2" /> Nuevo Movimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Registrar Movimiento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 font-body">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Fecha</label>
                    <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <Select value={tipo} onValueChange={(v) => setTipo(v as "compra" | "venta")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compra">Compra (Entrada)</SelectItem>
                        <SelectItem value="venta">Venta (Salida)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ID Producto</label>
                    <Input value={productoId} onChange={(e) => setProductoId(e.target.value)} placeholder="PROD-001" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Nombre Producto</label>
                    <Input value={productoNombre} onChange={(e) => setProductoNombre(e.target.value)} placeholder="Mercadería A" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Compra según factura #..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Cantidad</label>
                    <Input type="number" min="1" value={cantidad || ""} onChange={(e) => setCantidad(Number(e.target.value))} />
                  </div>
                  {tipo === "compra" && (
                    <div>
                      <label className="text-sm font-medium">Costo Unitario ({CURRENCY_CONFIG.symbol})</label>
                      <Input type="number" min="0" step="0.01" value={costoUnitario || ""} onChange={(e) => setCostoUnitario(Number(e.target.value))} />
                    </div>
                  )}
                </div>
                {tipo === "compra" && (
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    Total entrada: {formatCurrency(cantidad * costoUnitario)}
                  </div>
                )}
                <Button onClick={handleSubmit} disabled={!fecha || !descripcion || cantidad <= 0 || !productoId || !productoNombre || (tipo === "compra" && costoUnitario <= 0)} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Registrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Product selector */}
      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium font-body text-foreground">Producto:</label>
        <Select value={selectedProducto} onValueChange={setSelectedProducto}>
          <SelectTrigger className="w-[300px]"><SelectValue placeholder="Selecciona un producto" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">— Selecciona un producto —</SelectItem>
            {productos.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.nombre} ({p.id})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProducto === "all" ? (
        <div className="bg-card rounded-lg border shadow-sm p-12 text-center text-muted-foreground font-body">
          {productos.length === 0
            ? 'No hay movimientos registrados. Haz clic en "Nuevo Movimiento" para comenzar.'
            : "Selecciona un producto para ver su Kardex."}
        </div>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm overflow-x-auto">
          <table className="w-full font-body text-sm min-w-[900px]">
            <thead>
              <tr className="bg-muted">
                <th rowSpan={2} className="text-left px-3 py-2 font-semibold border-r">Fecha</th>
                <th rowSpan={2} className="text-left px-3 py-2 font-semibold border-r">Descripción</th>
                <th colSpan={3} className="text-center px-3 py-2 font-semibold border-r bg-success/10 text-success">Entradas</th>
                <th colSpan={3} className="text-center px-3 py-2 font-semibold border-r bg-destructive/10 text-destructive">Salidas</th>
                <th colSpan={3} className="text-center px-3 py-2 font-semibold bg-accent/10 text-accent">Saldo</th>
              </tr>
              <tr className="bg-muted/70 text-xs">
                <th className="px-2 py-1 text-right border-r font-medium">Cant.</th>
                <th className="px-2 py-1 text-right border-r font-medium">C.Unit.</th>
                <th className="px-2 py-1 text-right border-r font-medium">Total</th>
                <th className="px-2 py-1 text-right border-r font-medium">Cant.</th>
                <th className="px-2 py-1 text-right border-r font-medium">C.Unit.</th>
                <th className="px-2 py-1 text-right border-r font-medium">Total</th>
                <th className="px-2 py-1 text-right border-r font-medium">Cant.</th>
                <th className="px-2 py-1 text-right border-r font-medium">C.Unit.</th>
                <th className="px-2 py-1 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {kardexLineas.length === 0 && (
                <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">Sin movimientos para este producto.</td></tr>
              )}
              {kardexLineas.map((l, i) => (
                <tr key={i} className={`${i % 2 === 0 ? "bg-card" : "bg-muted/30"} ${l.tipo === "compra" ? "border-l-2 border-l-success" : "border-l-2 border-l-destructive"}`}>
                  <td className="px-3 py-2 border-r whitespace-nowrap">{l.fecha}</td>
                  <td className="px-3 py-2 border-r">{l.descripcion}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r">{l.entradaCantidad > 0 ? l.entradaCantidad : ""}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r">{l.entradaCantidad > 0 ? formatCurrency(l.entradaCosto) : ""}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r font-medium">{l.entradaCantidad > 0 ? formatCurrency(l.entradaTotal) : ""}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r">{l.salidaCantidad > 0 ? l.salidaCantidad : ""}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r">{l.salidaCantidad > 0 ? formatCurrency(l.salidaCosto) : ""}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r font-medium">{l.salidaCantidad > 0 ? formatCurrency(l.salidaTotal) : ""}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r font-semibold">{l.saldoCantidad}</td>
                  <td className="px-2 py-2 text-right tabular-nums border-r">{formatCurrency(l.saldoCosto)}</td>
                  <td className="px-2 py-2 text-right tabular-nums font-bold">{formatCurrency(l.saldoTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KardexFIFO;
