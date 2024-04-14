from django.urls import path
from . import views

urlpatterns = [
    path('api/admin-login/', views.verify_token_view, name='verify_token_view'),
    path('api/delete-user/', views.delete_user, name='delete_user'),
    path('api/create-user/', views.create_user, name='create_user'),
    path('api/edit-user/', views.edit_user, name='edit_user'),
    path('api/send-sms/', views.send_sms, name='send_sms'),
]
