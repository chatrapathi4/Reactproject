# Create this file: backend/whiteboard/migrations/0002_add_room_code_and_is_active.py
from django.db import migrations, models
import random
import string

def generate_room_code():
    """Generate a unique 8-character room code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def populate_room_codes(apps, schema_editor):
    """Populate room codes for existing boards"""
    Board = apps.get_model('whiteboard', 'Board')
    used_codes = set()
    
    for board in Board.objects.all():
        # Generate a unique room code
        while True:
            code = generate_room_code()
            if code not in used_codes:
                used_codes.add(code)
                board.room_code = code
                board.is_active = True
                board.save()
                break

def reverse_populate_room_codes(apps, schema_editor):
    """Remove room codes (reverse operation)"""
    Board = apps.get_model('whiteboard', 'Board')
    Board.objects.all().update(room_code='', is_active=True)

class Migration(migrations.Migration):
    dependencies = [
        ('whiteboard', '0001_initial'),
    ]

    operations = [
        # Add fields without unique constraint first
        migrations.AddField(
            model_name='board',
            name='room_code',
            field=models.CharField(blank=True, max_length=8),
        ),
        migrations.AddField(
            model_name='board',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        
        # Populate the room codes
        migrations.RunPython(populate_room_codes, reverse_populate_room_codes),
        
        # Now add the unique constraint
        migrations.AlterField(
            model_name='board',
            name='room_code',
            field=models.CharField(max_length=8, unique=True, blank=True),
        ),
    ]