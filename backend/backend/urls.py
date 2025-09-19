from django.contrib import admin
from django.urls import path
from whiteboard.views import api_login, api_register, google_login, api_logout, get_profile, update_profile, create_board

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', api_login),
    path('api/register/', api_register),
    path('api/google-login/', google_login),
    path('api/logout/', api_logout),
    path('api/profile/', get_profile),
    path('api/profile/update/', update_profile),
    path('api/board/create/', create_board),
]
