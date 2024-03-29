from django.urls import path
from . import views

urlpatterns = [
    path('api/delete-user/', views.delete_user, name='delete_user'),
    path('api/create-user/', views.create_user, name='create_user'),
]
