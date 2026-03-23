import { formatCurrency } from "@/lib/currency";

interface BalanceBarProps {
  totalDebe: number;
  totalHaber: number;
}

const BalanceBar = ({ totalDebe, totalHaber }: BalanceBarProps) => {
  const balanced = Math.abs(totalDebe - totalHaber) < 0.01 && totalDebe > 0;
  const difference = Math.abs(totalDebe - totalHaber);

  return (
    <div
      className={`fixed bottom-0 left-64 right-0 h-14 flex items-center justify-between px-8 font-body text-sm font-semibold transition-colors z-50 ${
        balanced
          ? "bg-success text-success-foreground"
          : "bg-destructive text-destructive-foreground"
      }`}
    >
      <div className="flex gap-8">
        <span>Total Debe: {formatCurrency(totalDebe)}</span>
        <span>Total Haber: {formatCurrency(totalHaber)}</span>
      </div>
      <div>
        {balanced ? (
          <span>✓ Cuadrado — Los registros están balanceados</span>
        ) : (
          <span>✗ Descuadre: {formatCurrency(difference)}</span>
        )}
      </div>
    </div>
  );
};

export default BalanceBar;
