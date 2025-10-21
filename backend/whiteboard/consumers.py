import json
from collections import defaultdict
from channels.generic.websocket import AsyncWebsocketConsumer
import logging

logger = logging.getLogger("whiteboard.consumers")

# In-memory presence (dev only). For multi-process / prod, use Redis or DB.
ROOM_USERS = defaultdict(set)          # room_group_name -> set(usernames)
CHANNEL_USER = {}                      # channel_name -> (room_group_name, username)

class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
            self.room_group_name = f"room_{self.room_name}"

            logger.info("connect: channel=%s room=%s scope_path=%s", self.channel_name, self.room_group_name, self.scope.get("path"))
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        except Exception as e:
            logger.exception("connect error: %s", e)
            # ensure connection closes cleanly
            await self.close(code=1011)

    async def disconnect(self, close_code):
        try:
            info = CHANNEL_USER.pop(self.channel_name, None)
            if info:
                room, username = info
                ROOM_USERS[room].discard(username)
                # broadcast left and authoritative list
                await self.channel_layer.group_send(room, {"type": "user_left", "username": username, "sender_channel": self.channel_name})
                await self.channel_layer.group_send(room, {"type": "user_list", "users": list(ROOM_USERS[room]), "sender_channel": self.channel_name})
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            logger.info("disconnect: channel=%s code=%s", self.channel_name, close_code)
        except Exception as e:
            logger.exception("disconnect error: %s", e)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.debug("[receive] channel=%s data=%s", self.channel_name, data)
            message_type = data.get("type")

            if message_type == "join":
                username = data.get("username") or f"User_{self.channel_name[-6:]}"
                # update mapping (idempotent)
                prev = CHANNEL_USER.get(self.channel_name)
                CHANNEL_USER[self.channel_name] = (self.room_group_name, username)
                ROOM_USERS[self.room_group_name].add(username)

                # Notify group and send authoritative list
                await self.channel_layer.group_send(self.room_group_name, {"type":"user_joined","username": username, "sender_channel": self.channel_name})
                await self.channel_layer.group_send(self.room_group_name, {"type":"user_list","users": list(ROOM_USERS[self.room_group_name]), "sender_channel": self.channel_name})

            elif message_type == "chat":
                await self.channel_layer.group_send(self.room_group_name, {"type":"chat_message","message": data.get("message"), "sender_channel": self.channel_name})

            elif message_type == "draw_stroke":
                await self.channel_layer.group_send(self.room_group_name, {"type":"drawing_update","stroke_data": data, "sender_channel": self.channel_name})

            elif message_type == "draw_complete":
                await self.channel_layer.group_send(self.room_group_name, {"type":"object_added","object_data": data, "sender_channel": self.channel_name})

            elif message_type == "clear_canvas":
                await self.channel_layer.group_send(self.room_group_name, {"type":"canvas_cleared","sender_channel": self.channel_name})

        except Exception as e:
            logger.exception("receive error: %s (raw=%s)", e, text_data)
            # optional: inform client
            try:
                await self.send(text_data=json.dumps({"type":"error","message":"server_error"}))
            except Exception:
                pass

    # event handlers (keep existing behavior)
    async def user_joined(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"user_joined","username": event["username"]}))

    async def user_left(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"user_left","username": event.get("username")}))

    async def user_list(self, event):
        await self.send(text_data=json.dumps({"type":"user_list","users": event.get("users", [])}))

    async def drawing_update(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"live_stroke","stroke": event["stroke_data"]}))

    async def object_added(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"object_added","object": event["object_data"]}))

    async def chat_message(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"chat","message": event["message"]}))

    async def canvas_cleared(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"canvas_cleared"}))

# --- APPLY SAME PRESENCE LOGIC TO IDEConsumer and ChatConsumer (copy pattern) ---
class IDEConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ide_id = self.scope["url_route"]["kwargs"].get("ide_id")
        self.room_group_name = f"ide_{self.ide_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        info = CHANNEL_USER.pop(self.channel_name, None)
        if info:
            room, username = info
            ROOM_USERS[room].discard(username)
            await self.channel_layer.group_send(room, {"type":"user_left","username": username, "sender_channel": self.channel_name})
            await self.channel_layer.group_send(room, {"type":"user_list","users": list(ROOM_USERS[room]), "sender_channel": self.channel_name})
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            t = data.get("type")
            if t == "join":
                username = data.get("username") or f"User_{self.channel_name[-4:]}"
                CHANNEL_USER[self.channel_name] = (self.room_group_name, username)
                ROOM_USERS[self.room_group_name].add(username)
                await self.channel_layer.group_send(self.room_group_name, {"type":"user_joined","username": username, "sender_channel": self.channel_name})
                await self.channel_layer.group_send(self.room_group_name, {"type":"user_list","users": list(ROOM_USERS[self.room_group_name]), "sender_channel": self.channel_name})
            elif t in ("code_update", "file_change", "output", "run_complete"):
                await self.channel_layer.group_send(self.room_group_name, {"type": t, "payload": data, "sender_channel": self.channel_name})
        except Exception as e:
            print(f"IDEConsumer error: {e}")

    async def user_joined(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"user_joined","username": event["username"]}))

    async def user_left(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"user_left","username": event.get("username")}))

    async def user_list(self, event):
        await self.send(text_data=json.dumps({"type":"user_list","users": event.get("users", [])}))

    async def code_update(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"code_update","code": event["payload"].get("code"), "file": event["payload"].get("file")}))

    async def file_change(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"file_change","file": event["payload"].get("file"), "code": event["payload"].get("code")}))

    async def output(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"output","output": event["payload"].get("output")}))

    async def run_complete(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"run_complete"}))


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"].get("chat_id")
        self.room_group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        info = CHANNEL_USER.pop(self.channel_name, None)
        if info:
            room, username = info
            ROOM_USERS[room].discard(username)
            await self.channel_layer.group_send(room, {"type":"user_left","username": username, "sender_channel": self.channel_name})
            await self.channel_layer.group_send(room, {"type":"user_list","users": list(ROOM_USERS[room]), "sender_channel": self.channel_name})
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            t = data.get("type")
            if t == "join":
                username = data.get("username") or f"User_{self.channel_name[-4:]}"
                CHANNEL_USER[self.channel_name] = (self.room_group_name, username)
                ROOM_USERS[self.room_group_name].add(username)
                await self.channel_layer.group_send(self.room_group_name, {"type":"user_joined","username": username, "sender_channel": self.channel_name})
                await self.channel_layer.group_send(self.room_group_name, {"type":"user_list","users": list(ROOM_USERS[self.room_group_name]), "sender_channel": self.channel_name})
            elif t == "chat":
                await self.channel_layer.group_send(self.room_group_name, {"type":"chat_message","message": data.get("message"), "sender_channel": self.channel_name})
        except Exception as e:
            print(f"ChatConsumer error: {e}")

    async def user_joined(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"user_joined","username": event["username"]}))

    async def user_left(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"user_left","username": event.get("username")}))

    async def user_list(self, event):
        await self.send(text_data=json.dumps({"type":"user_list","users": event.get("users", [])}))

    async def chat_message(self, event):
        if event.get("sender_channel") != self.channel_name:
            await self.send(text_data=json.dumps({"type":"chat","message": event["message"]}))