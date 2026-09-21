import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentForm } from '../../components/documents/DocumentForm';
import { quotationService } from '../../services/quotationService';
import { useToast } from '../../context/ToastContext';

export const QuotationEdit = () => {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await quotationService.getById(id);
        setQuotation(res);
      } catch (err) {
        showToast('Failed loading quotation', 'error');
        navigate('/quotations');
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await quotationService.update(id, formData);
      showToast(`Quotation ${res.quotation_number} updated successfully!`, 'success');
      navigate(`/quotations/${res.id}`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update quotation', 'error');
    } finally {
      setSubmitting(false);
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
    <DocumentForm
      title={`Edit Quotation: ${quotation.quotation_number}`}
      initialData={quotation}
      documentType="QUOTATION"
      onSubmit={handleSubmit}
      isSubmitting={submitting}
    />
  );
};
