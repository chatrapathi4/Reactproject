import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from whiteboard.consumers import WhiteboardConsumer

websocket_urlpatterns = [
    path('ws/whiteboard/<str:room_name>/', WhiteboardConsumer.as_asgi()),
    path('ws/chat/<str:room_name>/', WhiteboardConsumer.as_asgi()),
    path('ws/ide/<str:room_name>/', WhiteboardConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})