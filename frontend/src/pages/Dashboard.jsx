import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/companyService';
import { StatusBadge } from '../components/common/StatusBadge';
import { DocumentPreviewModal } from '../components/documents/DocumentPreviewModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  FileText,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  Printer,
  Download,
  Edit,
  ArrowRight,
} from 'lucide-react';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getStats();
      setData(res);
    } catch (err) {
      console.error('Failed fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cards = data?.cards || {};
  const recentDocs = data?.recent_documents || [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor real-time quotation requests, active invoices, and financial progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/quotations/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>New Quotation</span>
          </Link>
          <Link
            to="/invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Quotations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Quotations</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{cards.total_quotations ?? 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">{formatCurrency(cards.quotation_value || 0)} total</div>
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{cards.total_invoices ?? 0}</div>
            <div className="text-xs text-slate-400 mt-0.5">{formatCurrency(cards.invoice_value || 0)} invoiced</div>
          </div>
        </div>

        {/* Pending Quotations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending Quotes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{cards.pending_quotations ?? 0}</div>
            <div className="text-xs text-amber-600/80 mt-0.5">Draft / Sent to clients</div>
          </div>
        </div>

        {/* Accepted Quotations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Accepted Quotes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{cards.accepted_quotations ?? 0}</div>
            <div className="text-xs text-emerald-600/80 mt-0.5">Ready for invoice</div>
          </div>
        </div>

        {/* Unpaid Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Unpaid Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{cards.unpaid_invoices ?? 0}</div>
            <div className="text-xs text-rose-600/80 mt-0.5">Pending payment</div>
          </div>
        </div>

        {/* Paid Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Paid Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{cards.paid_invoices ?? 0}</div>
            <div className="text-xs text-teal-600/80 mt-0.5">{formatCurrency(cards.paid_value || 0)} received</div>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Documents</h2>
            <p className="text-xs text-slate-400 mt-0.5">Unified activity stream of quotes and invoices</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/quotations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Quotes <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="text-slate-300">|</span>
            <Link
              to="/invoices"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Invoices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {recentDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No documents generated yet. Create your first quotation or invoice to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Document Number</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentDocs.map((doc) => (
                  <tr key={`${doc.type}-${doc.id}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                      <Link
                        to={
                          doc.type === 'Quotation'
                            ? `/quotations/${doc.id}`
                            : `/invoices/${doc.id}`
                        }
                      >
                        {doc.number}
                      </Link>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          doc.type === 'Quotation'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {doc.type}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{doc.client}</div>
                      {doc.client_company && (
                        <div className="text-xs text-slate-400">{doc.client_company}</div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 text-xs">{formatDate(doc.date)}</td>

                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {formatCurrency(doc.amount)}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Preview"
                          onClick={() =>
                            setPreviewDoc({
                              id: doc.id,
                              number: doc.number,
                              type: doc.type === 'Quotation' ? 'QUOTATION' : 'INVOICE',
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          title="Edit"
                          onClick={() =>
                            navigate(
                              doc.type === 'Quotation'
                                ? `/quotations/${doc.id}/edit`
                                : `/invoices/${doc.id}/edit`
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <a
                          title="Download PDF"
                          href={
                            doc.type === 'Quotation'
                              ? `/api/quotations/${doc.id}/pdf/`
                              : `/api/invoices/${doc.id}/pdf/`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          documentId={previewDoc.id}
          documentNumber={previewDoc.number}
          documentType={previewDoc.type}
        />
      )}
    </div>
  );
};
