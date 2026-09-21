from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('company.urls')),
    path('api/', include('clients.urls')),
    path('api/', include('products.urls')),
    path('api/', include('numbering.urls')),
    path('api/', include('templates_app.urls')),
    path('api/', include('quotations.urls')),
    path('api/', include('invoices.urls')),
    path('api/', include('dashboard.urls')),
    path('api/', include('pdf.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
