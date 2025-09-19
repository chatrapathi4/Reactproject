from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("ws/whiteboard/<room_name>/", consumers.WhiteboardConsumer.as_asgi()),
    path("ws/ide/<ide_id>/", consumers.IDEConsumer.as_asgi()),
    path("ws/chat/<chat_id>/", consumers.ChatConsumer.as_asgi()),  
]

