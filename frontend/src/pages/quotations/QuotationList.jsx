import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quotationService } from '../../services/quotationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DocumentPreviewModal } from '../../components/documents/DocumentPreviewModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  ArrowRightCircle,
  Download,
  Printer,
  FileText,
} from 'lucide-react';

export const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [convertItem, setConvertItem] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await quotationService.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setQuotations(res.results || res || []);
    } catch (err) {
      showToast('Failed loading quotations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuotations();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await quotationService.delete(deleteId);
      showToast('Quotation deleted successfully', 'success');
      setDeleteId(null);
      fetchQuotations();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete quotation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await quotationService.duplicate(id);
      showToast(`Duplicated! New quotation: ${res.quotation_number}`, 'success');
      fetchQuotations();
    } catch (err) {
      showToast('Failed to duplicate quotation', 'error');
    }
  };

  const handleConvert = async (force = false) => {
    if (!convertItem) return;
    try {
      setActionLoading(true);
      const res = await quotationService.convertToInvoice(convertItem.id, force);
      showToast(`Converted! Generated Invoice: ${res.invoice_number}`, 'success');
      setConvertItem(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-600" />
            Quotations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, track, customize, and convert quotations into official invoices.
          </p>
        </div>

        <Link
          to="/quotations/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Quotation</span>
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by quote number, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
            <option value="CONVERTED">Converted</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No quotations found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Quotation No</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Valid Until</th>
                  <th className="py-3.5 px-6 text-right">Grand Total</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-indigo-600 hover:text-indigo-800">
                      <Link to={`/quotations/${q.id}`}>{q.quotation_number}</Link>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {q.client_details?.client_name || '-'}
                      </div>
                      {q.client_details?.company_name && (
                        <div className="text-xs text-slate-400">
                          {q.client_details.company_name}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs">{formatDate(q.quotation_date)}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs">{formatDate(q.valid_until)}</td>

                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {formatCurrency(q.grand_total)}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={q.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Preview Document"
                          onClick={() =>
                            setPreviewDoc({ id: q.id, number: q.quotation_number })
                          }
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          title="Convert to Invoice"
                          onClick={() => setConvertItem(q)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <ArrowRightCircle className="w-4 h-4" />
                        </button>

                        <button
                          title="Duplicate"
                          onClick={() => handleDuplicate(q.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => navigate(`/quotations/${q.id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <a
                          title="Download PDF"
                          href={`/api/quotations/${q.id}/pdf/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {isAdmin && (
                          <button
                            title="Delete Quotation"
                            onClick={() => setDeleteId(q.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Convert to Invoice Confirmation Dialog */}
      {convertItem && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConvertItem(null)}
          onConfirm={() => handleConvert(false)}
          title="Convert Quotation to Invoice"
          message={`Are you sure you want to convert Quotation ${convertItem.quotation_number} into a formal Tax Invoice? A unique invoice number will be automatically allocated.`}
          confirmText="Convert Now"
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Quotation"
          message="Are you sure you want to delete this quotation? This action is permanent. (Note: Quotation sequence numbers are never reused)."
          confirmText="Delete"
          isDestructive={true}
          loading={actionLoading}
        />
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          documentId={previewDoc.id}
          documentNumber={previewDoc.number}
          documentType="QUOTATION"
        />
      )}
    </div>
  );
};
