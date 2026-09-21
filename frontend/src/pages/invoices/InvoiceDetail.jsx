import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Copy,
  Building,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';

export const InvoiceDetail = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getById(id);
      setInvoice(res);
    } catch (err) {
      showToast('Failed to load invoice', 'error');
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await invoiceService.duplicate(id);
      showToast(`Invoice duplicated! New invoice: ${res.invoice_number}`, 'success');
      navigate(`/invoices/${res.id}`);
    } catch (err) {
      showToast('Failed to duplicate invoice', 'error');
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {invoice.invoice_number}
              </h1>
              <StatusBadge status={invoice.status} />
              {invoice.source_quotation && (
                <Link
                  to={`/quotations/${invoice.source_quotation}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  From {invoice.source_quotation_number}
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: <span className="font-semibold text-slate-700">{invoice.client_details?.client_name}</span>
              {invoice.client_details?.company_name && ` (${invoice.client_details.company_name})`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <Link
            to={`/invoices/${invoice.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" />
            <span>Print</span>
          </button>

          <a
            href={`/api/invoices/${invoice.id}/pdf/`}
            target="_blank"
            rel="noopener noreferrer"
            download={`${invoice.invoice_number}.pdf`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </a>
        </div>
      </div>

      {/* Summary Info Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Billed Client</div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {invoice.client_details?.client_name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Invoice Date</div>
            <div className="text-sm font-bold text-slate-800">
              {formatDate(invoice.invoice_date)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Due Date</div>
            <div className="text-sm font-bold text-slate-800">
              {formatDate(invoice.due_date)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-600 font-medium">Total Payable</div>
            <div className="text-base font-black text-slate-900">
              {formatCurrency(invoice.grand_total)}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Document Preview */}
      <div className="bg-slate-200/80 p-4 sm:p-8 rounded-3xl border border-slate-300/80 shadow-inner flex justify-center">
        <iframe
          ref={iframeRef}
          src={`/api/invoices/${invoice.id}/preview/`}
          title={`Preview of ${invoice.invoice_number}`}
          className="w-full max-w-[850px] h-[850px] bg-white rounded-2xl shadow-xl border border-slate-300"
        />
      </div>
    </div>
  );
};
