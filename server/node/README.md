node server for jqchat
===

*Read before installation:* 
You must already have installed [Node.js](http://howtonode.org/how-to-install-nodejs) and [Npm](https://www.npmjs.com/) package manager.
These instructions are only detailed to get running node.js with the chat,

If you don't know what node.js is please visit [node site](https://nodejs.org).
If you don't know how to install node.js take a loook at [howtonode](http://howtonode.org/how-to-install-nodejs)

Installation Process
---
	# Go to project dir in node server
	$ cd jquery-chat/server/node

	# Install dependencies libraries
	$ npm install

	# Done

Run the server
---
Is highly recommended to run node with [forever](https://www.npmjs.com/package/forever) package.

	# For get the server running by default just execute
	$ npm start
