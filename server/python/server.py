import sys
import time
import json

from socketio import socketio_manage
from socketio.server import SocketIOServer
from socketio.namespace import BaseNamespace
from socketio.mixins import BroadcastMixin

from random import randint
import hashlib

HOST = '0.0.0.0'
PORT = 3000


class JqChatServer(BaseNamespace, BroadcastMixin):
	_users = {}
	_socks = {}
	_uid = 0

	# Avatar config
	avatar_url = "http://www.gravatar.com/avatar/"
	#avatar_url = "http://cdn.libravatar.org/avatar/"
	avatar_404 = ['mm', 'identicon', 'monsterid', 'wavatar', 'retro']

	def __init__(self, *args, **kwargs):
		super(JqChatServer, self).__init__(*args, **kwargs)
		self.st_server = time.time()

	def initialize(self):
		self.user = None

	def on_join(self, recv):
		""" Event received by new user """
		name = recv.get('name')
		user = recv.get('user')

		if not user:
			self.emit('custom_error', dict(message='User not found or invalid'))
			return False

		# The user is already logged
		if user in self._users:
			self.emit('custom_error', dict(message='The user %s is already logged' % user))
			return False

		# Get the current list of users in chat
		if len(self._users) > 0:
			self.emit('chat', json.dumps(dict(action='usrlist', user=self._users)))

		self.user = user
		self._uid = self._uid + 1
		self._users[self.user] = dict(uid=self._uid, user=user, name=name, status='online', avatar=self.get_avatar_url())
		self._socks[self.user] = self

		# Send new user is connected to everyone
		self.broadcast_event_not_me('chat', json.dumps(dict(action='newuser', user=self._users[self.user])))

		return json.dumps(dict(login='successful', my_settings=self._users[self.user]))

	def on_user_status(self, recv):
		""" Event received when user want change his status """
		if self.user in self._users:
			self._users[self.user]['status'] = recv.get('status')
			self.broadcast_event_not_me('chat', json.dumps(dict(action='user_status', user=self._users[self.user])))
		return True

	def on_user_typing(self, recv):
		""" Event received when user is typing """
		user = recv.get('user')
		self._socks[user].emit('chat', json.dumps(dict(action='user_typing', data=self._users[user])))
		return True

	def on_message(self, recv):
		""" Event received when user send message to another """
		date = time.strftime('%Y-%m-%dT%H:%M:%S')
		msgi = recv.get('msg')
		user = recv.get('user')
		msgs = dict(msg=msgi, user=self._users[user])
		self._socks[user].emit('chat', json.dumps(dict(action='message', data=msgs, date=date)))
		return json.dumps(dict(ack='true', date=date))

	def recv_disconnect(self):
		""" Event received when user has disconnected """
		#print 'recv_disconnect'
		if self.user in self._users:
			self.broadcast_event_not_me('chat', json.dumps(dict(action='disconnect', user=self._users[self.user])))
			del self._users[self.user]
			del self._socks[self.user]
		self.disconnect(silent=True)
		return True

	def get_avatar_url(self):
		""" Generate url for avatar purpose """
		mymd5 = hashlib.md5(self.user).hexdigest()
		rand = randint(0,len(self.avatar_404)-1)
		end = '?d=%s' % self.avatar_404[rand]
		return "%s%s/%s" % (self.avatar_url, mymd5, end)


def server(environ, start_response):
	path = environ['PATH_INFO'].strip('/')
	content_type = "text/html"
	response_headers = [
		('Content-type', content_type),
		('Server', 'JqChatServer'),
	]

	#if path.startswith('static/'):
	if path == 'socket.io/socket.io.js':
		try:
			data = open('static/socket.io.js').read()
		except Exception:
			return not_found(start_response, response_headers)

		if path.endswith(".js"):
			response_headers[0] = ('Content-type', "text/javascript")
		
		response_headers.append(('Content-Length', str(len(data))))
		start_response('200 OK', response_headers)
		return iter([data])

	if path.startswith("socket.io"):
		try:
			return socketio_manage(environ, {'': JqChatServer})
		except Exception, e:
			return internal_error(start_response, response_headers, e)
	else:
		return not_found(start_response, response_headers)

def internal_error(start_response, response_headers, error):
	start_response('500 Internal Server Error', response_headers)
	return iter(['<h1>Internal Server Error</h1><p>%s</p>' % error])

def not_found(start_response, response_headers):
	start_response('404 Not Found', response_headers)
	return iter(['<h1>Not Found</h1>'])


if __name__ == '__main__':
	print 'Listening %s:%s and on port 10843 (flash policy server)' % (HOST, PORT)
	server = SocketIOServer(
		(HOST, PORT), server,
		resource="socket.io", policy_server=True,
		policy_listener=(HOST, 10843))
	server.serve_forever()
