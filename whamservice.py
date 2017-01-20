#!/usr/bin/env python

from flask import Flask, redirect, request
import jsonpickle
from s128p import S128P

app = Flask(__name__)
controller = None


@app.route('/')
def homepage():
	return redirect("/static/index.html")

@app.route('/inputs/')
def get_inputs():
    return jsonpickle.encode(controller.inputs, unpicklable=False)
@app.route('/inputs/<int:id>', methods=['GET'])
def get_input(id):
	return jsonpickle.encode(controller.inputs[int(id)], unpicklable=False)

#TODO: remove duplication here.
@app.route('/outputs/')
def get_outputs():
	return jsonpickle.encode(controller.outputs, unpicklable=False)
@app.route('/outputs/<int:id>', methods=['GET'])
def get_output(id):
	return jsonpickle.encode(controller.outputs[int(id)], unpicklable=False)
@app.route('/outputs/<int:id>', methods=['PUT'])
def put_output(id):
	print request.form

	try:
		controller.set_input(id, jsonpickle.decode(request.form['input'])) #handle ints or 'null'
	except KeyError:
		print "not updating input" 

	print controller.outputs[id-1]
	return ('',200)

if __name__ == '__main__':
	app.debug = True

	#with open('inputs.json') as f: inputs = json.loads(f.read())
	#with open('outputs.json') as f: outputs = json.loads(f.read())

	#convert them to dicts
	#inputs = dict(zip([x['id'] for x in inputs], inputs))
	#outputs = dict(zip([x['id'] for x in outputs], outputs))
	
	#prep outputs reasonably
	#print outputs
	#for id in outputs:
	#	outputs[id]['volume'] = 50
	#	outputs[id]['input'] = None

        controller = S128P()

        if app.debug:
                print "INPUTS: " + jsonpickle.encode(controller.inputs, unpicklable=False)
                print "OUTPUTS: " + jsonpickle.encode(controller.outputs, unpicklable=False)
        
	app.run(host='0.0.0.0')



