import React, { useState, useEffect } from 'react';
import { numberingService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Settings, Save, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';

export const NumberingSettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [quotationConfig, setQuotationConfig] = useState({
    prefix: 'QTN',
    starting_number: 1,
    number_of_digits: 4,
    format_pattern: '{prefix}-{number}',
  });

  const [invoiceConfig, setInvoiceConfig] = useState({
    prefix: 'INV',
    starting_number: 1,
    number_of_digits: 4,
    format_pattern: '{prefix}-{number}',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await numberingService.getSettings();
      setSettings(data);
      const q = data.find((s) => s.document_type === 'QUOTATION');
      const inv = data.find((s) => s.document_type === 'INVOICE');

      if (q) {
        setQuotationConfig({
          prefix: q.prefix,
          starting_number: q.starting_number,
          number_of_digits: q.number_of_digits,
          format_pattern: q.format_pattern,
          current_sequence: q.current_sequence,
        });
      }

      if (inv) {
        setInvoiceConfig({
          prefix: inv.prefix,
          starting_number: inv.starting_number,
          number_of_digits: inv.number_of_digits,
          format_pattern: inv.format_pattern,
          current_sequence: inv.current_sequence,
        });
      }
    } catch (err) {
      showToast('Failed to load numbering settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const calculatePreview = (config) => {
    const nextSeq = (config.current_sequence || 0) + 1;
    const num = Math.max(nextSeq, config.starting_number || 1);
    const padded = String(num).padStart(config.number_of_digits || 4, '0');
    const year = new Date().getFullYear();
    return (config.format_pattern || '{prefix}-{number}')
      .replace('{prefix}', config.prefix || '')
      .replace('{number}', padded)
      .replace('{year}', year);
  };

  const handleSaveQuotation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await numberingService.updateSetting('QUOTATION', quotationConfig);
      showToast('Quotation numbering configuration saved!', 'success');
      fetchSettings();
    } catch (err) {
      showToast('Failed to save quotation numbering settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await numberingService.updateSetting('INVOICE', invoiceConfig);
      showToast('Invoice numbering configuration saved!', 'success');
      fetchSettings();
    } catch (err) {
      showToast('Failed to save invoice numbering settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500 mt-1">
          Only Administrators are authorized to view and modify automatic numbering configurations.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-600" />
          Automatic Document Numbering
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure sequence rules, prefixes, padding digits, and custom numbering patterns for Quotations and Invoices.
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 text-xs text-indigo-900 leading-relaxed flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Atomic Generation Guarantee:</strong>
          Numbers are generated at the exact moment a document is created and permanently stored in the database.
          Numbers are never reused (even if deleted), and will never alter when editing, previewing, or printing.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quotation Numbering Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <form onSubmit={handleSaveQuotation} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Quotation Numbering
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Current Sequence: {quotationConfig.current_sequence || 0}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Prefix
              </label>
              <input
                type="text"
                required
                value={quotationConfig.prefix}
                onChange={(e) => setQuotationConfig({ ...quotationConfig, prefix: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Starting Number
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quotationConfig.starting_number}
                  onChange={(e) =>
                    setQuotationConfig({
                      ...quotationConfig,
                      starting_number: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Padding Digits
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  required
                  value={quotationConfig.number_of_digits}
                  onChange={(e) =>
                    setQuotationConfig({
                      ...quotationConfig,
                      number_of_digits: parseInt(e.target.value) || 4,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Format Pattern
              </label>
              <input
                type="text"
                required
                placeholder="{prefix}-{number}"
                value={quotationConfig.format_pattern}
                onChange={(e) =>
                  setQuotationConfig({ ...quotationConfig, format_pattern: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supported tags: {'{prefix}'}, {'{number}'}, {'{year}'}
              </p>
            </div>

            {/* Live Preview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Next Generated Number:</span>
                <span className="text-base font-black text-indigo-600 font-mono">
                  {calculatePreview(quotationConfig)}
                </span>
              </div>
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/20 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Quotation Settings</span>
              </button>
            </div>
          </form>
        </div>

        {/* Invoice Numbering Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
          <form onSubmit={handleSaveInvoice} className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Invoice Numbering
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Current Sequence: {invoiceConfig.current_sequence || 0}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Prefix
              </label>
              <input
                type="text"
                required
                value={invoiceConfig.prefix}
                onChange={(e) => setInvoiceConfig({ ...invoiceConfig, prefix: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Starting Number
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={invoiceConfig.starting_number}
                  onChange={(e) =>
                    setInvoiceConfig({
                      ...invoiceConfig,
                      starting_number: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Padding Digits
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  required
                  value={invoiceConfig.number_of_digits}
                  onChange={(e) =>
                    setInvoiceConfig({
                      ...invoiceConfig,
                      number_of_digits: parseInt(e.target.value) || 4,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Format Pattern
              </label>
              <input
                type="text"
                required
                placeholder="{prefix}-{number}"
                value={invoiceConfig.format_pattern}
                onChange={(e) =>
                  setInvoiceConfig({ ...invoiceConfig, format_pattern: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supported tags: {'{prefix}'}, {'{number}'}, {'{year}'}
              </p>
            </div>

            {/* Live Preview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">Next Generated Number:</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {calculatePreview(invoiceConfig)}
                </span>
              </div>
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-emerald-600/20 transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Invoice Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
