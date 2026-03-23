// Configuración de moneda para Paraguay
export const CURRENCY_CONFIG = {
  symbol: '₲',
  code: 'PYG',
  name: 'Guaraníes Paraguayos',
  decimalPlaces: 0, // Los guaraníes no usan decimales
  thousandsSeparator: '.',
  decimalSeparator: ','
};

// Función para formatear montos en guaraníes
export const formatCurrency = (amount: number): string => {
  // Los guaraníes no tienen decimales, así que redondeamos
  const roundedAmount = Math.round(amount);
  
  // Formateamos con separador de miles
  const formatted = roundedAmount.toLocaleString('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return `${CURRENCY_CONFIG.symbol}${formatted}`;
};

// Función para formatear montos en PDF (sin separadores de miles)
export const formatCurrencyPDF = (amount: number): string => {
  const roundedAmount = Math.round(amount);
  return `Gs. ${roundedAmount.toLocaleString('es-PY')}`;
};
