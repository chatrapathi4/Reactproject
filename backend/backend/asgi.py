import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import re_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from whiteboard.consumers import UltraFastWhiteboardConsumer, UltraFastChatConsumer

websocket_urlpatterns = [
    re_path(r'ws/whiteboard/(?P<room_name>\w+)/$', UltraFastWhiteboardConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<room_name>\w+)/$', UltraFastChatConsumer.as_asgi()),
    re_path(r'ws/ide/(?P<ide_id>\w+)/$', UltraFastChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
