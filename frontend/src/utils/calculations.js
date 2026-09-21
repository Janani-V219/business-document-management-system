export const calculateDocumentTotals = ({
  items = [],
  discountType = 'PERCENTAGE',
  discountValue = 0,
  taxEnabled = true,
  taxRate = 18.0,
}) => {
  let subtotal = 0;

  const calculatedItems = items.map((item) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    const amount = Math.round(qty * rate * 100) / 100;
    subtotal += amount;
    return {
      ...item,
      amount,
    };
  });

  subtotal = Math.round(subtotal * 100) / 100;

  let discountAmount = 0;
  const discVal = parseFloat(discountValue) || 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = Math.round(((subtotal * discVal) / 100) * 100) / 100;
  } else {
    discountAmount = Math.min(discVal, subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  let taxAmount = 0;
  if (taxEnabled) {
    const tRate = parseFloat(taxRate) || 0;
    taxAmount = Math.round(((taxableAmount * tRate) / 100) * 100) / 100;
  }

  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  return {
    calculatedItems,
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    grandTotal,
  };
};
