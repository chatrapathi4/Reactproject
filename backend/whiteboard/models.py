from django.db import models
from django.contrib.auth.models import User
import uuid
import random
import string

class Board(models.Model):
    name = models.CharField(max_length=100)
    room_code = models.CharField(max_length=8, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        if not self.room_code:
            self.room_code = self.generate_room_code()
        super().save(*args, **kwargs)
    
    def generate_room_code(self):
        """Generate a unique 8-character room code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not Board.objects.filter(room_code=code).exists():
                return code
    
    def __str__(self):
        return f"{self.name} ({self.room_code})"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return self.user.username
