import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AppSidebar from "@/components/AppSidebar";
import LibroDiario from "@/components/LibroDiario";
import LibroMayor from "@/components/LibroMayor";
import Inventario from "@/components/Inventario";
import BalanceBar from "@/components/BalanceBar";
import type { AsientoContable, ItemInventario } from "@/types/accounting";
import { useToast } from "@/hooks/use-toast";

type Module = "diario" | "mayor" | "inventario";

const Index = () => {
  const [activeModule, setActiveModule] = useState<Module>("diario");
  const [asientos, setAsientos] = useState<AsientoContable[]>([]);
  const [inventarioItems, setInventarioItems] = useState<ItemInventario[]>([]);
  const { toast } = useToast();

  // Subscribe to asientos
  useEffect(() => {
    const q = query(collection(db, "asientos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AsientoContable[];
      setAsientos(data);
    }, (error) => {
      console.error("Error loading asientos:", error);
      toast({ title: "Error", description: "No se pudieron cargar los asientos.", variant: "destructive" });
    });
    return unsub;
  }, []);

  // Subscribe to inventario
  useEffect(() => {
    const q = query(collection(db, "inventario"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ItemInventario[];
      setInventarioItems(data);
    }, (error) => {
      console.error("Error loading inventario:", error);
      toast({ title: "Error", description: "No se pudo cargar el inventario.", variant: "destructive" });
    });
    return unsub;
  }, []);

  const handleAddAsiento = async (asiento: Omit<AsientoContable, "id" | "createdAt">) => {
    try {
      await addDoc(collection(db, "asientos"), {
        ...asiento,
        createdAt: Date.now(),
      });
      toast({ title: "✓ Partida registrada", description: "La partida se guardó correctamente." });
    } catch (error) {
      console.error("Error adding asiento:", error);
      toast({ title: "Error", description: "No se pudo guardar la partida.", variant: "destructive" });
    }
  };

  const handleDeleteAsiento = async (id: string) => {
    try {
      await deleteDoc(doc(db, "asientos", id));
      toast({ title: "Partida eliminada", description: "Se eliminó la partida del libro diario." });
    } catch (error) {
      console.error("Error deleting asiento:", error);
      toast({ title: "Error", description: "No se pudo eliminar la partida.", variant: "destructive" });
    }
  };

  const handleAddInventarioItem = async (item: Omit<ItemInventario, "id" | "createdAt" | "costoTotal">) => {
    try {
      await addDoc(collection(db, "inventario"), {
        ...item,
        costoTotal: item.cantidad * item.costoUnitario,
        createdAt: Date.now(),
      });
      toast({ title: "✓ Artículo agregado", description: "El artículo se guardó en el inventario." });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({ title: "Error", description: "No se pudo guardar el artículo.", variant: "destructive" });
    }
  };

  const handleDeleteInventarioItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "inventario", id));
      toast({ title: "Artículo eliminado", description: "Se eliminó el artículo del inventario." });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({ title: "Error", description: "No se pudo eliminar el artículo.", variant: "destructive" });
    }
  };

  // Calculate totals for balance bar
  const totalDebe = asientos.reduce((sum, a) => sum + a.partidas.reduce((s, p) => s + p.debe, 0), 0);
  const totalHaber = asientos.reduce((sum, a) => sum + a.partidas.reduce((s, p) => s + p.haber, 0), 0);

  return (
    <div className="flex min-h-screen">
      <AppSidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 p-8 pb-20 overflow-auto">
        {activeModule === "diario" && (
          <LibroDiario asientos={asientos} onAddAsiento={handleAddAsiento} onDeleteAsiento={handleDeleteAsiento} />
        )}
        {activeModule === "mayor" && (
          <LibroMayor asientos={asientos} />
        )}
        {activeModule === "inventario" && (
          <Inventario items={inventarioItems} onAddItem={handleAddInventarioItem} onDeleteItem={handleDeleteInventarioItem} />
        )}
      </main>
      <BalanceBar totalDebe={totalDebe} totalHaber={totalHaber} />
    </div>
  );
};

export default Index;
