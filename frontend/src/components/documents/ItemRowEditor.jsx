import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ItemRowEditor = ({ items, onChange, products = [] }) => {
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Calculate line amount
    const qty = parseFloat(newItems[index].quantity) || 0;
    const rate = parseFloat(newItems[index].rate) || 0;
    newItems[index].amount = Math.round(qty * rate * 100) / 100;

    onChange(newItems);
  };

  const handleProductSelect = (index, productId) => {
    const selectedProduct = products.find((p) => p.id === parseInt(productId));
    const newItems = [...items];
    if (selectedProduct) {
      newItems[index] = {
        ...newItems[index],
        product_service: selectedProduct.id,
        item_name: selectedProduct.name,
        description: selectedProduct.description || '',
        rate: selectedProduct.rate,
      };
      const qty = parseFloat(newItems[index].quantity) || 1;
      const rate = parseFloat(selectedProduct.rate) || 0;
      newItems[index].amount = Math.round(qty * rate * 100) / 100;
    } else {
      newItems[index] = {
        ...newItems[index],
        product_service: null,
      };
    }
    onChange(newItems);
  };

  const addItem = () => {
    onChange([
      ...items,
      {
        item_name: '',
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Products & Services
        </h4>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
              <th className="p-3 w-48">Select Catalog</th>
              <th className="p-3">Item & Description</th>
              <th className="p-3 w-24 text-center">Qty</th>
              <th className="p-3 w-32 text-right">Rate (₹)</th>
              <th className="p-3 w-32 text-right">Amount (₹)</th>
              <th className="p-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50">
                <td className="p-3 align-top">
                  <select
                    value={item.product_service || ''}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">Custom Item...</option>
                    {products.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} (₹{prod.rate})
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3 space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Item / Service Name *"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <textarea
                    rows={2}
                    placeholder="Description or specifications (optional)"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-1 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-600"
                  />
                </td>

                <td className="p-3 align-top">
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full text-center px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </td>

                <td className="p-3 align-top">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-full text-right px-2 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </td>

                <td className="p-3 align-top text-right font-semibold text-slate-800 pt-4">
                  {formatCurrency(item.amount)}
                </td>

                <td className="p-3 align-top text-center pt-3.5">
                  <button
                    type="button"
                    disabled={items.length <= 1}
                    onClick={() => removeItem(index)}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
