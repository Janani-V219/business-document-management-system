import axios from 'axios';
import { mockStorage } from './mockData';

const apiBase = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

// Check if running in a static / GitHub Pages environment without custom backend URL
const isStaticDemoHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') || window.location.hostname.endsWith('github.io'));

// Mock Request Handler
const handleMockRequest = (config) => {
  let url = (config.url || '').replace(/^\/api\/?/, '/');
  if (!url.startsWith('/')) url = '/' + url;
  const method = (config.method || 'get').toLowerCase();

  let data = config.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // keep original
    }
  }

  // Document Preview iframe HTML
  if (url.includes('/preview')) {
    const isInvoice = url.includes('/invoices/');
    const previewHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoicify Preview</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b; margin: 0; }
    .container { max-width: 720px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 24px; }
    .title { font-size: 26px; font-weight: 800; color: #4f46e5; margin: 0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #047857; margin-top: 8px; }
    .section { margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; padding: 10px 14px; background: #f1f5f9; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; }
    td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .total-box { margin-top: 24px; margin-left: auto; max-width: 260px; padding: 16px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: #0f172a; padding-top: 8px; border-top: 1px solid #cbd5e1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="title">Invoicify</h1>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Invoicify Solutions Ltd.</div>
        <div class="badge">${isInvoice ? 'Official Invoice' : 'Official Quotation'}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 13px; font-weight: 700; color: #334155;">Status: Confirmed</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Date: ${new Date().toISOString().split('T')[0]}</div>
      </div>
    </div>
    <div class="section">
      <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Billed To</div>
      <div style="font-size: 15px; font-weight: 700; margin-top: 4px;">Acme Global Enterprises</div>
      <div style="font-size: 13px; color: #64748b;">100 Silicon Valley Blvd, San Jose, CA</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Full-Stack Cloud Development Sprint</td>
          <td>1</td>
          <td>$2,500.00</td>
          <td style="text-align: right; font-weight: 600;">$2,500.00</td>
        </tr>
        <tr>
          <td>Technical Architecture & Security Review</td>
          <td>1</td>
          <td>$600.00</td>
          <td style="text-align: right; font-weight: 600;">$600.00</td>
        </tr>
      </tbody>
    </table>
    <div class="total-box">
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-bottom: 6px;">
        <span>Subtotal</span>
        <span>$3,100.00</span>
      </div>
      <div class="total-row">
        <span>Grand Total</span>
        <span style="color: #4f46e5;">$3,100.00</span>
      </div>
    </div>
  </div>
</body>
</html>`;
    return { data: previewHtml, status: 200 };
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
          is_staff: true,
          is_superuser: true,
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

// Create Axios Instance
const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Custom adapter for static deployment hosts (e.g. GitHub Pages without custom backend)
if (isStaticDemoHost && !import.meta.env.VITE_API_URL) {
  api.defaults.adapter = async (config) => {
    await new Promise((resolve) => setTimeout(resolve, 80));
    const mockRes = handleMockRequest(config);
    return {
      data: mockRes.data,
      status: mockRes.status || 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
}

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

// Response interceptor with graceful mock fallback for local offline testing
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isOffline =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error') ||
      error.response?.status === 404 ||
      error.response?.status === 405 ||
      error.response?.status === 502 ||
      error.response?.status === 503;

    if (isOffline) {
      try {
        const mockRes = handleMockRequest(error.config || {});
        return Promise.resolve(mockRes);
      } catch (e) {
        console.warn('Mock fallback execution error:', e);
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
