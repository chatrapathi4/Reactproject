import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"room_{self.room_name}"
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            
            if message_type == "join":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "user_joined",
                        "username": data.get("username"),
                        "sender_channel": self.channel_name
                    }
                )
            elif message_type == "draw_stroke":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "drawing_update",
                        "stroke_data": data,
                        "sender_channel": self.channel_name
                    }
                )
            elif message_type == "draw_complete":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "object_added",
                        "object_data": data,
                        "sender_channel": self.channel_name
                    }
                )
            elif message_type == "chat":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": data.get("message"),
                        "sender_channel": self.channel_name
                    }
                )
            elif message_type == "clear_canvas":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "canvas_cleared",
                        "sender_channel": self.channel_name
                    }
                )
        except Exception as e:
            print(f"WebSocket error: {e}")

    async def user_joined(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "user_joined",
                "username": event["username"]
            }))

    async def drawing_update(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "live_stroke",
                "stroke": event["stroke_data"]
            }))

    async def object_added(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "object_added",
                "object": event["object_data"]
            }))

    async def chat_message(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "chat",
                "message": event["message"]
            }))

    async def canvas_cleared(self, event):
        if event["sender_channel"] != self.channel_name:
            await self.send(text_data=json.dumps({
                "type": "canvas_cleared"
            }))