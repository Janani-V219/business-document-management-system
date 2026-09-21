import os
import logging
from decimal import Decimal
from django.conf import settings
from django.http import HttpResponse

logger = logging.getLogger(__name__)

def format_currency(amount):
    try:
        val = Decimal(str(amount))
        return f"{val:,.2f}"
    except Exception:
        return str(amount)

def render_document_html(doc_obj, doc_type='QUOTATION'):
    """
    Renders the complete HTML by merging database data into the document template.
    """
    from company.models import CompanyProfile
    from templates_app.models import DocumentTemplate

    company = CompanyProfile.objects.first()
    if not company:
        company = CompanyProfile(company_name="Company Name")

    template = doc_obj.template
    if not template:
        template = DocumentTemplate.objects.filter(document_type=doc_type, is_default=True).first()
    if not template:
        template = DocumentTemplate.objects.filter(document_type=doc_type).first()

    html_tmpl = template.html_content if template else "<div>No Template Found</div>"
    css_tmpl = template.css_content if template else ""

    # Build items table HTML
    items_rows = ""
    for idx, item in enumerate(doc_obj.items.all(), 1):
        desc = f"<div style='font-size: 11px; color: #64748b; margin-top: 2px;'>{item.description}</div>" if item.description else ""
        items_rows += f"""
        <tr>
            <td style="width: 40px; text-align: center;">{idx}</td>
            <td><strong>{item.item_name}</strong>{desc}</td>
            <td style="text-align: center;">{item.quantity}</td>
            <td style="text-align: right;">{format_currency(item.rate)}</td>
            <td style="text-align: right; font-weight: 600;">{format_currency(item.amount)}</td>
        </tr>
        """

    items_table_html = f"""
    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Item & Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            {items_rows}
        </tbody>
    </table>
    """

    # Company Logo & Signature
    company_logo_html = ""
    if company.logo:
        company_logo_html = f"<img src='{company.logo.url}' alt='Logo' style='max-height: 60px; margin-bottom: 8px;' />"

    company_sig_html = ""
    if company.signature:
        company_sig_html = f"<img src='{company.signature.url}' alt='Signature' style='max-height: 50px; margin-bottom: 4px;' />"

    # Payment details formatting
    payment_details_text = ""
    if hasattr(doc_obj, 'payment_details') and doc_obj.payment_details:
        payment_details_text = doc_obj.payment_details.replace('\n', '<br>')
    elif company.bank_name or company.account_details:
        payment_details_text = f"Bank: {company.bank_name}<br>{company.account_details}<br>{company.payment_information}".replace('\n', '<br>')

    terms_text = doc_obj.terms_conditions.replace('\n', '<br>') if doc_obj.terms_conditions else (company.default_terms.replace('\n', '<br>') if company.default_terms else "")

    discount_label = f"{format_currency(doc_obj.discount_amount)}"
    if doc_obj.discount_type == 'PERCENTAGE' and doc_obj.discount_value > 0:
        discount_label += f" ({doc_obj.discount_value}%)"

    tax_label = f"{format_currency(doc_obj.tax_amount)}"
    if doc_obj.tax_enabled and doc_obj.tax_rate > 0:
        tax_label += f" ({doc_obj.tax_rate}%)"

    doc_num = getattr(doc_obj, 'quotation_number', None) or getattr(doc_obj, 'invoice_number', '')
    doc_date = getattr(doc_obj, 'quotation_date', None) or getattr(doc_obj, 'invoice_date', '')
    valid_until = getattr(doc_obj, 'valid_until', '')
    due_date = getattr(doc_obj, 'due_date', '')

    placeholders = {
        '{{company_name}}': company.company_name,
        '{{company_logo}}': company_logo_html,
        '{{company_address}}': company.address.replace('\n', ', ') if company.address else '',
        '{{company_phone}}': company.phone,
        '{{company_email}}': company.email,
        '{{company_website}}': company.website,
        '{{company_gst}}': company.gst_number,
        '{{company_pan}}': company.pan_number,

        '{{client_name}}': doc_obj.client.client_name,
        '{{client_company}}': doc_obj.client.company_name,
        '{{client_address}}': doc_obj.client.address.replace('\n', ', ') if doc_obj.client.address else '',
        '{{client_billing_address}}': doc_obj.client.billing_address.replace('\n', ', ') if doc_obj.client.billing_address else '',
        '{{client_shipping_address}}': doc_obj.client.shipping_address.replace('\n', ', ') if doc_obj.client.shipping_address else '',
        '{{client_phone}}': doc_obj.client.phone,
        '{{client_email}}': doc_obj.client.email,
        '{{client_gst}}': doc_obj.client.gst_number,

        '{{quotation_number}}': str(doc_num),
        '{{invoice_number}}': str(doc_num),
        '{{document_date}}': str(doc_date),
        '{{valid_until}}': str(valid_until),
        '{{due_date}}': str(due_date),

        '{{items_table}}': items_table_html,
        '{{subtotal}}': format_currency(doc_obj.subtotal),
        '{{discount}}': discount_label,
        '{{tax}}': tax_label,
        '{{total}}': format_currency(doc_obj.grand_total),
        '{{terms_conditions}}': terms_text,
        '{{payment_details}}': payment_details_text,
        '{{signature}}': company_sig_html,
    }

    # Replace placeholders
    rendered_html = html_tmpl
    for placeholder, val in placeholders.items():
        rendered_html = rendered_html.replace(placeholder, str(val))

    full_document = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{doc_num}</title>
    <style>
        {css_tmpl}
        @media print {{
            @page {{ size: A4; margin: 15mm; }}
            body {{ padding: 0 !important; background: white !important; }}
        }}
    </style>
</head>
<body>
    {rendered_html}
</body>
</html>
"""
    return full_document


def generate_pdf_response(doc_obj, doc_type='QUOTATION'):
    """
    Generates PDF response using WeasyPrint with graceful HTML print fallback if OS GTK DLLs are missing on Windows.
    """
    html_content = render_document_html(doc_obj, doc_type)
    doc_num = getattr(doc_obj, 'quotation_number', None) or getattr(doc_obj, 'invoice_number', 'document')
    filename = f"{doc_num}.pdf"

    try:
        import weasyprint
        pdf_bytes = weasyprint.HTML(string=html_content, base_url=str(settings.BASE_DIR)).write_pdf()
        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response
    except Exception as e:
        logger.warning(f"WeasyPrint rendering encountered an issue (e.g. native Pango DLLs on Windows): {e}")
        # Return print-ready HTML page with auto-print script so the user gets instant PDF print capability!
        print_html = html_content.replace(
            '</head>',
            '<script>window.onload = function() { window.print(); };</script></head>'
        )
        response = HttpResponse(print_html, content_type='text/html')
        return response
