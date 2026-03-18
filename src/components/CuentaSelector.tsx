import { useState, useEffect, useRef } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { CUENTAS_DEFAULT, TIPO_COLORS, type CuentaCatalogo } from "@/lib/catalogoCuentas";
import { Input } from "@/components/ui/input";

interface CuentaSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CuentaSelector = ({ value, onChange, placeholder = "Nombre de cuenta" }: CuentaSelectorProps) => {
  const { user } = useAuth();
  const [customCuentas, setCustomCuentas] = useState<CuentaCatalogo[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setSearch(value); }, [value]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "catalogo_cuentas"), where("userId", "==", user.uid), orderBy("codigo"));
    const unsub = onSnapshot(q, (snap) => {
      setCustomCuentas(snap.docs.map(d => ({ id: d.id, ...d.data() } as CuentaCatalogo)));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allCuentas = [...CUENTAS_DEFAULT, ...customCuentas];
  const filtered = allCuentas.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) || c.codigo.includes(search)
  ).slice(0, 10);

  return (
    <div ref={ref} className="relative">
      <Input
        value={search}
        onChange={(e) => { setSearch(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(c => (
            <button key={`${c.codigo}-${c.nombre}`}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 flex items-center gap-2 font-body"
              onMouseDown={(e) => { e.preventDefault(); onChange(c.nombre); setSearch(c.nombre); setOpen(false); }}
            >
              <span className="font-mono text-xs text-muted-foreground w-10">{c.codigo}</span>
              <span className="flex-1">{c.nombre}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TIPO_COLORS[c.tipo]}`}>{c.tipo}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuentaSelector;
