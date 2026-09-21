import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { QuotationList } from './pages/quotations/QuotationList';
import { QuotationCreate } from './pages/quotations/QuotationCreate';
import { QuotationEdit } from './pages/quotations/QuotationEdit';
import { QuotationDetail } from './pages/quotations/QuotationDetail';
import { InvoiceList } from './pages/invoices/InvoiceList';
import { InvoiceCreate } from './pages/invoices/InvoiceCreate';
import { InvoiceEdit } from './pages/invoices/InvoiceEdit';
import { InvoiceDetail } from './pages/invoices/InvoiceDetail';
import { ClientsPage } from './pages/clients/ClientsPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { TemplatesPage } from './pages/templates/TemplatesPage';
import { TemplateEditorPage } from './pages/templates/TemplateEditorPage';
import { CompanyProfilePage } from './pages/company/CompanyProfilePage';
import { NumberingSettingsPage } from './pages/settings/NumberingSettingsPage';
import { UserManagementPage } from './pages/settings/UserManagementPage';

export function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected App Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Quotations */}
              <Route path="/quotations" element={<QuotationList />} />
              <Route path="/quotations/new" element={<QuotationCreate />} />
              <Route path="/quotations/:id" element={<QuotationDetail />} />
              <Route path="/quotations/:id/edit" element={<QuotationEdit />} />

              {/* Invoices */}
              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoices/new" element={<InvoiceCreate />} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/invoices/:id/edit" element={<InvoiceEdit />} />

              {/* Clients & Products */}
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/products" element={<ProductsPage />} />

              {/* Templates */}
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/templates/new" element={<TemplateEditorPage />} />
              <Route path="/templates/:id/edit" element={<TemplateEditorPage />} />

              {/* Company & Settings */}
              <Route path="/company" element={<CompanyProfilePage />} />
              <Route path="/settings/numbering" element={<NumberingSettingsPage />} />
              <Route path="/settings/users" element={<UserManagementPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
