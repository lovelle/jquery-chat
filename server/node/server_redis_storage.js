var port = process.env.PORT || 3000;
r_port   = 6379,
r_host   = "localhost",
server   = require('http').createServer(),
io       = require('socket.io').listen(server),
crypto   = require('crypto'),
redis    = require('redis');

// Avatar config
//var avatar_url = "http://cdn.libravatar.org/avatar/";
var avatar_url = "http://www.gravatar.com/avatar/";
var avatar_404 = ['mm', 'identicon', 'monsterid', 'wavatar', 'retro'];

var socks = {};
var users_key = "jqchat:users";

function Uid() { this.id = ++Uid.lastid; }

Uid.lastid = 0;

//Handle users
io.sockets.on('connection', function (socket) {

	// Connection to redis
	var r = redis.createClient(r_port, r_host);

	// Event received by new user
	socket.on('join', function (recv, fn) {

		if (!recv.user) {
			socket.emit('custom_error', { message: 'User not found or invalid' });
			return;
		}

		// Wheter if user is logged
		r.sismember(users_key, recv.user, function(err, reply) {
			if (reply) {
				socket.emit('custom_error', { message: 'The user '+ recv.user +' is already logged' });
				return;
			}
		});

		// If there is users online, send the list of them
		r.smembers(users_key, function(err, reply) {
			if (reply.length > 0) {
				getAllUsers(reply, function(users) {
					socket.emit('chat', JSON.stringify( { 'action': 'usrlist', 'user': users } ));
				});
			}
		});

		// Set new uid
		uid = new Uid();
		socket.user = recv.user;
		my_avatar = get_avatar_url(socket.user);

		r.sadd([users_key, socket.user], function(err, reply) {});

		// Add the new data user
		r.hmset('jqchat:user:' + socket.user, 'uid', Uid.lastid, 'user', socket.user, 'name', recv.name, 'status', 'online', 'avatar', my_avatar);
		socks[socket.user] = {'socket': socket}

		// Send new user is connected to everyone
		r.hgetall('jqchat:user:' + socket.user, function(err, data) {
			socket.broadcast.emit('chat', JSON.stringify( {'action': 'newuser', 'user': data} ));

			if (typeof fn !== 'undefined')
				fn(JSON.stringify( {'login': 'successful', 'my_settings': data} ));
		});
	});

	// Event received when user want change his status
	socket.on('user_status', function (recv) {
		r.sismember(users_key, socket.user, function(err, reply) {
			r.hset('jqchat:user:' + socket.user, "status", recv.status, function(err, reply) {
				r.hgetall('jqchat:user:' + socket.user, function(err, data) {
					socket.broadcast.emit('chat', JSON.stringify( {'action': 'user_status', 'user': data} ));
				});
			});
		});
	});

	// Event received when user is typing
	socket.on('user_typing', function (recv) {
		var id = socks[recv.user].socket.id;
		r.hgetall('jqchat:user:' + socket.user, function(err, data) {
			io.sockets.socket(id).emit('chat', JSON.stringify( {'action': 'user_typing', 'data': data} ));
		});
	});

	// Event received when user send message to another
	socket.on('message', function (recv, fn) {
		r.hgetall('jqchat:user:' + socket.user, function(err, data) {
			var d = new Date();
			var id = socks[recv.user].socket.id;
			var msg = {'msg': recv.msg, 'user': data};

			if (typeof fn !== 'undefined')
				fn(JSON.stringify( {'ack': 'true', 'date': d} ));
			io.sockets.socket(id).emit('chat', JSON.stringify( {'action': 'message', 'data': msg, 'date': d} ));
		});
	});

	// Event received when user has disconnected
	socket.on('disconnect', function () {
		r.srem([users_key, socket.user], function(err, reply) {
			if (reply) {
				r.hgetall('jqchat:user:' + socket.user, function(err, data) {
					r.del('jqchat:user:' + socket.user, function(err, reply) {
						socket.broadcast.emit('chat', JSON.stringify( {'action': 'disconnect', 'user': data} ));
						delete socks[socket.user];
					});
				});
			}
		});
	});
});

//Listen to the server port
server.listen(port, function () {
  var addr = server.address();
  console.log('jqchat listening on ' + addr.address + addr.port);
});

function getAllUsers(reply, callback) {
	var users = {};
	for (var i = 0; i < reply.length; i++) {
		(function(i) {
			r.hgetall('jqchat:user:' + reply[i], function(err, data) {
				users[data['user']] = data;

				if (i == (reply.length - 1))
					callback(users);
			});
		})(i);
	}
}

// Generate url for avatar purpose
function get_avatar_url(user) {
	var mymd5 = crypto.createHash('md5').update(user);
	var rand = random(0, avatar_404.length);
	var end = '?d=' + avatar_404[rand];
	return avatar_url + mymd5.digest("hex") + "/" + end
}

function random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
