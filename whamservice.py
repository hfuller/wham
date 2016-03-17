#!/usr/bin/env python

from flask import Flask, redirect
app = Flask(__name__)

@app.route('/')
def homepage():
	return redirect("/static/index.html")

@app.route('/zones/')
def get_zones():
	return 'zones'

@app.route('/sources/')
def get_sources():
	return 'sources'
    
if __name__ == '__main__':
	app.debug = True
	app.run(host='0.0.0.0')



