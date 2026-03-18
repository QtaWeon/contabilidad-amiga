export interface CuentaCatalogo {
  id?: string;
  codigo: string;
  nombre: string;
  tipo: "Activo" | "Pasivo" | "Capital" | "Ingreso" | "Costo" | "Gasto";
  esDefault?: boolean;
  userId?: string;
  createdAt?: number;
}

export const CUENTAS_DEFAULT: Omit<CuentaCatalogo, "id" | "userId" | "createdAt">[] = [
  // Activos
  { codigo: "1101", nombre: "Caja", tipo: "Activo", esDefault: true },
  { codigo: "1102", nombre: "Bancos", tipo: "Activo", esDefault: true },
  { codigo: "1103", nombre: "Clientes", tipo: "Activo", esDefault: true },
  { codigo: "1104", nombre: "Documentos por Cobrar", tipo: "Activo", esDefault: true },
  { codigo: "1105", nombre: "Inventario de Mercadería", tipo: "Activo", esDefault: true },
  { codigo: "1106", nombre: "IVA por Cobrar", tipo: "Activo", esDefault: true },
  { codigo: "1201", nombre: "Terrenos", tipo: "Activo", esDefault: true },
  { codigo: "1202", nombre: "Edificios", tipo: "Activo", esDefault: true },
  { codigo: "1203", nombre: "Mobiliario y Equipo", tipo: "Activo", esDefault: true },
  { codigo: "1204", nombre: "Vehículos", tipo: "Activo", esDefault: true },
  { codigo: "1205", nombre: "Equipo de Computación", tipo: "Activo", esDefault: true },
  { codigo: "1301", nombre: "Depreciación Acumulada", tipo: "Activo", esDefault: true },
  // Pasivos
  { codigo: "2101", nombre: "Proveedores", tipo: "Pasivo", esDefault: true },
  { codigo: "2102", nombre: "Documentos por Pagar", tipo: "Pasivo", esDefault: true },
  { codigo: "2103", nombre: "Acreedores", tipo: "Pasivo", esDefault: true },
  { codigo: "2104", nombre: "IVA por Pagar", tipo: "Pasivo", esDefault: true },
  { codigo: "2105", nombre: "ISR por Pagar", tipo: "Pasivo", esDefault: true },
  { codigo: "2106", nombre: "Sueldos por Pagar", tipo: "Pasivo", esDefault: true },
  { codigo: "2201", nombre: "Préstamos Bancarios", tipo: "Pasivo", esDefault: true },
  { codigo: "2202", nombre: "Hipotecas por Pagar", tipo: "Pasivo", esDefault: true },
  // Capital
  { codigo: "3101", nombre: "Capital", tipo: "Capital", esDefault: true },
  { codigo: "3102", nombre: "Reserva Legal", tipo: "Capital", esDefault: true },
  { codigo: "3103", nombre: "Utilidades Retenidas", tipo: "Capital", esDefault: true },
  { codigo: "3104", nombre: "Utilidad del Ejercicio", tipo: "Capital", esDefault: true },
  { codigo: "3105", nombre: "Pérdida del Ejercicio", tipo: "Capital", esDefault: true },
  // Ingresos
  { codigo: "4101", nombre: "Ventas", tipo: "Ingreso", esDefault: true },
  { codigo: "4102", nombre: "Productos Financieros", tipo: "Ingreso", esDefault: true },
  { codigo: "4103", nombre: "Otros Ingresos", tipo: "Ingreso", esDefault: true },
  // Costos
  { codigo: "5101", nombre: "Costo de Ventas", tipo: "Costo", esDefault: true },
  { codigo: "5102", nombre: "Compras", tipo: "Costo", esDefault: true },
  { codigo: "5103", nombre: "Gastos sobre Compras", tipo: "Costo", esDefault: true },
  { codigo: "5104", nombre: "Devoluciones sobre Compras", tipo: "Costo", esDefault: true },
  // Gastos
  { codigo: "6101", nombre: "Sueldos y Salarios", tipo: "Gasto", esDefault: true },
  { codigo: "6102", nombre: "Alquileres", tipo: "Gasto", esDefault: true },
  { codigo: "6103", nombre: "Servicios Básicos", tipo: "Gasto", esDefault: true },
  { codigo: "6104", nombre: "Depreciaciones", tipo: "Gasto", esDefault: true },
  { codigo: "6105", nombre: "Gastos Financieros", tipo: "Gasto", esDefault: true },
  { codigo: "6106", nombre: "Papelería y Útiles", tipo: "Gasto", esDefault: true },
  { codigo: "6107", nombre: "Publicidad", tipo: "Gasto", esDefault: true },
];

export const TIPOS_CUENTA = ["Activo", "Pasivo", "Capital", "Ingreso", "Costo", "Gasto"] as const;

export const TIPO_COLORS: Record<string, string> = {
  Activo: "bg-accent/10 text-accent border-accent/30",
  Pasivo: "bg-destructive/10 text-destructive border-destructive/30",
  Capital: "bg-secondary/10 text-secondary border-secondary/30",
  Ingreso: "bg-success/10 text-success border-success/30",
  Costo: "bg-warning/10 text-warning border-warning/30",
  Gasto: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/30",
};
