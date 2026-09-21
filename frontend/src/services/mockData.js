// Seed data and mock storage engine for live interactive demo

const STORAGE_KEYS = {
  CLIENTS: 'invoicify_clients',
  PRODUCTS: 'invoicify_products',
  QUOTATIONS: 'invoicify_quotations',
  INVOICES: 'invoicify_invoices',
  COMPANY: 'invoicify_company',
  NUMBERING: 'invoicify_numbering',
  TEMPLATES: 'invoicify_templates',
};

const INITIAL_COMPANY = {
  name: 'Invoicify Solutions Ltd.',
  email: 'billing@invoicify.io',
  phone: '+1 (555) 987-6543',
  address: '742 Evergreen Suite 400, San Francisco, CA 94107',
  tax_id: 'US-TAX-8923481',
  currency: 'USD',
  currency_symbol: '$',
  notes: 'Payment terms: 30 days net from invoice date. Thank you for your business.',
  logo: '',
};

const INITIAL_NUMBERING = [
  {
    document_type: 'QUOTATION',
    prefix: 'QT',
    separator: '-',
    date_format: 'YYYY',
    min_digits: 4,
    current_number: 3,
    sample_preview: 'QT-2026-0003',
  },
  {
    document_type: 'INVOICE',
    prefix: 'INV',
    separator: '-',
    date_format: 'YYYY',
    min_digits: 4,
    current_number: 3,
    sample_preview: 'INV-2026-0003',
  },
];

const INITIAL_CLIENTS = [
  {
    id: 1,
    name: 'Acme Global Enterprises',
    contact_person: 'Sarah Jenkins',
    email: 'sjenkins@acmeglobal.com',
    phone: '+1 (555) 234-5678',
    tax_number: 'US987654321',
    address: '100 Silicon Valley Blvd, San Jose, CA',
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'TechSphere Media Corp',
    contact_person: 'David Chen',
    email: 'dchen@techsphere.io',
    phone: '+1 (555) 876-5432',
    tax_number: 'GB123456789',
    address: '45 Tech City Road, London, UK',
    created_at: '2026-09-05T14:30:00Z',
  },
  {
    id: 3,
    name: 'Lumina Studio & Co.',
    contact_person: 'Elena Rostova',
    email: 'elena@luminastudio.design',
    phone: '+1 (555) 345-6789',
    tax_number: 'FR987123654',
    address: '12 Rue de la Paix, Paris, France',
    created_at: '2026-09-10T09:15:00Z',
  },
];

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Full-Stack Web Application Development',
    description: 'Custom web app engineering, architecture design, and cloud deployment.',
    unit_price: 2500.0,
    unit: 'project',
    tax_rate: 10.0,
    created_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'UI/UX Design & Brand System',
    description: 'Complete Figma UI component library, wireframes, user journeys, and prototypes.',
    unit_price: 1200.0,
    unit: 'package',
    tax_rate: 10.0,
    created_at: '2026-09-02T10:00:00Z',
  },
  {
    id: 3,
    name: 'Cloud Infrastructure & DevOps SLA',
    description: 'Automated CI/CD pipelines, Docker containerization, and monitoring setup.',
    unit_price: 850.0,
    unit: 'monthly',
    tax_rate: 18.0,
    created_at: '2026-09-03T10:00:00Z',
  },
  {
    id: 4,
    name: 'Technical Security & Performance Audit',
    description: 'Vulnerability assessment, code analysis, and Lighthouse speed tuning.',
    unit_price: 600.0,
    unit: 'audit',
    tax_rate: 10.0,
    created_at: '2026-09-04T10:00:00Z',
  },
];

const INITIAL_QUOTATIONS = [
  {
    id: 1,
    quotation_number: 'QT-2026-0001',
    client: INITIAL_CLIENTS[0],
    client_id: 1,
    status: 'ACCEPTED',
    issue_date: '2026-09-05',
    valid_until: '2026-10-05',
    subtotal: 5000.0,
    tax_total: 500.0,
    discount_total: 250.0,
    total_amount: 5250.0,
    notes: 'Quotation includes 30 days of post-deployment support.',
    items: [
      {
        id: 1,
        description: 'Full-Stack Web Application Development',
        quantity: 2,
        unit_price: 2500.0,
        tax_rate: 10.0,
        discount: 5.0,
        total: 4750.0,
      },
    ],
    created_at: '2026-09-05T11:00:00Z',
  },
  {
    id: 2,
    quotation_number: 'QT-2026-0002',
    client: INITIAL_CLIENTS[1],
    client_id: 2,
    status: 'SENT',
    issue_date: '2026-09-12',
    valid_until: '2026-10-12',
    subtotal: 3350.0,
    tax_total: 488.0,
    discount_total: 0.0,
    total_amount: 3838.0,
    notes: 'Delivered in two sprint milestones.',
    items: [
      {
        id: 2,
        description: 'UI/UX Design & Brand System',
        quantity: 2,
        unit_price: 1200.0,
        tax_rate: 10.0,
        discount: 0,
        total: 2400.0,
      },
      {
        id: 3,
        description: 'Cloud Infrastructure & DevOps SLA',
        quantity: 1,
        unit_price: 950.0,
        tax_rate: 18.0,
        discount: 0,
        total: 950.0,
      },
    ],
    created_at: '2026-09-12T15:30:00Z',
  },
];

