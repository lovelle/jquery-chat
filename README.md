[jquery-chat](http://jquery-chat.net/)
===

100% pure javascript realtime chat (client and server) facebook/gmail style web chat.

To see demo please visit [jquery-chat.net](http://jquery-chat.net)

The jQuery Chat plugin can be used to add a JavaScript-based chatting system to your site, 
allows webmasters/developers to add a fully-working chat room on top of their site, see 'index.html' as an example.

Built with these components -> [Jquery UI](http://jqueryui.com/), [Socket.IO](http://socket.io/)

**Note:** By default the chat is configured to use an existing [Heroku app](http://jquery-chat.herokuapp.com/socket.io), so you will not need to install Node and npm.
(Skip step 3 in the installation process)

**NEW:** With the latest changes we also support *python* server.
So you could have python server instead [Node.js](http://nodejs.org/) if you want.

**Alert:** At this time, the chat only support socket.io version 0.9.x.
ASAP there is a future plan to update to version 1.x of socket.io, please be patient,
take a look in this [issue](https://github.com/lovelle/jquery-chat/issues/25) to see progress.


Features

	* Multi themes support (jquery-ui)
	* 100% javascript (client and server side)
	* Configuration file (fancy things and connecting stuff)
	* Support multiple languages
	* New message pop-up notifications
	* Multi users chat
	* Search users
	* Sounds 
	* Browser support: (Opera, Firefox, Google Chrome, Safari, Internet Explorer)


Usage:
---

Take a look at *index.html* for simple example of usage.


Getting Started:
---

* Install any Webserver (Apache, IIS, Nginx, Lighttpd, etc)

Remember to clone the project behind a webserver, if you want to execute local file index.html it wont work.


Installation
---

1. Clone the project
---

	$ cd /var/www/
	$ git clone https://github.com/lovelle/jquery-chat
	$ cd jquery-chat

2. Configuration
---

	# Go to cloned project
	$ cd /var/www/jquery-chat/
	# Adjust personal setting to 'server' ip or dns
	$ editor config.js
	# And the same for line 11 in index.html
	$ editor index.html

3. Install and run Server
---

For **node.js** server follow [these instructions](https://github.com/lovelle/jquery-chat/blob/master/server/node/README.md).

For **python** server follow [these instructions](https://github.com/lovelle/jquery-chat/blob/master/server/python/README.md).


4. Run
---

Lets it, to finish remember you must have a webserver, if you dont want to install a full webserver you can do it with python server:

	# Go to project folder
	$ cd /var/www/jquery-chat
	# Run webserver with python lib
	$ python -m SimpleHTTPServer

Finish!, go to visit http://localhost:8000/


Motivation
---
This chat was made in my free time, please be gentle.
For any doubt feel free to create an [issue](https://github.com/lovelle/jquery-chat/issues).

Why there is a python server if all server logic allready exist in Node.js?

* For fun.
* For anyone who didn't know node.js and wants to understand how server works.
* To be more compatibilty friendly.

Will be the server be supported in others languages?

* Yep, ASAP.


License
---

See [LICENSE](https://github.com/lovelle/jquery-chat/blob/master/LICENSE).
