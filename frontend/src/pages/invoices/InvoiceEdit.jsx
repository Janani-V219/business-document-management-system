import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentForm } from '../../components/documents/DocumentForm';
import { invoiceService } from '../../services/invoiceService';
import { useToast } from '../../context/ToastContext';

export const InvoiceEdit = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await invoiceService.getById(id);
        setInvoice(res);
      } catch (err) {
        showToast('Failed loading invoice', 'error');
        navigate('/invoices');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await invoiceService.update(id, formData);
      showToast(`Invoice ${res.invoice_number} updated successfully!`, 'success');
      navigate(`/invoices/${res.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update invoice', 'error');
    } finally {
      setSubmitting(false);
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
    <DocumentForm
      title={`Edit Invoice: ${invoice.invoice_number}`}
      initialData={invoice}
      documentType="INVOICE"
      onSubmit={handleSubmit}
      isSubmitting={submitting}
    />
  );
};
