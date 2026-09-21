import api from './api';

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    if (res.data.access) {
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },

  getUsers: async () => {
    const res = await api.get('/users/');
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/users/', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.put(`/users/${id}/`, userData);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await api.delete(`/users/${id}/`);
    return res.data;
  },
};
