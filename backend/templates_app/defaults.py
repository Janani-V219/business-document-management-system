"""
Default Built-in Document Templates for Quotations and Invoices
With dynamic placeholder support.
"""

STANDARD_CSS = """
* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
body { color: #1e293b; background: #fff; padding: 40px; font-size: 14px; line-height: 1.5; }
.doc-container { max-width: 800px; margin: 0 auto; }
.doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
.company-brand h1 { font-size: 26px; font-weight: 700; color: #0f172a; margin-bottom: 5px; }
.company-details { color: #64748b; font-size: 13px; line-height: 1.4; }
.doc-meta { text-align: right; }
.doc-badge { display: inline-block; font-size: 20px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
.meta-row { font-size: 13px; color: #475569; margin-bottom: 4px; }
.meta-row strong { color: #0f172a; }
.parties-section { display: flex; justify-content: space-between; margin-bottom: 35px; gap: 20px; }
.party-box { flex: 1; background: #f8fafc; padding: 18px; border-radius: 8px; border: 1px solid #e2e8f0; }
.party-title { font-size: 12px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
.party-name { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
.party-info { font-size: 13px; color: #475569; line-height: 1.4; }
.items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
.items-table th { background: #4f46e5; color: #ffffff; text-align: left; padding: 12px 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.items-table th:last-child, .items-table td:last-child { text-align: right; }
.items-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
.items-table tr:nth-child(even) { background: #f8fafc; }
.summary-container { display: flex; justify-content: flex-end; margin-bottom: 35px; }
.summary-box { width: 320px; }
.summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
.summary-row.total-row { border-top: 2px solid #4f46e5; border-bottom: none; font-size: 18px; font-weight: 700; color: #0f172a; padding-top: 12px; }
.notes-section { display: flex; justify-content: space-between; gap: 30px; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 25px; }
.terms-box { flex: 1.5; font-size: 12px; color: #64748b; line-height: 1.6; }
.terms-title { font-weight: 700; color: #0f172a; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; }
.signature-box { flex: 1; text-align: right; }
.sig-line { width: 180px; margin-left: auto; border-top: 1px solid #94a3b8; margin-top: 50px; margin-bottom: 6px; }
.sig-label { font-size: 12px; color: #475569; font-weight: 600; }
"""

STANDARD_QUOTATION_HTML = """
<div class="doc-container">
    <div class="doc-header">
        <div class="company-brand">
            <h1>{{company_name}}</h1>
            <div class="company-details">
                <div>{{company_address}}</div>
                <div>Phone: {{company_phone}} | Email: {{company_email}}</div>
                <div>GSTIN: {{company_gst}}</div>
            </div>
        </div>
        <div class="doc-meta">
            <div class="doc-badge">QUOTATION</div>
            <div class="meta-row"><strong>Quotation No:</strong> {{quotation_number}}</div>
            <div class="meta-row"><strong>Date:</strong> {{document_date}}</div>
            <div class="meta-row"><strong>Valid Until:</strong> {{valid_until}}</div>
        </div>
    </div>

    <div class="parties-section">
        <div class="party-box">
            <div class="party-title">Quotation For:</div>
            <div class="party-name">{{client_name}}</div>
            <div class="party-info">
                <div>{{client_company}}</div>
                <div>{{client_address}}</div>
                <div>Phone: {{client_phone}} | Email: {{client_email}}</div>
                <div>GSTIN: {{client_gst}}</div>
            </div>
        </div>
    </div>

    {{items_table}}

    <div class="summary-container">
        <div class="summary-box">
            <div class="summary-row"><span>Subtotal:</span><span>{{subtotal}}</span></div>
            <div class="summary-row"><span>Discount:</span><span>{{discount}}</span></div>
            <div class="summary-row"><span>Tax / GST:</span><span>{{tax}}</span></div>
            <div class="summary-row total-row"><span>Grand Total:</span><span>{{total}}</span></div>
        </div>
    </div>

    <div class="notes-section">
        <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div>{{terms_conditions}}</div>
        </div>
        <div class="signature-box">
            <div class="sig-line"></div>
            <div class="sig-label">Authorized Signature</div>
            <div style="font-size: 11px; color: #94a3b8;">{{company_name}}</div>
        </div>
    </div>
</div>
"""

