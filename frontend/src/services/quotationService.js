import api from './api';

export const quotationService = {
  getAll: async (params = {}) => {
    const res = await api.get('/quotations/', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/quotations/${id}/`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/quotations/', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/quotations/${id}/`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/quotations/${id}/`);
    return res.data;
  },

  duplicate: async (id) => {
    const res = await api.post(`/quotations/${id}/duplicate/`);
    return res.data;
  },

  convertToInvoice: async (id, force = false) => {
    const res = await api.post(`/quotations/${id}/convert-to-invoice/${force ? '?force=true' : ''}`);
    return res.data;
  },

  getPreviewHtmlUrl: (id) => `/api/quotations/${id}/preview/`,
  getPdfUrl: (id) => `/api/quotations/${id}/pdf/`,
};
