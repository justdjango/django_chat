from django.urls import path

from conversa_dj.chats.consumers import HomeConsumer

websocket_urlpatterns = [path("", HomeConsumer.as_asgi())]
