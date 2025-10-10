from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from whiteboard.views import (
    api_login, api_register, google_login, api_logout, 
    get_profile, update_profile, create_board, join_board, get_active_boards,
    api_test  # Add this import
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints - MUST come before the catch-all route
    path('api/login/', api_login, name='api_login'),
    path('api/register/', api_register, name='api_register'),
    path('api/google-login/', google_login, name='google_login'),
    path('api/logout/', api_logout, name='api_logout'),
    path('api/profile/', get_profile, name='get_profile'),
    path('api/profile/update/', update_profile, name='update_profile'),
    path('api/board/create/', create_board, name='create_board'),
    path('api/board/join/', join_board, name='join_board'),
    path('api/boards/', get_active_boards, name='get_active_boards'),
    
    # Test endpoint
    path('api/test/', api_test, name='api_test'),
    
    # Serve React app for all other routes (MUST be last)
    re_path(r'^(?!api/).*$', TemplateView.as_view(template_name='index.html'), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
