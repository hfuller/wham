#!/usr/bin/env python

from flask import Flask, redirect, request
import json

app = Flask(__name__)
inputs = None
outputs = None


@app.route('/')
def homepage():
	return redirect("/static/index.html")

@app.route('/inputs/')
def get_inputs():
	return json.dumps(inputs.values())
@app.route('/inputs/<int:id>', methods=['GET'])
def get_input(id):
	return json.dumps(inputs[int(id)])

#TODO: remove duplication here.
@app.route('/outputs/')
def get_outputs():
	return json.dumps(outputs.values())
@app.route('/outputs/<int:id>', methods=['GET'])
def get_output(id):
	return json.dumps(outputs[int(id)])
@app.route('/outputs/<int:id>', methods=['PUT'])
def put_output(id):
	print request.form

	try:
		outputs[id]['volume'] = int(request.form['volume'])
	except KeyError:
		print "not updating volume"
	try:
		outputs[id]['input'] = json.loads(request.form['input']) #handle ints or 'null'
	except KeyError:
		print "not updating input" 

	print outputs[id]
	return ('',200)

if __name__ == '__main__':
	app.debug = True

	with open('inputs.json') as f: inputs = json.loads(f.read())
	with open('outputs.json') as f: outputs = json.loads(f.read())

	#convert them to dicts
	inputs = dict(zip([x['id'] for x in inputs], inputs))
	outputs = dict(zip([x['id'] for x in outputs], outputs))
	
	#prep outputs reasonably
	print outputs
	for id in outputs:
		outputs[id]['volume'] = 50
		outputs[id]['input'] = None

        if app.debug:
                print "INPUTS: " + json.dumps(inputs)
                print "OUTPUTS: " + json.dumps(outputs)
        
	app.run(host='0.0.0.0')



