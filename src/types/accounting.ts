export interface AsientoContable {
  id?: string;
  fecha: string;
  descripcion: string;
  partidas: Partida[];
  createdAt?: number;
}

export interface Partida {
  cuenta: string;
  debe: number;
  haber: number;
}

export interface CuentaMayor {
  nombre: string;
  movimientos: MovimientoMayor[];
}

export interface MovimientoMayor {
  fecha: string;
  descripcion: string;
  debe: number;
  haber: number;
  asientoId: string;
}

export interface ItemInventario {
  id?: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  categoria: string;
  createdAt?: number;
}

export interface MovimientoKardex {
  id?: string;
  fecha: string;
  descripcion: string;
  tipo: "compra" | "venta";
  cantidad: number;
  costoUnitario: number;
  productoId: string;
  productoNombre: string;
  userId?: string;
  createdAt?: number;
}

export interface KardexLinea {
  movimientoId: string;
  fecha: string;
  descripcion: string;
  tipo: "compra" | "venta";
  entradaCantidad: number;
  entradaCosto: number;
  entradaTotal: number;
  salidaCantidad: number;
  salidaCosto: number;
  salidaTotal: number;
  saldoCantidad: number;
  saldoCosto: number;
  saldoTotal: number;
}
