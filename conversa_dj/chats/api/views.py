from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from conversa_dj.chats.models import Conversation
from conversa_dj.chats.api.paginaters import ChatPagination

from .serializers import MessageSerializer, ConversationSerializer


class ConversationViewSet(ListModelMixin, RetrieveModelMixin, GenericViewSet):
    serializer_class = ConversationSerializer
    # pagination_class = ChatPagination
    queryset = Conversation.objects.none()
    lookup_field = "name"

    def get_queryset(self):
        queryset = Conversation.objects.filter(
            name__contains=self.request.user.username
        )
        return queryset

    def get_serializer_context(self):
        return {"request": self.request, "user": self.request.user}

    @action(detail=True)
    def messages(self, request, name):
        conversation = get_object_or_404(Conversation, name=name)
        queryset = conversation.messages.all().order_by("-timestamp")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = MessageSerializer(
                page, many=True, context={"request": request}
            )
            return self.get_paginated_response(serializer.data)
        serializer = MessageSerializer(
            queryset, many=True, context={"request": request}
        )
        return Response(status=status.HTTP_200_OK, data=serializer.data)
