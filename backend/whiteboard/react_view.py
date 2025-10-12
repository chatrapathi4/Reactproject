from django.http import JsonResponse, Http404
from django.shortcuts import render
from django.views.generic import View
import os
from django.conf import settings

class ReactAppView(View):
    """
    Serve React app for all non-API routes
    """
    def get(self, request, *args, **kwargs):
        # If the request is for API, return 404 to let URL routing handle it
        if request.path.startswith('/api/'):
            raise Http404("API endpoint not found")
        
        # For all other routes, serve the React app
        return render(request, 'index.html')
        
    def dispatch(self, request, *args, **kwargs):
        # API requests should not be handled by this view
        if request.path.startswith('/api/'):
            raise Http404("API endpoint not found")
        return super().dispatch(request, *args, **kwargs)