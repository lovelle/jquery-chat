jquery-chat
===========

100% pure javascript realtime chat (client and server) facebook/gmail style web chat.

The jQuery Chat plugin can be used to add a JavaScript-based chatting system to your site, 
allows webmasters/developers to add a fully-working chat room on top of their site, see 'index.html' as an example.

With some of this components -> [Jquery](http://jquery.com/), [Node.js](http://nodejs.org/), [Socket.IO](http://socket.io/)

### Prerequisites:

	* Node.js - npm
	* Webserver (Apache, IIS, Nginx, Lighttpd, etc)

**Note:** Remember to clone the project behind a webserver, if you want to execute local file index.html it wont work.

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

## Installation

### 1. Clone the project

	$ cd /var/www/
	$ git clone https://github.com/lovelle/jquery-chat
	$ cd jquery-chat

### 2. Configuration

	# Go to cloned project
	$ cd /var/www/jquery-chat/
	# Adjust personal setting to 'server' ip or dns
	$ editor config.js
	# And the same for line 11 in index.html
	$ editor index.html

### 3. Install and run Node.js

	$ cd /var/www/jquery-chat/server
	$ npm install
	$ npm start


### 4. Run
Lets it, to finish remember you must have a webserver, if you dont want to install a full webserver you can do it with python server:

	# Go to project folder
	$ cd /var/www/jquery-chat
	# Run webserver with python lib
	$ python -m SimpleHTTPServer

Finish!, go to visit http://localhost:8000/
