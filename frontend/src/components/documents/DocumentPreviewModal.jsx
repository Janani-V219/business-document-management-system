import React, { useRef } from 'react';
import { Modal } from '../common/Modal';
import { Printer, Download, Edit, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DocumentPreviewModal = ({
  isOpen,
  onClose,
  documentId,
  documentNumber,
  documentType = 'QUOTATION', // 'QUOTATION' or 'INVOICE'
}) => {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  if (!documentId) return null;

  const previewUrl =
    documentType === 'QUOTATION'
      ? `/api/quotations/${documentId}/preview/`
      : `/api/invoices/${documentId}/preview/`;

  const pdfUrl =
    documentType === 'QUOTATION'
      ? `/api/quotations/${documentId}/pdf/`
      : `/api/invoices/${documentId}/pdf/`;

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleEdit = () => {
    onClose();
    if (documentType === 'QUOTATION') {
      navigate(`/quotations/${documentId}/edit`);
    } else {
      navigate(`/invoices/${documentId}/edit`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${documentNumber || 'Document'}`}
      maxWidth="max-w-4xl"
    >
      {/* Top action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div className="text-xs text-slate-500 font-medium">
          Document No: <span className="font-bold text-slate-800">{documentNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`${documentNumber}.pdf`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </a>
        </div>
      </div>

      {/* Embedded Document Preview iframe */}
      <div className="bg-slate-100 p-2 sm:p-4 rounded-xl border border-slate-200 shadow-inner">
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title="Document Preview"
          className="w-full h-[650px] bg-white rounded-lg shadow-sm border border-slate-200"
        />
      </div>
    </Modal>
  );
};
