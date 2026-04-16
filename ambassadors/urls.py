from django.urls import path
from . import views

app_name = 'ambassadors'

urlpatterns = [
    path('apply/', views.apply_ambassador, name='apply'),
    path('success/', views.application_success, name='success'),
    path('', views.ambassador_list, name='list'),
    path('<slug:slug>/', views.ambassador_detail, name='detail'),
]