const INITIAL_INVOICES = [
  {
    id: 1,
    invoice_number: 'INV-2026-0001',
    client: INITIAL_CLIENTS[0],
    client_id: 1,
    quotation_id: 1,
    status: 'PAID',
    issue_date: '2026-09-10',
    due_date: '2026-09-25',
    subtotal: 5000.0,
    tax_total: 500.0,
    discount_total: 250.0,
    total_amount: 5250.0,
    amount_paid: 5250.0,
    notes: 'Payment confirmed via Wire Transfer. Thank you!',
    items: [
      {
        id: 1,
        description: 'Full-Stack Web Application Development - Milestone 1',
        quantity: 2,
        unit_price: 2500.0,
        tax_rate: 10.0,
        discount: 5.0,
        total: 4750.0,
      },
    ],
    created_at: '2026-09-10T12:00:00Z',
  },
  {
    id: 2,
    invoice_number: 'INV-2026-0002',
    client: INITIAL_CLIENTS[2],
    client_id: 3,
    status: 'SENT',
    issue_date: '2026-09-15',
    due_date: '2026-09-30',
    subtotal: 1800.0,
    tax_total: 180.0,
    discount_total: 0.0,
    total_amount: 1980.0,
    amount_paid: 0.0,
    notes: 'Please remit payment before the due date.',
    items: [
      {
        id: 2,
        description: 'Technical Security & Performance Audit',
        quantity: 3,
        unit_price: 600.0,
        tax_rate: 10.0,
        discount: 0,
        total: 1800.0,
      },
    ],
    created_at: '2026-09-15T09:00:00Z',
  },
];

const INITIAL_TEMPLATES = [
  {
    id: 1,
    name: 'Standard Corporate Modern',
    description: 'Clean, structured business document with crisp header, tables, and signature section.',
    is_default: true,
    html_content: '<div class="invoice-box"><h2>Invoicify Document</h2></div>',
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Creative Studio Minimal',
    description: 'High-contrast typography and subtle borders tailored for creative agencies.',
    is_default: false,
    html_content: '<div class="minimal-box"><h2>Studio Invoice</h2></div>',
    created_at: '2026-09-05T00:00:00Z',
  },
];

function getStored(key, initial) {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(val);
  } catch {
    return initial;
  }
}

function setStored(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const mockStorage = {
  getClients: () => getStored(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
  saveClients: (clients) => setStored(STORAGE_KEYS.CLIENTS, clients),

  getProducts: () => getStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  saveProducts: (products) => setStored(STORAGE_KEYS.PRODUCTS, products),

  getQuotations: () => getStored(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS),
  saveQuotations: (quotes) => setStored(STORAGE_KEYS.QUOTATIONS, quotes),

  getInvoices: () => getStored(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (invs) => setStored(STORAGE_KEYS.INVOICES, invs),

  getCompany: () => getStored(STORAGE_KEYS.COMPANY, INITIAL_COMPANY),
  saveCompany: (comp) => setStored(STORAGE_KEYS.COMPANY, comp),

  getNumbering: () => getStored(STORAGE_KEYS.NUMBERING, INITIAL_NUMBERING),
  saveNumbering: (num) => setStored(STORAGE_KEYS.NUMBERING, num),

  getTemplates: () => getStored(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES),
  saveTemplates: (tmpl) => setStored(STORAGE_KEYS.TEMPLATES, tmpl),

  getStats: () => {
    const quotes = getStored(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
    const invoices = getStored(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);

    const totalRevenue = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);

    const pendingRevenue = invoices
      .filter((i) => i.status !== 'PAID')
      .reduce((sum, i) => sum + (parseFloat(i.total_amount) || 0), 0);

    return {
      cards: {
        total_quotations: quotes.length,
        total_invoices: invoices.length,
        total_revenue: totalRevenue,
        pending_amount: pendingRevenue,
        pending_quotations: quotes.filter((q) => q.status === 'SENT' || q.status === 'DRAFT').length,
        pending_invoices: invoices.filter((i) => i.status === 'SENT').length,
      },
      recent_documents: [
        ...invoices.map((i) => ({
          id: i.id,
          type: 'Invoice',
          doc_number: i.invoice_number,
          client_name: i.client?.name || 'Client',
          status: i.status,
          total: i.total_amount,
          date: i.issue_date,
        })),
        ...quotes.map((q) => ({
          id: q.id,
          type: 'Quotation',
          doc_number: q.quotation_number,
          client_name: q.client?.name || 'Client',
          status: q.status,
          total: q.total_amount,
          date: q.issue_date,
        })),
      ].slice(0, 8),
    };
  },
};
