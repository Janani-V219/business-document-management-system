import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItemRowEditor } from './ItemRowEditor';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import { templateService } from '../../services/templateService';
import { calculateDocumentTotals } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { Save, ArrowLeft, Building, Calendar, Percent, FileText } from 'lucide-react';

export const DocumentForm = ({
  initialData = null,
  documentType = 'QUOTATION', // 'QUOTATION' or 'INVOICE'
  onSubmit,
  isSubmitting = false,
  title = 'Create Document',
}) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Form states
  const [clientId, setClientId] = useState(initialData?.client || '');
  const [templateId, setTemplateId] = useState(initialData?.template || '');
  const [docDate, setDocDate] = useState(
    initialData?.quotation_date || initialData?.invoice_date || new Date().toISOString().split('T')[0]
  );
  const [secondDate, setSecondDate] = useState(
    initialData?.valid_until ||
      initialData?.due_date ||
      new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [status, setStatus] = useState(initialData?.status || 'DRAFT');

  const [discountType, setDiscountType] = useState(initialData?.discount_type || 'PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(initialData?.discount_value || 0);
  const [taxEnabled, setTaxEnabled] = useState(initialData?.tax_enabled ?? true);
  const [taxRate, setTaxRate] = useState(initialData?.tax_rate || 18.0);

  const [termsConditions, setTermsConditions] = useState(
    initialData?.terms_conditions ||
      '1. Payment is due within 15 calendar days.\n2. Goods/services once provided cannot be returned without written authorization.'
  );
  const [paymentDetails, setPaymentDetails] = useState(initialData?.payment_details || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [items, setItems] = useState(
    initialData?.items?.length
      ? initialData.items
      : [
          {
            item_name: '',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0,
          },
        ]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes, tRes] = await Promise.all([
          clientService.getAll(),
          productService.getAll(),
          templateService.getAll({ document_type: documentType }),
        ]);

        const clientList = cRes.results || cRes || [];
        setClients(clientList);

        const prodList = pRes.results || pRes || [];
        setProducts(prodList);

        const tmplList = tRes.results || tRes || [];
        setTemplates(tmplList);

        if (!templateId && tmplList.length > 0) {
          const defaultTmpl = tmplList.find((t) => t.is_default) || tmplList[0];
          setTemplateId(defaultTmpl.id);
        }
      } catch (err) {
        console.error('Failed loading form dependencies:', err);
      }
    };
    fetchData();
  }, [documentType]);

  // Live calculation preview
  const totals = calculateDocumentTotals({
    items,
    discountType,
    discountValue,
    taxEnabled,
    taxRate,
  });

  const selectedClient = clients.find((c) => c.id === parseInt(clientId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select a client');
      return;
    }

    const payload = {
      client: parseInt(clientId),
      template: templateId ? parseInt(templateId) : null,
      status,
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      tax_enabled: taxEnabled,
      tax_rate: parseFloat(taxRate) || 0,
      terms_conditions: termsConditions,
      notes,
      items: items.map((i) => ({
        product_service: i.product_service || null,
        item_name: i.item_name,
        description: i.description,
        quantity: parseFloat(i.quantity) || 1,
        rate: parseFloat(i.rate) || 0,
      })),
    };

    if (documentType === 'QUOTATION') {
      payload.quotation_date = docDate;
      payload.valid_until = secondDate;
    } else {
      payload.invoice_date = docDate;
      payload.due_date = secondDate;
      payload.payment_details = paymentDetails;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">
              {initialData ? `Editing ${initialData.quotation_number || initialData.invoice_number}` : 'Fill in the details below'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save {documentType === 'QUOTATION' ? 'Quotation' : 'Invoice'}</span>
          </button>
        </div>
      </div>

      {/* Basic metadata card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-indigo-600" />
            Client / Customer *
          </label>
          <select
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">-- Choose a Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.client_name} {c.company_name ? `(${c.company_name})` : ''}
              </option>
            ))}
          </select>
          {selectedClient && (
            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-700">{selectedClient.client_name}</div>
              {selectedClient.company_name && <div>{selectedClient.company_name}</div>}
              {selectedClient.email && <div>{selectedClient.email}</div>}
              {selectedClient.gst_number && <div>GST: {selectedClient.gst_number}</div>}
            </div>
          )}
        </div>

        {/* Template & Status */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Document Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {documentType === 'QUOTATION' ? (
                <>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </>
              ) : (
                <>
                  <option value="DRAFT">Draft</option>
                  <option value="ISSUED">Issued</option>
                  <option value="PAID">Paid</option>
                  <option value="PARTIALLY_PAID">Partially Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="CANCELLED">Cancelled</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              {documentType === 'QUOTATION' ? 'Quotation Date *' : 'Invoice Date *'}
            </label>
            <input
              type="date"
              required
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              {documentType === 'QUOTATION' ? 'Valid Until *' : 'Due Date *'}
            </label>
            <input
              type="date"
              required
              value={secondDate}
              onChange={(e) => setSecondDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <ItemRowEditor items={items} onChange={setItems} products={products} />
      </div>

      {/* Financials & Calculations */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column: Discount & Tax controls */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-indigo-600" />
            Discounts & Taxes
          </h4>

          {/* Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Discount Value</label>
              <input
                type="number"
                min="0"
                step="any"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          {/* Tax / GST */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                />
                Apply GST / Tax
              </label>

              {taxEnabled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="any"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-lg text-center font-medium"
                  />
                </div>
              )}
            </div>
          </div>

          {documentType === 'INVOICE' && (
            <div className="pt-3 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Payment Instructions</label>
              <textarea
                rows={3}
                placeholder="Bank account details, UPI ID, payment links..."
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Right column: Summary Totals */}
        <div className="bg-slate-50/80 p-6 rounded-xl border border-slate-200/60 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totals.subtotal)}</span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Discount {discountType === 'PERCENTAGE' && discountValue > 0 ? `(${discountValue}%)` : ''}</span>
              <span className="font-semibold text-rose-600">-{formatCurrency(totals.discountAmount)}</span>
            </div>

            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax / GST {taxEnabled && taxRate > 0 ? `(${taxRate}%)` : ''}</span>
              <span className="font-semibold text-slate-800">+{formatCurrency(totals.taxAmount)}</span>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
              <div>
                <span className="text-base font-bold text-slate-900">Grand Total</span>
                <p className="text-xs text-slate-400">Total amount payable</p>
              </div>
              <span className="text-2xl font-black text-indigo-600">
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Terms & Conditions
          </label>
          <textarea
            rows={4}
            value={termsConditions}
            onChange={(e) => setTermsConditions(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Internal Notes (Optional)
          </label>
          <textarea
            rows={4}
            placeholder="Special instructions or internal comments..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </form>
  );
};
