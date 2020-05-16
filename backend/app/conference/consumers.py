import time
import json
import channels
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from asgiref.sync import async_to_sync
from django.db.models.signals import post_save
from django.dispatch import receiver

class ConferenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f'ROOM-{self.room_id}'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'send_offer',
                'to_peer': self.channel_name
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'remove_peer',
                'peer': self.channel_name
            }
        )
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        await self.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['action']=='OFFER':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'did_receive_offer',
                    'from_peer': self.channel_name,
                    'to_peer': data['to_peer'],
                    'offer': data['offer']
                }
            )
        if data['action']=='ANSWER':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'did_receive_answer',
                    'from_peer': self.channel_name,
                    'to_peer': data['to_peer'],
                    'answer': data['answer']
                }
            )
        if data['action']=='SEND_ICE_CANDIDATE':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'did_receive_ice_candidate',
                    'from_peer': self.channel_name,
                    'to_peer': data['to_peer'],
                    'ice_candidate': data['ice_candidate']
                }
            )
            
    async def send_offer(self, event):
        if event['to_peer']!=self.channel_name:
            # Send message to WebSocket 
            await self.send(text_data=json.dumps({
                'action': 'SEND_OFFER',
                'to_peer': event['to_peer']
            }))

    async def did_receive_offer(self, event):
        if event['to_peer']==self.channel_name:
            await self.send(text_data=json.dumps({
                'action': 'DID_RECEIVE_OFFER',
                'from_peer': event['from_peer'],
                'offer': event['offer']
            }))
    
    async def did_receive_answer(self, event):
        if event['to_peer']==self.channel_name:
            await self.send(text_data=json.dumps({
                'action': 'DID_RECEIVE_ANSWER',
                'from_peer': event['from_peer'],
                'answer': event['answer']
            }))
    
    async def did_receive_ice_candidate(self, event):
        if event['to_peer']==self.channel_name:
            await self.send(text_data=json.dumps({
                'action': 'DID_RECEIVE_ICE_CANDIDATE',
                'from_peer': event['from_peer'],
                'ice_candidate': event['ice_candidate']
            }))
    
    async def remove_peer(self, event):
        if event['peer']!=self.channel_name:
            await self.send(text_data=json.dumps({
                'action': 'REMOVE_PEER',
                'peer': event['peer']
            }))