import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import AppSidebar from "@/components/AppSidebar";
import LibroDiario from "@/components/LibroDiario";
import LibroMayor from "@/components/LibroMayor";
import Inventario from "@/components/Inventario";
import KardexFIFO from "@/components/KardexFIFO";
import BalanceBar from "@/components/BalanceBar";
import CatalogoCuentas from "@/components/CatalogoCuentas";
import type { AsientoContable, ItemInventario, MovimientoKardex } from "@/types/accounting";
import { useToast } from "@/hooks/use-toast";

type Module = "diario" | "mayor" | "inventario" | "kardex" | "catalogo";

const Index = () => {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<Module>("diario");
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [inventarioItems, setInventarioItems] = useState<ItemInventario[]>([]);
  const [kardexMovimientos, setKardexMovimientos] = useState<MovimientoKardex[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "asientos"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as AsientoContable[];
      const sortedData = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setAsientos(sortedData);
    }, (error) => {
      console.error("Error loading asientos:", error);
      toast({ title: "Error", description: "No se pudieron cargar los asientos.", variant: "destructive" });
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "inventario"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ItemInventario[];
      const sortedData = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setInventarioItems(sortedData);
    }, (error) => {
      console.error("Error loading inventario:", error);
      toast({ title: "Error", description: "No se pudo cargar el inventario.", variant: "destructive" });
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "kardex"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as MovimientoKardex[];
      const sortedData = data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setKardexMovimientos(sortedData);
    }, (error) => {
      console.error("Error loading kardex:", error);
      toast({ title: "Error", description: "No se pudo cargar el kardex.", variant: "destructive" });
    });
    return unsub;
  }, [user]);

  const handleAddAsiento = async (asiento: Omit<AsientoContable, "id" | "createdAt">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "asientos"), { ...asiento, userId: user.uid, createdAt: Date.now() });
      toast({ title: "✓ Partida registrada", description: "La partida se guardó correctamente." });
    } catch (error) {
      console.error("Error adding asiento:", error);
      toast({ title: "Error", description: "No se pudo guardar la partida.", variant: "destructive" });
    }
  };

  const handleUpdateAsiento = async (id: string, asiento: Omit<AsientoContable, "id" | "createdAt">) => {
    try {
      await updateDoc(doc(db, "asientos", id), { ...asiento });
      toast({ title: "✓ Partida actualizada", description: "Los cambios se guardaron correctamente." });
    } catch (error) {
      console.error("Error updating asiento:", error);
      toast({ title: "Error", description: "No se pudo actualizar la partida.", variant: "destructive" });
    }
  };

  const handleDeleteAsiento = async (id: string) => {
    try {
      await deleteDoc(doc(db, "asientos", id));
      toast({ title: "Partida eliminada" });
    } catch (error) {
      console.error("Error deleting asiento:", error);
      toast({ title: "Error", description: "No se pudo eliminar la partida.", variant: "destructive" });
    }
  };

  const handleAddInventarioItem = async (item: Omit<ItemInventario, "id" | "createdAt" | "costoTotal">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "inventario"), {
        ...item, costoTotal: item.cantidad * item.costoUnitario, userId: user.uid, createdAt: Date.now(),
      });
      toast({ title: "✓ Artículo agregado" });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({ title: "Error", description: "No se pudo guardar el artículo.", variant: "destructive" });
    }
  };

  const handleDeleteInventarioItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "inventario", id));
      toast({ title: "Artículo eliminado" });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({ title: "Error", description: "No se pudo eliminar el artículo.", variant: "destructive" });
    }
  };

  const handleAddKardexMovimiento = async (mov: Omit<MovimientoKardex, "id" | "createdAt" | "userId">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "kardex"), { ...mov, userId: user.uid, createdAt: Date.now() });
      toast({ title: `✓ ${mov.tipo === "compra" ? "Compra" : "Venta"} registrada` });
    } catch (error) {
      console.error("Error adding kardex:", error);
      toast({ title: "Error", description: "No se pudo registrar el movimiento.", variant: "destructive" });
    }
  };

  const totalDebe = asientos.reduce((sum, a) => sum + a.partidas.reduce((s, p) => s + p.debe, 0), 0);
  const totalHaber = asientos.reduce((sum, a) => sum + a.partidas.reduce((s, p) => s + p.haber, 0), 0);

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 p-8 pb-20 overflow-auto">
        {activeModule === "diario" && (
          <LibroDiario asientos={asientos} onAddAsiento={handleAddAsiento} onUpdateAsiento={handleUpdateAsiento} onDeleteAsiento={handleDeleteAsiento} />
        )}
        {activeModule === "mayor" && <LibroMayor asientos={asientos} />}
        {activeModule === "inventario" && (
          <Inventario items={inventarioItems} onAddItem={handleAddInventarioItem} onDeleteItem={handleDeleteInventarioItem} />
        )}
        {activeModule === "kardex" && (
          <KardexFIFO movimientos={kardexMovimientos} onAddMovimiento={handleAddKardexMovimiento} />
        )}
        {activeModule === "catalogo" && <CatalogoCuentas />}
      </main>
      <BalanceBar totalDebe={totalDebe} totalHaber={totalHaber} />
    </div>
  );
};

export default Index;
