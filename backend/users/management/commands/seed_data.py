from decimal import Decimal
from django.core.management.base import BaseCommand
from users.models import User
from company.models import CompanyProfile
from numbering.models import NumberingSettings
from templates_app.defaults import seed_default_templates
from clients.models import Client
from products.models import ProductService

class Command(BaseCommand):
    help = 'Seed initial database users, settings, company profile, templates, and demo data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding initial application data..."))

        # 1. Admin User
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin user: admin / admin123"))
        else:
            self.stdout.write(self.style.SUCCESS("Admin user already exists"))

        # 2. Staff User
        staff_user, created = User.objects.get_or_create(
            username='staff',
            defaults={
                'email': 'staff@example.com',
                'first_name': 'Business',
                'last_name': 'Staff',
                'role': 'STAFF',
                'is_staff': False,
                'is_superuser': False,
            }
        )
        if created:
            staff_user.set_password('staff123')
            staff_user.save()
            self.stdout.write(self.style.SUCCESS("Created Staff user: staff / staff123"))
        else:
            self.stdout.write(self.style.SUCCESS("Staff user already exists"))

        # 3. Company Profile
        company, _ = CompanyProfile.objects.get_or_create(
            id=1,
            defaults={
                'company_name': 'Apex Solutions Technologies',
                'address': 'Level 4, Cyber City Phase 2\nHitech City, Hyderabad, 500081',
                'phone': '+91 98765 43210',
                'email': 'billing@apexsolutions.com',
                'website': 'https://apexsolutions.io',
                'gst_number': '36AAACA1234A1Z5',
                'pan_number': 'AAACA1234A',
                'bank_name': 'HDFC Bank Ltd',
                'account_details': 'A/C: 50200012345678\nIFSC: HDFC0001234\nBranch: Hitech City',
                'payment_information': 'UPI: apexsolutions@hdfcbank\nSWIFT: HDFCINBBXXX',
                'default_terms': "1. Payment is due within 15 calendar days from document date.\n2. Invoices past due are subject to 1.5% monthly interest.\n3. Goods/services delivered remain company property until paid in full.",
            }
        )
        self.stdout.write(self.style.SUCCESS("Company profile configured"))

        # 4. Numbering Sequences
        NumberingSettings.get_or_create_default('QUOTATION')
        NumberingSettings.get_or_create_default('INVOICE')
        self.stdout.write(self.style.SUCCESS("Numbering sequences initialized"))

        # 5. Templates
        seed_default_templates()
        self.stdout.write(self.style.SUCCESS("Default document templates seeded"))

        # 6. Sample Clients
        sample_clients = [
            {
                'client_name': 'Rohit Sharma',
                'company_name': 'Acme Global Ventures Pvt Ltd',
                'email': 'rohit@acmeglobal.com',
                'phone': '+91 98111 22334',
                'gst_number': '27AACCA9876B1Z8',
                'address': 'Plot 45, Nariman Point, Mumbai 400021',
                'billing_address': 'Plot 45, Nariman Point, Mumbai 400021',
                'shipping_address': 'Plot 45, Nariman Point, Mumbai 400021',
                'notes': 'Enterprise corporate account, net 30 terms.'
            },
            {
                'client_name': 'Sarah Jenkins',
                'company_name': 'Nexus Digital Agency',
                'email': 'sarah@nexusagency.com',
                'phone': '+1 (415) 890-1234',
                'gst_number': '',
                'address': '540 Market St, San Francisco, CA 94104',
                'billing_address': '540 Market St, San Francisco, CA 94104',
                'shipping_address': '540 Market St, San Francisco, CA 94104',
                'notes': 'International client, USD/INR billing.'
            }
        ]
        for c in sample_clients:
            Client.objects.get_or_create(email=c['email'], defaults=c)
        self.stdout.write(self.style.SUCCESS("Sample clients created"))

        # 7. Sample Products / Services
        sample_products = [
            {
                'name': 'Custom Web Application Development',
                'description': 'Full-stack development using React, Python/Django, and PostgreSQL',
                'rate': Decimal('150000.00'),
                'tax_percentage': Decimal('18.00'),
                'unit': 'project',
                'status': 'ACTIVE',
            },
            {
                'name': 'Monthly Cloud Infrastructure Maintenance',
                'description': '24/7 server monitoring, security patches, automated backups',
                'rate': Decimal('25000.00'),
                'tax_percentage': Decimal('18.00'),
                'unit': 'month',
                'status': 'ACTIVE',
            },
            {
                'name': 'UI/UX Design & Brand Identity',
                'description': 'Figma wireframes, high-fidelity prototypes, brand guidelines',
                'rate': Decimal('45000.00'),
                'tax_percentage': Decimal('18.00'),
                'unit': 'milestone',
                'status': 'ACTIVE',
            },
            {
                'name': 'SEO & Social Media Management',
                'description': 'On-page SEO, weekly content calendar, and paid performance campaigns',
                'rate': Decimal('30000.00'),
                'tax_percentage': Decimal('18.00'),
                'unit': 'month',
                'status': 'ACTIVE',
            },
        ]
        for p in sample_products:
            ProductService.objects.get_or_create(name=p['name'], defaults=p)
        self.stdout.write(self.style.SUCCESS("Sample products and services created"))
        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
