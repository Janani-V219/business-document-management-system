import api from './api';

export const clientService = {
  getAll: async (params = {}) => {
    const res = await api.get('/clients/', { params });
    return res.data;
  },

  getById: async (id) => {
    const res = await api.get(`/clients/${id}/`);
    return res.data;
  },

  create: async (data) => {
    const res = await api.post('/clients/', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/clients/${id}/`, data);
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`/clients/${id}/`);
    return res.data;
  },
};
