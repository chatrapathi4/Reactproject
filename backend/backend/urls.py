from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from whiteboard.views import (
    api_login, api_register, google_login, api_logout, 
    get_profile, update_profile, create_board, join_board, get_active_boards
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/login/', api_login),
    path('api/register/', api_register),
    path('api/google-login/', google_login),
    path('api/logout/', api_logout),
    path('api/profile/', get_profile),
    path('api/profile/update/', update_profile),
    path('api/board/create/', create_board),
    path('api/board/join/', join_board),
    path('api/boards/', get_active_boards),
    
    # Serve React app for all other routes (must be last)
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
