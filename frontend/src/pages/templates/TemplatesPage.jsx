import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { templateService } from '../../services/templateService';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import {
  Palette,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  FileText,
  Receipt,
  Sparkles,
} from 'lucide-react';

export const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showToast } = useToast();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateService.getAll({
        document_type: docTypeFilter || undefined,
      });
      setTemplates(res.results || res || []);
    } catch (err) {
      showToast('Failed to load document templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [docTypeFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setActionLoading(true);
      await templateService.delete(deleteId);
      showToast('Template deleted successfully', 'success');
      setDeleteId(null);
      fetchTemplates();
    } catch (err) {
      showToast('Failed to delete template', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetDefault = async (tmpl) => {
    try {
      await templateService.update(tmpl.id, { is_default: true });
      showToast(`"${tmpl.name}" set as default for ${tmpl.document_type}`, 'success');
      fetchTemplates();
    } catch (err) {
      showToast('Failed setting default template', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-indigo-600" />
            Document Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Design and customize professional quotation and invoice templates with GrapesJS visual editor.
          </p>
        </div>

        {isAdmin && (
          <Link
            to="/templates/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-indigo-600/20 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </Link>
        )}
      </div>

      {/* Filter tab bar */}
      <div className="flex gap-2 p-1.5 bg-slate-200/70 rounded-xl w-fit">
        <button
          onClick={() => setDocTypeFilter('')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            docTypeFilter === ''
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Templates
        </button>
        <button
          onClick={() => setDocTypeFilter('QUOTATION')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            docTypeFilter === 'QUOTATION'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          Quotation Templates
        </button>
        <button
          onClick={() => setDocTypeFilter('INVOICE')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            docTypeFilter === 'INVOICE'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
          Invoice Templates
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-16 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : templates.length === 0 ? (
        <div className="p-16 text-center text-slate-400 text-sm bg-white rounded-2xl border border-slate-200/80">
          No templates found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                tmpl.is_default
                  ? 'border-indigo-500/50 ring-2 ring-indigo-500/10'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{tmpl.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          tmpl.document_type === 'QUOTATION'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {tmpl.document_type}
                      </span>
                      {tmpl.is_default && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Sparkles className="w-3 h-3" />
                          Default
                        </span>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/templates/${tmpl.id}/edit`)}
                        title="Design Template"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(tmpl.id)}
                        title="Delete Template"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* HTML mini preview snippet */}
                <div className="h-32 bg-slate-50 rounded-xl p-3 border border-slate-100 overflow-hidden text-[10px] text-slate-400 font-mono select-none pointer-events-none">
                  <div className="line-clamp-6">{tmpl.html_content}</div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Updated: {formatDate(tmpl.updated_at)}
                </span>

                {isAdmin && !tmpl.is_default && (
                  <button
                    onClick={() => handleSetDefault(tmpl)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Template"
          message="Are you sure you want to delete this template? Any documents currently referencing it will fall back to the default template."
          confirmText="Delete Template"
          isDestructive={true}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
