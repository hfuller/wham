#!/usr/bin/env python

from flask import Flask, redirect
import json

app = Flask(__name__)
inputs = None
outputs = None


@app.route('/')
def homepage():
	return redirect("/static/index.html")

@app.route('/inputs/')
def get_inputs():
	return json.dumps(inputs)

@app.route('/outputs/')
def get_outputs():
	return json.dumps(outputs)


if __name__ == '__main__':
	app.debug = True

	with open('inputs.json') as f: inputs = json.loads(f.read())
	with open('outputs.json') as f: outputs = json.loads(f.read())
	
	#prep outputs reasonably
	for output in outputs:
		output['volume'] = 50
		output['input'] = None

        if app.debug:
                print "INPUTS: " + json.dumps(inputs)
                print "OUTPUTS: " + json.dumps(outputs)
        
	app.run(host='0.0.0.0')