STANDARD_INVOICE_HTML = """
<div class="doc-container">
    <div class="doc-header">
        <div class="company-brand">
            <h1>{{company_name}}</h1>
            <div class="company-details">
                <div>{{company_address}}</div>
                <div>Phone: {{company_phone}} | Email: {{company_email}}</div>
                <div>GSTIN: {{company_gst}}</div>
            </div>
        </div>
        <div class="doc-meta">
            <div class="doc-badge" style="color: #059669;">TAX INVOICE</div>
            <div class="meta-row"><strong>Invoice No:</strong> {{invoice_number}}</div>
            <div class="meta-row"><strong>Invoice Date:</strong> {{document_date}}</div>
            <div class="meta-row"><strong>Due Date:</strong> {{due_date}}</div>
        </div>
    </div>

    <div class="parties-section">
        <div class="party-box">
            <div class="party-title" style="color: #059669;">Billed To:</div>
            <div class="party-name">{{client_name}}</div>
            <div class="party-info">
                <div>{{client_company}}</div>
                <div>{{client_address}}</div>
                <div>Phone: {{client_phone}} | Email: {{client_email}}</div>
                <div>GSTIN: {{client_gst}}</div>
            </div>
        </div>
        <div class="party-box">
            <div class="party-title" style="color: #059669;">Payment Details:</div>
            <div class="party-info">
                <div>{{payment_details}}</div>
            </div>
        </div>
    </div>

    {{items_table}}

    <div class="summary-container">
        <div class="summary-box">
            <div class="summary-row"><span>Subtotal:</span><span>{{subtotal}}</span></div>
            <div class="summary-row"><span>Discount:</span><span>{{discount}}</span></div>
            <div class="summary-row"><span>Tax / GST:</span><span>{{tax}}</span></div>
            <div class="summary-row total-row" style="border-top-color: #059669;"><span>Total Amount Due:</span><span>{{total}}</span></div>
        </div>
    </div>

    <div class="notes-section">
        <div class="terms-box">
            <div class="terms-title">Terms & Conditions</div>
            <div>{{terms_conditions}}</div>
        </div>
        <div class="signature-box">
            <div class="sig-line"></div>
            <div class="sig-label">Authorized Signature</div>
            <div style="font-size: 11px; color: #94a3b8;">{{company_name}}</div>
        </div>
    </div>
</div>
"""

def seed_default_templates():
    from .models import DocumentTemplate

    templates = [
        {
            'name': 'Standard Quotation',
            'document_type': 'QUOTATION',
            'html_content': STANDARD_QUOTATION_HTML.strip(),
            'css_content': STANDARD_CSS.strip(),
            'is_default': True,
        },
        {
            'name': 'Corporate Quotation',
            'document_type': 'QUOTATION',
            'html_content': STANDARD_QUOTATION_HTML.strip(),
            'css_content': STANDARD_CSS.replace('#4f46e5', '#0284c7').strip(),
            'is_default': False,
        },
        {
            'name': 'Minimal Quotation',
            'document_type': 'QUOTATION',
            'html_content': STANDARD_QUOTATION_HTML.strip(),
            'css_content': STANDARD_CSS.replace('#4f46e5', '#334155').strip(),
            'is_default': False,
        },
        {
            'name': 'Standard Tax Invoice',
            'document_type': 'INVOICE',
            'html_content': STANDARD_INVOICE_HTML.strip(),
            'css_content': STANDARD_CSS.replace('#4f46e5', '#059669').strip(),
            'is_default': True,
        },
        {
            'name': 'Corporate Invoice',
            'document_type': 'INVOICE',
            'html_content': STANDARD_INVOICE_HTML.strip(),
            'css_content': STANDARD_CSS.replace('#4f46e5', '#2563eb').strip(),
            'is_default': False,
        },
        {
            'name': 'Minimal Invoice',
            'document_type': 'INVOICE',
            'html_content': STANDARD_INVOICE_HTML.strip(),
            'css_content': STANDARD_CSS.replace('#4f46e5', '#1e293b').strip(),
            'is_default': False,
        },
    ]

    for t in templates:
        DocumentTemplate.objects.get_or_create(
            name=t['name'],
            document_type=t['document_type'],
            defaults=t
        )
