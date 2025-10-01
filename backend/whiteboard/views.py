from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile, Board
import uuid

@csrf_exempt
def api_login(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "error": "Invalid credentials"}, status=400)
    return JsonResponse({"error": "POST required"}, status=405)

@csrf_exempt
def api_register(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")
        email = data.get("email")
        if User.objects.filter(username=username).exists():
            return JsonResponse({"success": False, "error": "Username already exists"}, status=400)
        user = User.objects.create_user(username=username, password=password, email=email)
        user.save()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "POST required"}, status=405)

@csrf_exempt
def api_logout(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"success": True})
    return JsonResponse({"error": "POST required"}, status=405)

def google_login(request):
    # Placeholder for Google OAuth login
    return HttpResponseRedirect("https://accounts.google.com/")

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    Profile.objects.get_or_create(user=instance)

@csrf_exempt
def get_profile(request):
    if request.method == "GET" and request.user.is_authenticated:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user)
        data = {
            "username": request.user.username,
            "email": request.user.email,
            "dob": profile.dob,
            "phone": profile.phone,
            "profile_pic": profile.profile_pic.url if profile.profile_pic else "",
        }
        return JsonResponse(data)
    return JsonResponse({"error": "Unauthorized"}, status=401)

@csrf_exempt
def update_profile(request):
    if request.method == "POST" and request.user.is_authenticated:
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=request.user)
        data = json.loads(request.body)
        user = request.user
        user.email = data.get("email", user.email)
        user.username = data.get("username", user.username)
        profile.dob = data.get("dob", profile.dob)
        profile.phone = data.get("phone", profile.phone)
        user.save()
        profile.save()
        return JsonResponse({"success": True})
    return JsonResponse({"error": "Unauthorized"}, status=401)

@csrf_exempt
def create_board(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            board_name = data.get("name", f"Board-{uuid.uuid4().hex[:8]}")
            
            # Create new board with unique room code
            board = Board.objects.create(name=board_name)
            
            return JsonResponse({
                "success": True, 
                "board_id": board.id,
                "room_code": board.room_code,
                "room_name": board.name
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "POST required"}, status=405)

@csrf_exempt
def join_board(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            room_code = data.get("room_code", "").upper().strip()
            
            if not room_code:
                return JsonResponse({"error": "Room code is required"}, status=400)
            
            # Find board by room code
            try:
                board = Board.objects.get(room_code=room_code, is_active=True)
                return JsonResponse({
                    "success": True,
                    "board_id": board.id,
                    "room_code": board.room_code,
                    "room_name": board.name
                })
            except Board.DoesNotExist:
                return JsonResponse({"error": "Invalid room code"}, status=404)
                
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "POST required"}, status=405)

@csrf_exempt
def get_active_boards(request):
    if request.method == "GET":
        boards = Board.objects.filter(is_active=True).order_by('-created_at')[:20]
        boards_data = [{
            "id": board.id,
            "name": board.name,
            "room_code": board.room_code,
            "created_at": board.created_at.isoformat()
        } for board in boards]
        
        return JsonResponse({"boards": boards_data})
    return JsonResponse({"error": "GET required"}, status=405)
