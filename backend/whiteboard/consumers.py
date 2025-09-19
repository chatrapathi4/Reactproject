import json
from channels.generic.websocket import AsyncWebsocketConsumer

CHAT_USERS = {}         # {chat_id: set(usernames)}
WHITEBOARD_USERS = {}   # {room_name: set(usernames)}
WHITEBOARD_STATE = {}  # {room_name: [objects]}
IDE_USERS = {}          # {ide_id: set(usernames)}

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = f"chat_{self.chat_id}"
        await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
        await self.accept()
        self.username = None

    async def disconnect(self, close_code):
        if self.username and self.chat_id in CHAT_USERS:
            CHAT_USERS[self.chat_id].discard(self.username)
            await self.broadcast_user_list()
            if not CHAT_USERS[self.chat_id]:
                del CHAT_USERS[self.chat_id]
        await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get("type") == "join":
            self.username = data.get("username")
            if self.chat_id not in CHAT_USERS:
                CHAT_USERS[self.chat_id] = set()
            CHAT_USERS[self.chat_id].add(self.username)
            await self.broadcast_user_list()
        elif data.get("type") == "chat":
            message = data.get("message", {})
            await self.channel_layer.group_send(
                self.chat_group_name,
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

    async def broadcast_user_list(self):
        await self.channel_layer.group_send(
            self.chat_group_name,
            {
                "type": "user_list",
                "users": list(CHAT_USERS.get(self.chat_id, []))
            }
        )

    async def user_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "users": event["users"]
        }))

class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"whiteboard_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        self.username = None

        # Send current state to the new user
        objects = WHITEBOARD_STATE.get(self.room_name, [])
        await self.send(text_data=json.dumps({
            "type": "update",
            "objects": objects
        }))

    async def disconnect(self, close_code):
        if self.username and self.room_name in WHITEBOARD_USERS:
            WHITEBOARD_USERS[self.room_name].discard(self.username)
            await self.broadcast_user_list()
            if not WHITEBOARD_USERS[self.room_name]:
                del WHITEBOARD_USERS[self.room_name]
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get("type") == "join":
            self.username = data.get("username")
            if self.room_name not in WHITEBOARD_USERS:
                WHITEBOARD_USERS[self.room_name] = set()
            WHITEBOARD_USERS[self.room_name].add(self.username)
            await self.broadcast_user_list()
        elif data.get("type") == "update":
            # Drawing update from a user
            objects = data.get("objects", [])
            WHITEBOARD_STATE[self.room_name] = objects
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "whiteboard_update",
                    "objects": objects
                }
            )

    async def whiteboard_update(self, event):
        await self.send(text_data=json.dumps({
            "type": "update",
            "objects": event["objects"]
        }))

    async def broadcast_user_list(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_list",
                "users": list(WHITEBOARD_USERS.get(self.room_name, []))
            }
        )

    async def user_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "users": event["users"]
        }))

class IDEConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ide_id = self.scope["url_route"]["kwargs"]["ide_id"]
        self.ide_group_name = f"ide_{self.ide_id}"
        await self.channel_layer.group_add(self.ide_group_name, self.channel_name)
        await self.accept()
        self.username = None

    async def disconnect(self, close_code):
        if self.username and self.ide_id in IDE_USERS:
            IDE_USERS[self.ide_id].discard(self.username)
            await self.broadcast_user_list()
            if not IDE_USERS[self.ide_id]:
                del IDE_USERS[self.ide_id]
        await self.channel_layer.group_discard(self.ide_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get("type") == "join":
            self.username = data.get("username")
            if self.ide_id not in IDE_USERS:
                IDE_USERS[self.ide_id] = set()
            IDE_USERS[self.ide_id].add(self.username)
            await self.broadcast_user_list()
        else:
            await self.channel_layer.group_send(
                self.ide_group_name,
                {
                    "type": "ide_event",
                    "data": data
                }
            )

    async def ide_event(self, event):
        await self.send(text_data=json.dumps(event["data"]))

    async def broadcast_user_list(self):
        await self.channel_layer.group_send(
            self.ide_group_name,
            {
                "type": "user_list",
                "users": list(IDE_USERS.get(self.ide_id, []))
            }
        )

    async def user_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "users": event["users"]
        }))
