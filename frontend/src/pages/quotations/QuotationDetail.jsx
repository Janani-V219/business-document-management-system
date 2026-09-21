import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Edit,
  Printer,
  Download,
  Copy,
  ArrowRightCircle,
  Building,
  Calendar,
  DollarSign,
} from 'lucide-react';

export const QuotationDetail = () => {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [convertModal, setConvertModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const iframeRef = useRef(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await quotationService.getById(id);
      setQuotation(res);
    } catch (err) {
      showToast('Failed to load quotation', 'error');
      navigate('/quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await quotationService.duplicate(id);
      showToast(`Quotation duplicated! New quote: ${res.quotation_number}`, 'success');
      navigate(`/quotations/${res.id}`);
    } catch (err) {
      showToast('Failed to duplicate quotation', 'error');
    }
  };

  const handleConvert = async (force = false) => {
    try {
      setActionLoading(true);
      const res = await quotationService.convertToInvoice(id, force);
      showToast(`Converted! Generated Invoice: ${res.invoice_number}`, 'success');
      setConvertModal(false);
      navigate(`/invoices/${res.id}`);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.already_converted) {
        showToast(errData.error, 'error');
      } else {
        showToast('Failed to convert quotation to invoice', 'error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {quotation.quotation_number}
              </h1>
              <StatusBadge status={quotation.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: <span className="font-semibold text-slate-700">{quotation.client_details?.client_name}</span>
              {quotation.client_details?.company_name && ` (${quotation.client_details.company_name})`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {quotation.status !== 'CONVERTED' && (
            <button
              onClick={() => setConvertModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 shadow-2xs transition-colors"
            >
              <ArrowRightCircle className="w-4 h-4 text-purple-600" />
              <span>Convert to Invoice</span>
            </button>
          )}

          <button
            onClick={handleDuplicate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <Link
            to={`/quotations/${quotation.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>Print</span>
          </button>

          <a
            href={`/api/quotations/${quotation.id}/pdf/`}
            target="_blank"
            rel="noopener noreferrer"
            download={`${quotation.quotation_number}.pdf`}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/20 transition-colors"
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
            <div className="text-xs text-slate-400">Client Contact</div>
            <div className="text-sm font-bold text-slate-800 truncate">
              {quotation.client_details?.client_name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Quote Date</div>
            <div className="text-sm font-bold text-slate-800">
              {formatDate(quotation.quotation_date)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Valid Until</div>
            <div className="text-sm font-bold text-slate-800">
              {formatDate(quotation.valid_until)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-indigo-600 font-medium">Grand Total</div>
            <div className="text-base font-black text-slate-900">
              {formatCurrency(quotation.grand_total)}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Document Preview */}
      <div className="bg-slate-200/80 p-4 sm:p-8 rounded-3xl border border-slate-300/80 shadow-inner flex justify-center">
        <iframe
          ref={iframeRef}
          src={`/api/quotations/${quotation.id}/preview/`}
          title={`Preview of ${quotation.quotation_number}`}
          className="w-full max-w-[850px] h-[850px] bg-white rounded-2xl shadow-xl border border-slate-300"
        />
      </div>

      {/* Convert confirmation */}
      {convertModal && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConvertModal(false)}
          onConfirm={() => handleConvert(false)}
          title="Convert Quotation to Invoice"
          message={`Convert ${quotation.quotation_number} into an official Tax Invoice? The client details, line items, discounts, and terms will be seamlessly migrated, and a new unique invoice number (e.g. INV-0001) will be allocated.`}
          confirmText="Convert Now"
          loading={actionLoading}
        />
      )}
    </div>
  );
};
