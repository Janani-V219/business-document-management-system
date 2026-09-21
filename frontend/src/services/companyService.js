import api from './api';

export const companyService = {
  getProfile: async () => {
    const res = await api.get('/company/');
    return res.data;
  },

  updateProfile: async (formData) => {
    const res = await api.put('/company/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/');
    return res.data;
  },
};

export const numberingService = {
  getSettings: async () => {
    const res = await api.get('/settings/numbering/');
    return res.data;
  },

  updateSetting: async (docType, data) => {
    const res = await api.put(`/settings/numbering/${docType}/`, data);
    return res.data;
  },
};
