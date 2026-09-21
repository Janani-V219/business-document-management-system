import axios from 'axios';
import { mockStorage } from './mockData';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock Handler for offline / static / live demo execution
const handleMockRequest = (config) => {
  const url = (config.url || '').replace(/^\/api/, '');
  const method = (config.method || 'get').toLowerCase();
  let data = config.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // noop
    }
  }

  // 1. Auth
  if (url.startsWith('/auth/login')) {
    const username = data?.username?.toLowerCase() || 'admin';
    const isStaff = username === 'staff';
    const mockUser = {
      id: isStaff ? 2 : 1,
      username: isStaff ? 'staff' : 'admin',
      first_name: isStaff ? 'Staff' : 'Janani',
      last_name: isStaff ? 'Member' : 'Admin',
      email: isStaff ? 'staff@invoicify.io' : 'admin@invoicify.io',
      role: isStaff ? 'STAFF' : 'ADMIN',
      is_staff: true,
      is_superuser: !isStaff,
    };
    return {
      data: {
        access: `mock-jwt-access-${Date.now()}`,
        refresh: `mock-jwt-refresh-${Date.now()}`,
        user: mockUser,
      },
      status: 200,
    };
  }

  if (url.startsWith('/auth/me')) {
    const saved = localStorage.getItem('user');
    const user = saved
      ? JSON.parse(saved)
      : {
          id: 1,
          username: 'admin',
          first_name: 'Janani',
          last_name: 'Admin',
          email: 'admin@invoicify.io',
          role: 'ADMIN',
        };
    return { data: user, status: 200 };
  }

  if (url.startsWith('/dashboard')) {
    return { data: mockStorage.getStats(), status: 200 };
  }

  // 2. Company & Numbering
  if (url.startsWith('/company')) {
    if (method === 'put') {
      const current = mockStorage.getCompany();
      const updated = { ...current, ...(data || {}) };
      mockStorage.saveCompany(updated);
      return { data: updated, status: 200 };
    }
    return { data: mockStorage.getCompany(), status: 200 };
  }

  if (url.startsWith('/settings/numbering')) {
    const numbering = mockStorage.getNumbering();
    if (method === 'put') {
      const parts = url.split('/').filter(Boolean);
      const docType = parts[parts.length - 1]?.toUpperCase();
      const updated = numbering.map((n) =>
        n.document_type === docType ? { ...n, ...(data || {}) } : n
      );
      mockStorage.saveNumbering(updated);
      return { data: data, status: 200 };
    }
    return { data: numbering, status: 200 };
  }

  // 3. Clients
  if (url.startsWith('/clients')) {
    const clients = mockStorage.getClients();
    const match = url.match(/\/clients\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      if (method === 'get') {
        const item = clients.find((c) => c.id === id) || clients[0];
        return { data: item, status: 200 };
      }
      if (method === 'put') {
        const updated = clients.map((c) => (c.id === id ? { ...c, ...data } : c));
        mockStorage.saveClients(updated);
        return { data: { ...data, id }, status: 200 };
      }
      if (method === 'delete') {
        mockStorage.saveClients(clients.filter((c) => c.id !== id));
        return { data: { success: true }, status: 204 };
      }
    }
    if (method === 'post') {
      const newClient = { ...data, id: Date.now(), created_at: new Date().toISOString() };
      mockStorage.saveClients([newClient, ...clients]);
      return { data: newClient, status: 201 };
    }
    return { data: clients, status: 200 };
  }

  // 4. Products
  if (url.startsWith('/products')) {
    const products = mockStorage.getProducts();
    const match = url.match(/\/products\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      if (method === 'get') {
        const item = products.find((p) => p.id === id) || products[0];
        return { data: item, status: 200 };
      }
      if (method === 'put') {
        const updated = products.map((p) => (p.id === id ? { ...p, ...data } : p));
        mockStorage.saveProducts(updated);
        return { data: { ...data, id }, status: 200 };
      }
      if (method === 'delete') {
        mockStorage.saveProducts(products.filter((p) => p.id !== id));
        return { data: { success: true }, status: 204 };
      }
    }
    if (method === 'post') {
      const newProduct = { ...data, id: Date.now(), created_at: new Date().toISOString() };
      mockStorage.saveProducts([newProduct, ...products]);
      return { data: newProduct, status: 201 };
    }
    return { data: products, status: 200 };
  }

  // 5. Quotations
  if (url.startsWith('/quotations')) {
    const quotations = mockStorage.getQuotations();
    if (url.includes('/duplicate')) {
      const match = url.match(/\/quotations\/(\d+)\/duplicate/);
      const id = parseInt(match[1]);
      const orig = quotations.find((q) => q.id === id);
      const dup = {
        ...orig,
        id: Date.now(),
        quotation_number: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(4, '0')}`,
        status: 'DRAFT',
      };
      mockStorage.saveQuotations([dup, ...quotations]);
      return { data: dup, status: 201 };
    }
    if (url.includes('/convert-to-invoice')) {
      const match = url.match(/\/quotations\/(\d+)\/convert-to-invoice/);
      const id = parseInt(match[1]);
      const orig = quotations.find((q) => q.id === id);
      const invoices = mockStorage.getInvoices();
      const newInv = {
        id: Date.now(),
        invoice_number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
        client: orig?.client || mockStorage.getClients()[0],
        client_id: orig?.client_id || 1,
        quotation_id: id,
        status: 'SENT',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        subtotal: orig?.subtotal || 0,
        tax_total: orig?.tax_total || 0,
        discount_total: orig?.discount_total || 0,
        total_amount: orig?.total_amount || 0,
        amount_paid: 0,
        items: orig?.items || [],
      };
      mockStorage.saveInvoices([newInv, ...invoices]);
      return { data: newInv, status: 201 };
    }
    const match = url.match(/\/quotations\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      if (method === 'get') {
        const item = quotations.find((q) => q.id === id) || quotations[0];
        return { data: item, status: 200 };
      }
      if (method === 'put') {
        const updated = quotations.map((q) => (q.id === id ? { ...q, ...data } : q));
        mockStorage.saveQuotations(updated);
        return { data: { ...data, id }, status: 200 };
      }
      if (method === 'delete') {
        mockStorage.saveQuotations(quotations.filter((q) => q.id !== id));
        return { data: { success: true }, status: 204 };
      }
    }
    if (method === 'post') {
      const newQuote = {
        ...data,
        id: Date.now(),
        quotation_number: `QT-${new Date().getFullYear()}-${String(quotations.length + 1).padStart(4, '0')}`,
        created_at: new Date().toISOString(),
      };
      mockStorage.saveQuotations([newQuote, ...quotations]);
      return { data: newQuote, status: 201 };
    }
    return { data: quotations, status: 200 };
  }

  // 6. Invoices
  if (url.startsWith('/invoices')) {
    const invoices = mockStorage.getInvoices();
    const match = url.match(/\/invoices\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      if (method === 'get') {
        const item = invoices.find((i) => i.id === id) || invoices[0];
        return { data: item, status: 200 };
      }
      if (method === 'put') {
        const updated = invoices.map((i) => (i.id === id ? { ...i, ...data } : i));
        mockStorage.saveInvoices(updated);
        return { data: { ...data, id }, status: 200 };
      }
      if (method === 'delete') {
        mockStorage.saveInvoices(invoices.filter((i) => i.id !== id));
        return { data: { success: true }, status: 204 };
      }
    }
    if (method === 'post') {
      const newInv = {
        ...data,
        id: Date.now(),
        invoice_number: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`,
        created_at: new Date().toISOString(),
      };
      mockStorage.saveInvoices([newInv, ...invoices]);
      return { data: newInv, status: 201 };
    }
    return { data: invoices, status: 200 };
  }

  // 7. Templates
  if (url.startsWith('/templates')) {
    const templates = mockStorage.getTemplates();
    const match = url.match(/\/templates\/(\d+)/);
    if (match) {
      const id = parseInt(match[1]);
      if (method === 'get') {
        const item = templates.find((t) => t.id === id) || templates[0];
        return { data: item, status: 200 };
      }
      if (method === 'put') {
        const updated = templates.map((t) => (t.id === id ? { ...t, ...data } : t));
        mockStorage.saveTemplates(updated);
        return { data: { ...data, id }, status: 200 };
      }
      if (method === 'delete') {
        mockStorage.saveTemplates(templates.filter((t) => t.id !== id));
        return { data: { success: true }, status: 204 };
      }
    }
    if (method === 'post') {
      const newTmpl = { ...data, id: Date.now(), created_at: new Date().toISOString() };
      mockStorage.saveTemplates([newTmpl, ...templates]);
      return { data: newTmpl, status: 201 };
    }
    return { data: templates, status: 200 };
  }

  // 8. Users
  if (url.startsWith('/users')) {
    return {
      data: [
        { id: 1, username: 'admin', first_name: 'Janani', last_name: 'Admin', email: 'admin@invoicify.io', role: 'ADMIN', is_active: true },
        { id: 2, username: 'staff', first_name: 'Staff', last_name: 'Member', email: 'staff@invoicify.io', role: 'STAFF', is_active: true },
      ],
      status: 200,
    };
  }

  return { data: {}, status: 200 };
};

// Response interceptor with graceful mock fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If real backend is offline or network error occurs, seamlessly serve mock data
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.response?.status === 404 ||
      error.response?.status === 502 ||
      error.response?.status === 503;

    if (isNetworkError) {
      try {
        const mockRes = handleMockRequest(error.config || {});
        return Promise.resolve(mockRes);
      } catch {
        // continue to error handling
      }
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${apiBase}/auth/refresh/`, { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem('access_token', newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.hash = '#/login';
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
