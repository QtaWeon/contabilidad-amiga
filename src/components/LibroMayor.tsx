import type { AsientoContable, CuentaMayor } from "@/types/accounting";

interface LibroMayorProps {
  asientos: AsientoContable[];
}

const LibroMayor = ({ asientos }: LibroMayorProps) => {
  // Build T-accounts from asientos
  const cuentas: Record<string, CuentaMayor> = {};

  asientos.forEach((asiento) => {
    asiento.partidas.forEach((partida) => {
      const nombre = partida.cuenta.trim();
      if (!nombre) return;
      if (!cuentas[nombre]) {
        cuentas[nombre] = { nombre, movimientos: [] };
      }
      cuentas[nombre].movimientos.push({
        fecha: asiento.fecha,
        descripcion: asiento.descripcion,
        debe: partida.debe,
        haber: partida.haber,
        asientoId: asiento.id || "",
      });
    });
  });

  const cuentasList = Object.values(cuentas).sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Libro Mayor</h2>
        <p className="text-muted-foreground font-body text-sm">Cuentas T — Resumen por cuenta contable</p>
      </div>

      {cuentasList.length === 0 && (
        <div className="bg-card rounded-lg border shadow-sm p-12 text-center text-muted-foreground font-body">
          No hay cuentas para mostrar. Registra partidas en el Libro Diario primero.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cuentasList.map((cuenta) => {
          const totalDebe = cuenta.movimientos.reduce((s, m) => s + m.debe, 0);
          const totalHaber = cuenta.movimientos.reduce((s, m) => s + m.haber, 0);
          const saldo = totalDebe - totalHaber;

          return (
            <div key={cuenta.nombre} className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-3 font-display font-semibold text-center">
                {cuenta.nombre}
              </div>
              <div className="grid grid-cols-2 divide-x">
                {/* DEBE */}
                <div>
                  <div className="bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground uppercase text-center font-body">
                    Debe
                  </div>
                  {cuenta.movimientos.filter(m => m.debe > 0).map((m, i) => (
                    <div key={i} className={`px-3 py-2 text-sm font-body flex justify-between ${i % 2 === 1 ? "bg-muted/30" : ""}`}>
                      <span className="text-muted-foreground text-xs">{m.fecha}</span>
                      <span className="tabular-nums">Q{m.debe.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="px-3 py-2 border-t font-semibold text-sm font-body text-right tabular-nums">
                    Q{totalDebe.toFixed(2)}
                  </div>
                </div>
                {/* HABER */}
                <div>
                  <div className="bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground uppercase text-center font-body">
                    Haber
                  </div>
                  {cuenta.movimientos.filter(m => m.haber > 0).map((m, i) => (
                    <div key={i} className={`px-3 py-2 text-sm font-body flex justify-between ${i % 2 === 1 ? "bg-muted/30" : ""}`}>
                      <span className="text-muted-foreground text-xs">{m.fecha}</span>
                      <span className="tabular-nums">Q{m.haber.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="px-3 py-2 border-t font-semibold text-sm font-body text-right tabular-nums">
                    Q{totalHaber.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 text-center text-sm font-body font-bold border-t ${saldo >= 0 ? "text-success" : "text-destructive"}`}>
                Saldo: Q{Math.abs(saldo).toFixed(2)} {saldo >= 0 ? "(Deudor)" : "(Acreedor)"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibroMayor;
