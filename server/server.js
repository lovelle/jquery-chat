var port = process.env.PORT || 3000;
server   = require('http').createServer(),
io       = require('socket.io').listen(server),

users = {}, socks = {};

function Uid() { this.id = ++Uid.lastid; }

Uid.lastid = 0;

//Handle users
io.sockets.on('connection', function (socket) {

	// Event received by new user
	socket.on('join', function (recv) {

		if (!recv.user) {
			socket.emit('custom_error', { message: 'User not found or invalid' });
			return;
		}

		// The user already exists
		if (users[recv.user]) {
			socket.emit('custom_error', { message: 'The user '+ recv.user +' already exists' });
			return;
		}

		// If there is users online, send the list of them
		if (Object.keys(users).length > 0)
			socket.emit('chat', JSON.stringify( { 'action': 'usrlist', 'user': users } ));

		// Set new uid
		uid = new Uid();
		socket.user = recv.user;

		// Add the new data user
		users[socket.user] = {'uid': Uid.lastid, 'user': socket.user, 'name': recv.name, 'status': 'online'}
		socks[socket.user] = {'socket': socket}

		// Send new user is connected to everyone
		socket.broadcast.emit('chat', JSON.stringify( {'action': 'newuser', 'user': users[socket.user]} ));
	});

	// Event received when user want change his status
	socket.on('user_status', function (recv) {
		users[socket.user].status = recv.status;
		socket.broadcast.emit('chat', JSON.stringify( {'action': 'user_status', 'user': users[socket.user]} ));
	});

	// Event received when user send message to another
	socket.on('message', function (recv) {
		var id  = socks[recv.user].socket.id;
		var msg = {'msg': recv.msg, 'user': users[socket.user]};
		io.sockets.socket(id).emit('chat', JSON.stringify( {'action': 'message', 'data': msg} ));
	});

	// Event received when user has disconnected
	socket.on('disconnect', function () {
		socket.broadcast.emit('chat', JSON.stringify( {'action': 'disconnect', 'user': users[socket.user]} ));
		//socket.broadcast.emit('chat', JSON.stringify( {'action': 'offline', 'user': users[socket.user]} ));
		delete users[socket.user];
		delete socks[socket.user];
	});
});

//Listen to the server port
server.listen(port, function () {
  var addr = server.address();
  console.log('jquery-chat server listening and ready');
});
