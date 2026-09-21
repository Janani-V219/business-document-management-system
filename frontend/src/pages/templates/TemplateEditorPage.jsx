import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import grapesjs from 'grapesjs';
import { templateService } from '../../services/templateService';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Save, Sparkles, Tag, Code, Eye } from 'lucide-react';

const DYNAMIC_PLACEHOLDERS = [
  { label: 'Company Name', tag: '{{company_name}}' },
  { label: 'Company Address', tag: '{{company_address}}' },
  { label: 'Company Phone', tag: '{{company_phone}}' },
  { label: 'Company Email', tag: '{{company_email}}' },
  { label: 'Company GST', tag: '{{company_gst}}' },
  { label: 'Client Name', tag: '{{client_name}}' },
  { label: 'Client Company', tag: '{{client_company}}' },
  { label: 'Client Address', tag: '{{client_address}}' },
  { label: 'Client Phone', tag: '{{client_phone}}' },
  { label: 'Client Email', tag: '{{client_email}}' },
  { label: 'Client GST', tag: '{{client_gst}}' },
  { label: 'Quotation Number', tag: '{{quotation_number}}' },
  { label: 'Invoice Number', tag: '{{invoice_number}}' },
  { label: 'Document Date', tag: '{{document_date}}' },
  { label: 'Valid Until Date', tag: '{{valid_until}}' },
  { label: 'Due Date', tag: '{{due_date}}' },
  { label: 'Items Table', tag: '{{items_table}}' },
  { label: 'Subtotal Amount', tag: '{{subtotal}}' },
  { label: 'Discount Amount', tag: '{{discount}}' },
  { label: 'Tax / GST Amount', tag: '{{tax}}' },
  { label: 'Grand Total', tag: '{{total}}' },
  { label: 'Terms & Conditions', tag: '{{terms_conditions}}' },
  { label: 'Payment Details', tag: '{{payment_details}}' },
  { label: 'Authorized Signature', tag: '{{signature}}' },
];

