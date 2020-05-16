from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/conference/room/(?P<room_id>\w+)/$', consumers.ConferenceConsumer),
]