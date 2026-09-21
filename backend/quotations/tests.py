from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from users.models import User
from clients.models import Client
from products.models import ProductService
from templates_app.models import DocumentTemplate
from numbering.models import NumberingSettings
from quotations.models import Quotation
from invoices.models import Invoice

class DocumentSystemTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin & Staff users
        self.admin = User.objects.create_user(
            username='admin_test',
            password='password123',
            role='ADMIN',
            is_staff=True
        )
        self.staff = User.objects.create_user(
            username='staff_test',
            password='password123',
            role='STAFF'
        )

        # Client
        self.customer = Client.objects.create(
            client_name='Acme Corp',
            email='acme@example.com',
            phone='1234567890'
        )

        # Product
        self.product = ProductService.objects.create(
            name='Web Development',
            rate=Decimal('1000.00'),
            tax_percentage=Decimal('18.00')
        )

        # Template
        self.template = DocumentTemplate.objects.create(
            name='Standard',
            document_type='QUOTATION',
            html_content='<div>{{quotation_number}}</div>',
            css_content='body { color: black; }',
            is_default=True
        )
        self.inv_template = DocumentTemplate.objects.create(
            name='Standard Invoice',
            document_type='INVOICE',
            html_content='<div>{{invoice_number}}</div>',
            css_content='body { color: black; }',
            is_default=True
        )

        # Numbering
        NumberingSettings.objects.all().delete()
        NumberingSettings.get_or_create_default('QUOTATION')
        NumberingSettings.get_or_create_default('INVOICE')

    def test_critical_numbering_rules_and_lifecycle(self):
        # Authenticate as admin
        self.client.force_authenticate(user=self.admin)

        # Test 1: Create quotation -> QTN-0001
        payload1 = {
            'client': self.customer.id,
            'template': self.template.id,
            'quotation_date': '2026-09-18',
            'valid_until': '2026-10-18',
            'status': 'DRAFT',
            'items': [
                {'item_name': 'Item A', 'quantity': 2, 'rate': '1000.00'}
            ]
        }
        res1 = self.client.post('/api/quotations/', payload1, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res1.data['quotation_number'], 'QTN-0001')
        q1_id = res1.data['id']

        # Test 2: Create another quotation -> QTN-0002
        res2 = self.client.post('/api/quotations/', payload1, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data['quotation_number'], 'QTN-0002')
        q2_id = res2.data['id']

        # Test 3: Print / Preview QTN-0002 -> Still QTN-0002
        res_prev = self.client.get(f'/api/quotations/{q2_id}/preview/')
        self.assertEqual(res_prev.status_code, status.HTTP_200_OK)
        q2_obj = Quotation.objects.get(id=q2_id)
        self.assertEqual(q2_obj.quotation_number, 'QTN-0002')

        # Test 4: Download QTN-0002 PDF -> Still QTN-0002
        res_pdf = self.client.get(f'/api/quotations/{q2_id}/pdf/')
        self.assertIn(res_pdf.status_code, [status.HTTP_200_OK])
        q2_obj.refresh_from_db()
        self.assertEqual(q2_obj.quotation_number, 'QTN-0002')

        # Test 5: Edit QTN-0002 -> Still QTN-0002
        res_edit = self.client.put(f'/api/quotations/{q2_id}/', {
            'client': self.customer.id,
            'template': self.template.id,
            'quotation_date': '2026-09-19',
            'valid_until': '2026-10-19',
            'quotation_number': 'QTN-9999', # Malicious attempt to change number
            'items': [
                {'item_name': 'Item A Updated', 'quantity': 3, 'rate': '1000.00'}
            ]
        }, format='json')
        self.assertEqual(res_edit.status_code, status.HTTP_200_OK)
        q2_obj.refresh_from_db()
        self.assertEqual(q2_obj.quotation_number, 'QTN-0002') # Unchanged!
        self.assertEqual(q2_obj.grand_total, Decimal('3540.00')) # 3000 + 18% tax

        # Test 6: Delete QTN-0002. Create another quotation -> QTN-0003 (NOT QTN-0002)
        res_del = self.client.delete(f'/api/quotations/{q2_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)

        res3 = self.client.post('/api/quotations/', payload1, format='json')
        self.assertEqual(res3.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res3.data['quotation_number'], 'QTN-0003')

        # Test 7: Create invoice -> INV-0001
        inv_payload = {
            'client': self.customer.id,
            'template': self.inv_template.id,
            'invoice_date': '2026-09-18',
            'due_date': '2026-10-02',
            'status': 'ISSUED',
            'items': [
                {'item_name': 'Consulting', 'quantity': 1, 'rate': '5000.00'}
            ]
        }
        res_inv1 = self.client.post('/api/invoices/', inv_payload, format='json')
        self.assertEqual(res_inv1.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_inv1.data['invoice_number'], 'INV-0001')

        # Test 8: Convert Quotation (QTN-0001) to Invoice -> New unique invoice number (INV-0002)
        res_conv = self.client.post(f'/api/quotations/{q1_id}/convert-to-invoice/')
        self.assertEqual(res_conv.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_conv.data['invoice_number'], 'INV-0002')
        self.assertEqual(res_conv.data['source_quotation'], q1_id)

        # Verify quotation marked as CONVERTED
        q1_obj = Quotation.objects.get(id=q1_id)
        self.assertEqual(q1_obj.status, 'CONVERTED')

        # Test duplicate conversion prevention
        res_conv_dup = self.client.post(f'/api/quotations/{q1_id}/convert-to-invoice/')
        self.assertEqual(res_conv_dup.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(res_conv_dup.data.get('already_converted'))

        # Test 9: Duplicate invoice creates new unique number (INV-0003)
        inv1_id = res_inv1.data['id']
        res_dup = self.client.post(f'/api/invoices/{inv1_id}/duplicate/')
        self.assertEqual(res_dup.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_dup.data['invoice_number'], 'INV-0003')

        # Test 10: Role permissions - Staff cannot modify numbering settings or delete documents
        self.client.force_authenticate(user=self.staff)

        # Staff can view documents
        res_staff_view = self.client.get('/api/quotations/')
        self.assertEqual(res_staff_view.status_code, status.HTTP_200_OK)

        # Staff cannot delete documents
        q3_id = res3.data['id']
        res_staff_del = self.client.delete(f'/api/quotations/{q3_id}/')
        self.assertEqual(res_staff_del.status_code, status.HTTP_403_FORBIDDEN)

        # Staff cannot modify numbering settings
        res_staff_num = self.client.put('/api/settings/numbering/QUOTATION/', {'prefix': 'HACK'}, format='json')
        self.assertEqual(res_staff_num.status_code, status.HTTP_403_FORBIDDEN)
