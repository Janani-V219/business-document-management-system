from django.urls import path
from .views import NumberingSettingsListView, NumberingSettingsDetailView

urlpatterns = [
    path('settings/numbering/', NumberingSettingsListView.as_view(), name='numbering_settings_list'),
    path('settings/numbering/<str:doc_type>/', NumberingSettingsDetailView.as_view(), name='numbering_settings_detail'),
]
