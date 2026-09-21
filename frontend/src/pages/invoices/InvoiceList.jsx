import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../services/invoiceService';
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
  Download,
  Receipt,
  FileText,
} from 'lucide-react';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceService.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setInvoices(res.results || res || []);
    } catch (err) {
      showToast('Failed loading invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await invoiceService.delete(deleteId);
      showToast('Invoice deleted successfully', 'success');
      setDeleteId(null);
      fetchInvoices();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete invoice', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await invoiceService.duplicate(id);
      showToast(`Duplicated! New invoice: ${res.invoice_number}`, 'success');
      fetchInvoices();
    } catch (err) {
      showToast('Failed to duplicate invoice', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-emerald-600" />
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage tax invoices, payment statuses, print receipts, and track receivables.
          </p>
        </div>

        <Link
          to="/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-emerald-600/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by invoice number, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ISSUED">Issued</option>
            <option value="PAID">Paid</option>
            <option value="PARTIALLY_PAID">Partially Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No invoices found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Invoice No</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Source Quote</th>
                  <th className="py-3.5 px-6 text-right">Grand Total</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-emerald-700 hover:text-emerald-900">
                      <Link to={`/invoices/${inv.id}`}>{inv.invoice_number}</Link>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">
                        {inv.client_details?.client_name || '-'}
                      </div>
                      {inv.client_details?.company_name && (
                        <div className="text-xs text-slate-400">
                          {inv.client_details.company_name}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs">{formatDate(inv.invoice_date)}</td>
                    <td className="py-4 px-6 text-slate-500 text-xs">{formatDate(inv.due_date)}</td>

                    <td className="py-4 px-6 text-xs">
                      {inv.source_quotation ? (
                        <Link
                          to={`/quotations/${inv.source_quotation}`}
                          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md"
                        >
                          <FileText className="w-3 h-3" />
                          {inv.source_quotation_number || 'Quotation'}
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {formatCurrency(inv.grand_total)}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={inv.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Preview Document"
                          onClick={() =>
                            setPreviewDoc({ id: inv.id, number: inv.invoice_number })
                          }
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          title="Duplicate"
                          onClick={() => handleDuplicate(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => navigate(`/invoices/${inv.id}/edit`)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <a
                          title="Download PDF"
                          href={`/api/invoices/${inv.id}/pdf/`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {isAdmin && (
                          <button
                            title="Delete Invoice"
                            onClick={() => setDeleteId(inv.id)}
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

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Invoice"
          message="Are you sure you want to delete this invoice? This action is permanent. (Note: Invoice sequence numbers are never reused)."
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
          documentType="INVOICE"
        />
      )}
    </div>
  );
};
