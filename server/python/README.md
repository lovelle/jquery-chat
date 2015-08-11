python server for jqchat
===

Installation Process
---

	# Install basic dependences
	$ sudo apt-get install python-dev python-pip python-virtualenv

	# Go to project dir in python server
	$ cd jquery-chat/server/python

	# Create virtual environment (you con skip this step)
	$ virtualenv env
	$ source env/bin/activate

	# Install dependencies
	$ pip install -r requirements.txt

	# Done

Run the server
---

If you want the server to be handled as a full daemon,
you can use [supervisor](http://supervisord.org/) tool.

	# For get the server running just execute
	$ python server.py