export const TemplateEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  const [name, setName] = useState('');
  const [docType, setDocType] = useState('QUOTATION');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let editor = null;

    const initEditor = async () => {
      let initialHtml = `
        <div style="max-width: 800px; margin: 20px auto; padding: 30px; font-family: sans-serif; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px;">
            <div>
              <h1 style="margin: 0; color: #1e293b; font-size: 24px;">{{company_name}}</h1>
              <p style="margin: 4px 0; color: #64748b; font-size: 13px;">{{company_address}} | {{company_phone}}</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #4f46e5; font-size: 20px;">QUOTATION</h2>
              <p style="margin: 4px 0; font-size: 13px;"><strong>No:</strong> {{quotation_number}}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Date:</strong> {{document_date}}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <p style="font-size: 12px; color: #4f46e5; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Prepared For:</p>
            <h3 style="margin: 0; font-size: 16px; color: #0f172a;">{{client_name}}</h3>
            <p style="margin: 2px 0; font-size: 13px; color: #475569;">{{client_company}}</p>
            <p style="margin: 2px 0; font-size: 13px; color: #64748b;">{{client_address}}</p>
          </div>

          {{items_table}}

          <div style="display: flex; justify-content: flex-end; margin: 25px 0;">
            <div style="width: 280px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                <span>Subtotal:</span><strong>{{subtotal}}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                <span>Discount:</span><strong>{{discount}}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9;">
                <span>Tax / GST:</span><strong>{{tax}}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; color: #4f46e5; border-top: 2px solid #4f46e5;">
                <span>Total:</span><strong>{{total}}</strong>
              </div>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p><strong>Terms:</strong> {{terms_conditions}}</p>
          </div>
        </div>
      `;
      let initialCss = 'body { margin: 0; padding: 20px; background-color: #f8fafc; }';

      if (id && id !== 'new') {
        try {
          const tmpl = await templateService.getById(id);
          setName(tmpl.name);
          setDocType(tmpl.document_type);
          setIsDefault(tmpl.is_default);
          initialHtml = tmpl.html_content;
          initialCss = tmpl.css_content;
        } catch (err) {
          showToast('Failed to load template', 'error');
          navigate('/templates');
          return;
        }
      } else {
        setName('New Custom Template');
      }

      setLoading(false);

      // Initialize GrapesJS
      if (editorRef.current) {
        editor = grapesjs.init({
          container: editorRef.current,
          fromElement: false,
          height: '750px',
          width: 'auto',
          storageManager: false,
          components: initialHtml,
          style: initialCss,
          blockManager: {
            appendTo: '#blocks-container',
            blocks: [
              {
                id: 'section',
                label: 'Section Block',
                category: 'Basic',
                content: '<div style="padding: 20px; margin-bottom: 15px; border: 1px dashed #cbd5e1;">Content section</div>',
              },
              {
                id: 'text',
                label: 'Text Box',
                category: 'Basic',
                content: '<p style="margin: 5px 0;">Editable paragraph text</p>',
              },
              {
                id: 'heading',
                label: 'Heading',
                category: 'Basic',
                content: '<h2 style="color: #0f172a; margin: 10px 0;">Heading Title</h2>',
              },
              {
                id: 'items_table_block',
                label: 'Items Table',
                category: 'Invoice Elements',
                content: '<div style="margin: 15px 0;">{{items_table}}</div>',
              },
              {
                id: 'totals_summary_block',
                label: 'Totals Box',
                category: 'Invoice Elements',
                content: `
                  <div style="width: 260px; margin-left: auto; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px;">
                    <div>Subtotal: {{subtotal}}</div>
                    <div>Discount: {{discount}}</div>
                    <div>Tax: {{tax}}</div>
                    <div style="font-weight: bold; margin-top: 8px;">Grand Total: {{total}}</div>
                  </div>
                `,
              },
              {
                id: 'signature_block',
                label: 'Signature Box',
                category: 'Invoice Elements',
                content: `
                  <div style="width: 200px; text-align: center; margin-top: 30px;">
                    <div style="border-top: 1px solid #64748b; padding-top: 5px;">Authorized Signature</div>
                  </div>
                `,
              },
            ],
          },
        });

        editorInstanceRef.current = editor;
      }
    };

    initEditor();

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [id]);

  const insertPlaceholder = (tag) => {
    if (!editorInstanceRef.current) return;
    const selected = editorInstanceRef.current.getSelected();
    if (selected) {
      selected.append(tag);
      showToast(`Inserted ${tag} into selected element`, 'info');
    } else {
      editorInstanceRef.current.addComponents(`<span>${tag}</span>`);
      showToast(`Appended ${tag} to document`, 'info');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Please enter a template name', 'error');
      return;
    }

    if (!editorInstanceRef.current) return;

    setSaving(true);
    const html = editorInstanceRef.current.getHtml();
    const css = editorInstanceRef.current.getCss();

    const payload = {
      name,
      document_type: docType,
      html_content: html,
      css_content: css,
      is_default: isDefault,
    };

    try {
      if (id && id !== 'new') {
        await templateService.update(id, payload);
        showToast('Template updated successfully!', 'success');
      } else {
        const res = await templateService.create(payload);
        showToast('Template created successfully!', 'success');
        navigate(`/templates/${res.id}/edit`, { replace: true });
      }
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save template', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/templates')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Template Name..."
              className="text-lg font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden px-1 py-0.5 rounded-sm"
            />
            <p className="text-xs text-slate-400">GrapesJS Visual Document Designer</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="QUOTATION">Quotation Template</option>
            <option value="INVOICE">Invoice Template</option>
          </select>

          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-3.5 h-3.5 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
            />
            Set as Default
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/20 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Left 3 cols: GrapesJS Canvas */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div ref={editorRef} />
        </div>

        {/* Right 1 col: Sidebar for Blocks and Dynamic Placeholders */}
        <div className="space-y-4">
          {/* Dynamic Placeholders Picker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Dynamic Placeholders
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              Click any variable tag below to insert it into your document. Django replaces these during rendering:
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
              {DYNAMIC_PLACEHOLDERS.map((ph) => (
                <button
                  key={ph.tag}
                  type="button"
                  onClick={() => insertPlaceholder(ph.tag)}
                  title={`Insert ${ph.label}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                >
                  <Tag className="w-3 h-3 text-indigo-500" />
                  {ph.tag}
                </button>
              ))}
            </div>
          </div>

          {/* GrapesJS Blocks Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Standard Components
            </h3>
            <div id="blocks-container" />
          </div>
        </div>
      </div>
    </div>
  );
};
