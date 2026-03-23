import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { CUENTAS_DEFAULT, TIPOS_CUENTA, TIPO_COLORS, type CuentaCatalogo } from "@/lib/catalogoCuentas";
import { Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CatalogoCuentasProps {
  onSelectCuenta?: (nombre: string) => void;
  mode?: "manage" | "select";
}

const CatalogoCuentas = ({ onSelectCuenta, mode = "manage" }: CatalogoCuentasProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [customCuentas, setCustomCuentas] = useState<CuentaCatalogo[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("Todos");
  const [newCodigo, setNewCodigo] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newTipo, setNewTipo] = useState<CuentaCatalogo["tipo"]>("Activo");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "catalogo_cuentas"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as CuentaCatalogo));
      const sortedData = data.sort((a, b) => a.codigo.localeCompare(b.codigo));
      setCustomCuentas(sortedData);
    });
    return unsub;
  }, [user]);

  const allCuentas: CuentaCatalogo[] = [
    ...CUENTAS_DEFAULT.map(c => ({ ...c, esDefault: true })),
    ...customCuentas,
  ];

  const filtered = allCuentas.filter(c => {
    const matchSearch = c.nombre.toLowerCase().includes(search.toLowerCase()) || c.codigo.includes(search);
    const matchTipo = filterTipo === "Todos" || c.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  const handleAdd = async () => {
    if (!user || !newCodigo || !newNombre) return;
    try {
      await addDoc(collection(db, "catalogo_cuentas"), {
        codigo: newCodigo,
        nombre: newNombre,
        tipo: newTipo,
        esDefault: false,
        userId: user.uid,
        createdAt: Date.now(),
      });
      toast({ title: "✓ Cuenta agregada", description: `${newNombre} se agregó al catálogo.` });
      setNewCodigo(""); setNewNombre(""); setOpen(false);
    } catch {
      toast({ title: "Error", description: "No se pudo agregar la cuenta.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "catalogo_cuentas", id));
      toast({ title: "Cuenta eliminada" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {mode === "manage" && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Catálogo de Cuentas</h2>
            <p className="text-muted-foreground font-body text-sm">Cuentas contables predefinidas y personalizadas</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-body">
                <Plus className="h-4 w-4 mr-2" /> Nueva Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Agregar Cuenta al Catálogo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4 font-body">
                <div>
                  <label className="text-sm font-medium">Código</label>
                  <Input value={newCodigo} onChange={(e) => setNewCodigo(e.target.value)} placeholder="1107" />
                </div>
                <div>
                  <label className="text-sm font-medium">Nombre de la Cuenta</label>
                  <Input value={newNombre} onChange={(e) => setNewNombre(e.target.value)} placeholder="Nombre de la cuenta" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {TIPOS_CUENTA.map(t => (
                      <button key={t} onClick={() => setNewTipo(t)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${newTipo === t ? TIPO_COLORS[t] : "bg-muted/50 text-muted-foreground border-border"}`}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAdd} disabled={!newCodigo || !newNombre} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Guardar Cuenta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cuenta..." className="pl-10" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {["Todos", ...TIPOS_CUENTA].map(t => (
            <button key={t} onClick={() => setFilterTipo(t)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${filterTipo === t ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="text-left px-4 py-3 font-semibold">Código</th>
              <th className="text-left px-4 py-3 font-semibold">Cuenta</th>
              <th className="text-left px-4 py-3 font-semibold">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold">Origen</th>
              {mode === "manage" && <th className="px-4 py-3 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No se encontraron cuentas.</td></tr>
            )}
            {filtered.map((c, i) => (
              <tr key={`${c.codigo}-${c.nombre}`}
                className={`${i % 2 === 0 ? "bg-card" : "bg-muted/30"} ${mode === "select" ? "cursor-pointer hover:bg-accent/5" : ""}`}
                onClick={mode === "select" ? () => onSelectCuenta?.(c.nombre) : undefined}
              >
                <td className="px-4 py-2 font-mono text-xs font-semibold">{c.codigo}</td>
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${TIPO_COLORS[c.tipo]}`}>{c.tipo}</span>
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{c.esDefault ? "Predefinida" : "Personalizada"}</td>
                {mode === "manage" && (
                  <td className="px-4 py-2">
                    {!c.esDefault && c.id && (
                      <button onClick={() => handleDelete(c.id!)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogoCuentas;
