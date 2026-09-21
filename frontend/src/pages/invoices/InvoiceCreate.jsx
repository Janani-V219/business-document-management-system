import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentForm } from '../../components/documents/DocumentForm';
import { invoiceService } from '../../services/invoiceService';
import { useToast } from '../../context/ToastContext';

export const InvoiceCreate = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await invoiceService.create(formData);
      showToast(`Invoice ${res.invoice_number} generated successfully!`, 'success');
      navigate(`/invoices/${res.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DocumentForm
      title="Generate New Tax Invoice"
      documentType="INVOICE"
      onSubmit={handleSubmit}
      isSubmitting={submitting}
    />
  );
};
