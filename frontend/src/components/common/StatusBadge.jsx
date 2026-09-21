import React from 'react';

const statusConfig = {
  // Quotation statuses
  DRAFT: { label: 'Draft', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
  SENT: { label: 'Sent', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  ACCEPTED: { label: 'Accepted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  EXPIRED: { label: 'Expired', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONVERTED: { label: 'Converted to Invoice', bg: 'bg-purple-50 text-purple-700 border-purple-200' },

  // Invoice statuses
  ISSUED: { label: 'Issued', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
  PAID: { label: 'Paid', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PARTIALLY_PAID: { label: 'Partially Paid', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  UNPAID: { label: 'Unpaid', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      {config.label}
    </span>
  );
};
