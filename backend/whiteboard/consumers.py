import json
import asyncio
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
from asgiref.sync import sync_to_async

# In-memory stores for ultra-fast access
ROOM_STATES = {}
USER_CONNECTIONS = {}
LAST_UPDATE_TIME = {}

class UltraFastWhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"whiteboard_{self.room_name}"
        self.user_id = f"user_{int(time.time() * 1000)}"
        
        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        # Initialize room state
        if self.room_name not in ROOM_STATES:
            ROOM_STATES[self.room_name] = {
                'objects': [],
                'users': set(),
                'last_update': time.time()
            }
        
        # Send current state immediately
        await self.send(text_data=json.dumps({
            "type": "state_sync",
            "objects": ROOM_STATES[self.room_name]['objects'],
            "timestamp": time.time()
        }))

    async def disconnect(self, close_code):
        # Remove user from room
        if self.room_name in ROOM_STATES and hasattr(self, 'username'):
            ROOM_STATES[self.room_name]['users'].discard(self.username)
            await self.broadcast_user_list()
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            current_time = time.time()
            
            if message_type == "join":
                self.username = data.get("username", f"User_{self.user_id}")
                ROOM_STATES[self.room_name]['users'].add(self.username)
                await self.broadcast_user_list()
                
            elif message_type == "draw_stroke":
                # Ultra-fast drawing updates
                await self.handle_drawing_stroke(data, current_time)
                
            elif message_type == "draw_complete":
                # Save completed drawing
                await self.save_drawing_object(data)
                
            elif message_type == "clear_canvas":
                ROOM_STATES[self.room_name]['objects'] = []
                await self.broadcast_clear()
                
            elif message_type == "add_shape":
                await self.add_shape(data)
                
        except Exception as e:
            print(f"WebSocket error: {e}")

    async def handle_drawing_stroke(self, data, timestamp):
        """Handle real-time drawing strokes with minimal latency"""
        stroke_data = {
            "type": "live_stroke",
            "points": data.get("points", []),
            "color": data.get("color", "#ff00cc"),
            "lineWidth": data.get("lineWidth", 2),
            "tool": data.get("tool", "pen"),
            "user": getattr(self, 'username', 'Anonymous'),
            "timestamp": timestamp
        }
        
        # Broadcast immediately to all users in room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "stroke_update",
                "stroke": stroke_data,
                "sender": self.channel_name
            }
        )

    async def stroke_update(self, event):
        """Send stroke updates to all clients except sender"""
        if event["sender"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "live_stroke",
                "stroke": event["stroke"]
            }))

    async def save_drawing_object(self, data):
        """Save completed drawing object"""
        drawing_object = {
            "id": f"obj_{int(time.time() * 1000)}_{len(ROOM_STATES[self.room_name]['objects'])}",
            "type": data.get("type", "path"),
            "points": data.get("points", []),
            "color": data.get("color", "#ff00cc"),
            "lineWidth": data.get("lineWidth", 2),
            "user": getattr(self, 'username', 'Anonymous'),
            "timestamp": time.time()
        }
        
        # Add to room state
        ROOM_STATES[self.room_name]['objects'].append(drawing_object)
        ROOM_STATES[self.room_name]['last_update'] = time.time()
        
        # Broadcast to all users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "object_added",
                "object": drawing_object
            }
        )

    async def object_added(self, event):
        """Broadcast new objects to all clients"""
        await self.send(text_data=json.dumps({
            "type": "object_added",
            "object": event["object"]
        }))

    async def add_shape(self, data):
        """Add geometric shapes"""
        shape_object = {
            "id": f"shape_{int(time.time() * 1000)}",
            "type": data.get("shape_type", "rectangle"),
            "startX": data.get("startX", 0),
            "startY": data.get("startY", 0),
            "endX": data.get("endX", 0),
            "endY": data.get("endY", 0),
            "color": data.get("color", "#ff00cc"),
            "lineWidth": data.get("lineWidth", 2),
            "user": getattr(self, 'username', 'Anonymous'),
            "timestamp": time.time()
        }
        
        ROOM_STATES[self.room_name]['objects'].append(shape_object)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "shape_added",
                "shape": shape_object
            }
        )

    async def shape_added(self, event):
        await self.send(text_data=json.dumps({
            "type": "shape_added",
            "shape": event["shape"]
        }))

    async def broadcast_clear(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "canvas_cleared"}
        )

    async def canvas_cleared(self, event):
        await self.send(text_data=json.dumps({
            "type": "canvas_cleared"
        }))

    async def broadcast_user_list(self):
        users_list = list(ROOM_STATES[self.room_name]['users'])
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_list_update",
                "users": users_list
            }
        )

    async def user_list_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "users": event["users"]
        }))


# Ultra-fast Chat Consumer
class UltraFastChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        
        if data.get("type") == "chat":
            message = data.get("message")
            message["id"] = f"msg_{int(time.time() * 1000)}"
            message["server_timestamp"] = time.time()
            
            # Broadcast immediately
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat",
            "message": event["message"]
        }))
