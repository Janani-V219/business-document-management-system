import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentForm } from '../../components/documents/DocumentForm';
import { quotationService } from '../../services/quotationService';
import { useToast } from '../../context/ToastContext';

export const QuotationCreate = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await quotationService.create(formData);
      showToast(`Quotation ${res.quotation_number} generated successfully!`, 'success');
      navigate(`/quotations/${res.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to create quotation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DocumentForm
      title="Generate New Quotation"
      documentType="QUOTATION"
      onSubmit={handleSubmit}
      isSubmitting={submitting}
    />
  );
};
