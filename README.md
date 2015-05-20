# [jquery-chat](http://jquery-chat.net/)

100% pure javascript realtime chat (client and server) facebook/gmail style web chat.

To see demo please visit [jquery-chat.net](http://jquery-chat.net)

The jQuery Chat plugin can be used to add a JavaScript-based chatting system to your site, 
allows webmasters/developers to add a fully-working chat room on top of their site, see 'index.html' as an example.

Built with these components -> [Jquery](http://jquery.com/), [Node.js](http://nodejs.org/), [Socket.IO](http://socket.io/)

**Note:** By default the chat is configured to use an existing [Heroku app](http://jquery-chat.herokuapp.com/socket.io), so you will not need to install Node and npm.
(Skip step 3 in the installation process)


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


## Usage:

You need to call the next set of scripts in your own site.
If you have already loaded jQuery or UI there is no need to include them.

```html
<link id='theme' rel='stylesheet' />
<link rel='stylesheet' href='css/tipsy.css' />
<link rel='stylesheet' href='css/chat.css' />

<script src='https://jquery-chat.herokuapp.com/socket.io/socket.io.js'></script>
<script src='js/jquery-1.11.2.min.js'></script>
<script src='js/jquery-ui-1.10.4.custom.min.js'></script>
<script src='js/jquery.tipsy.js'></script>
<script src='js/jquery.main.js'></script>
<script src='config.js'></script>
<script src='i18n_en.js'></script>
```


## Getting Started:

* [Install](https://docs.npmjs.com/getting-started/installing-node) Node.js and npm
* Use any Webserver (Apache, IIS, Nginx, Lighttpd, etc)

**Note:** Remember to clone the project behind a webserver, if you want to execute local file index.html it wont work.


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


## License

See [LICENSE](https://github.com/lovelle/jquery-chat/blob/master/LICENSE).


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/lovelle/jquery-chat/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

