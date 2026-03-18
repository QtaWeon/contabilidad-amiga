import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { AsientoContable, ItemInventario } from "@/types/accounting";

export const exportLibroDiarioPDF = (asientos: AsientoContable[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Libro Diario", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 28);

  const rows: (string | number)[][] = [];
  asientos.forEach((asiento) => {
    asiento.partidas.forEach((p, i) => {
      rows.push([
        i === 0 ? asiento.fecha : "",
        p.cuenta,
        i === 0 ? asiento.descripcion : "",
        p.debe > 0 ? `Q${p.debe.toFixed(2)}` : "",
        p.haber > 0 ? `Q${p.haber.toFixed(2)}` : "",
      ]);
    });
    rows.push(["", "", "", "", ""]); // separator
  });

  autoTable(doc, {
    startY: 34,
    head: [["Fecha", "Cuenta", "Descripción", "Debe", "Haber"]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
  });

  doc.save("libro-diario.pdf");
};

export const exportLibroMayorPDF = (asientos: AsientoContable[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Libro Mayor", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 28);

  // Build T-accounts
  const cuentas: Record<string, { debe: { fecha: string; monto: number }[]; haber: { fecha: string; monto: number }[] }> = {};
  asientos.forEach((a) => {
    a.partidas.forEach((p) => {
      const nombre = p.cuenta.trim();
      if (!nombre) return;
      if (!cuentas[nombre]) cuentas[nombre] = { debe: [], haber: [] };
      if (p.debe > 0) cuentas[nombre].debe.push({ fecha: a.fecha, monto: p.debe });
      if (p.haber > 0) cuentas[nombre].haber.push({ fecha: a.fecha, monto: p.haber });
    });
  });

  let y = 34;
  Object.entries(cuentas).sort(([a], [b]) => a.localeCompare(b)).forEach(([nombre, data]) => {
    if (y > 250) { doc.addPage(); y = 20; }

    const totalDebe = data.debe.reduce((s, m) => s + m.monto, 0);
    const totalHaber = data.haber.reduce((s, m) => s + m.monto, 0);
    const saldo = totalDebe - totalHaber;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(nombre, 14, y);
    y += 6;

    const rows = [];
    const maxLen = Math.max(data.debe.length, data.haber.length);
    for (let i = 0; i < maxLen; i++) {
      rows.push([
        data.debe[i]?.fecha || "",
        data.debe[i] ? `Q${data.debe[i].monto.toFixed(2)}` : "",
        data.haber[i]?.fecha || "",
        data.haber[i] ? `Q${data.haber[i].monto.toFixed(2)}` : "",
      ]);
    }
    rows.push([
      "Total", `Q${totalDebe.toFixed(2)}`,
      "Total", `Q${totalHaber.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Fecha", "Debe", "Fecha", "Haber"]],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 95] },
      didDrawPage: (data) => { y = data.cursor?.y || y; },
    });

    y = (doc as any).lastAutoTable.finalY + 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Saldo: Q${Math.abs(saldo).toFixed(2)} (${saldo >= 0 ? "Deudor" : "Acreedor"})`, 14, y);
    y += 10;
  });

  doc.save("libro-mayor.pdf");
};

export const exportInventarioPDF = (items: ItemInventario[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Inventario", 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-GT")}`, 14, 28);

  const rows = items.map((item) => [
    item.codigo,
    item.descripcion,
    item.categoria,
    item.cantidad.toString(),
    `Q${item.costoUnitario.toFixed(2)}`,
    `Q${item.costoTotal.toFixed(2)}`,
  ]);

  const total = items.reduce((s, i) => s + i.costoTotal, 0);
  rows.push(["", "", "", "", "Total:", `Q${total.toFixed(2)}`]);

  autoTable(doc, {
    startY: 34,
    head: [["Código", "Descripción", "Categoría", "Cantidad", "Costo Unit.", "Costo Total"]],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 95] },
  });

  doc.save("inventario.pdf");
};
