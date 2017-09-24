#!/usr/bin/env python

from flask import Flask, redirect, request, Response
from time import sleep
from datetime import datetime, timedelta
import jsonpickle
import threading
import json
from s128p import S128P

app = Flask(__name__)
controller = None
last_active = {}


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
        return Response(jsonpickle.encode(controller.outputs, unpicklable=False), mimetype="application/json")
@app.route('/outputs/<int:id>', methods=['GET'])
def get_output(id):
        return Response(jsonpickle.encode(controller.outputs[int(id)], unpicklable=False), mimetype="application/json")
@app.route('/outputs/<int:id>', methods=['PUT'])
def put_output(id):
        print request.form

        try:
                controller.set_input(id, jsonpickle.decode(request.form['input'])) #handle ints or 'null'
        except KeyError:
                print "not updating input" 

        print controller.outputs[id-1]
        return ('',200)

def refresh_thread():
        global last_active

        while True:
                sleep(5)
                print "Refreshing"
                controller.refresh_input_data()
                controller.refresh_output_data()

                now = datetime.now()

                for input in controller.inputs:
                        if input.active:
                                last_active[input.id] = now
                
                print "=== last_active:", last_active

                for output in controller.outputs:
                        try:
                                print output.id, "input", output.input
                                if output.input == None or last_active[output.input] < now - timedelta(seconds=8):
                                        controller.set_input(output.id, output.default_input)
                                        print "reset " + str(output.id) + " to " + str(output.default_input)
                                else:
                                        print output.id, "last active", last_active[output.input]
                        except TypeError:
                                pass
                                
                                        

if __name__ == '__main__':
        app.debug = False

        controller = S128P()

        with open('inputs.json') as f: config_inputs = json.loads(f.read())
        with open('outputs.json') as f: config_outputs = json.loads(f.read())

        #convert them to dicts
        config_inputs = dict(zip([x['id'] for x in config_inputs], config_inputs))
        config_outputs = dict(zip([x['id'] for x in config_outputs], config_outputs))
        
        for output in controller.outputs:
                try:
                        output.name = config_outputs[output.id]['name']
                        print "output", output.id, "=", output.name
                        try:
                                output.default_input = config_outputs[output.id]['default_input']
                        except KeyError:
                                print "No default input for output", output.id
                        try:
                                output.default_volume = config_outputs[output.id]['default_volume']
                        except KeyError:
                                print "No default volume for output", output.id
                except KeyError:
                        print "No name-config for output", output.id, "- disabling"
                        output.enabled = False

        for input in controller.inputs:
                try:
                        input.name = config_inputs[input.id]['name']
                        print "input", input.id, "=", input.name
                except KeyError:
                        print "No name-config for input", input.id, "- disabling"
                        input.enabled = False


        print "INPUTS: " + jsonpickle.encode(controller.inputs, unpicklable=False)
        print "OUTPUTS: " + jsonpickle.encode(controller.outputs, unpicklable=False)

        for input in controller.inputs:
                last_active[input.id] = datetime.now()
        print(last_active)

        print "Starting refresh thread"
        thread = threading.Thread(target=refresh_thread)
        thread.start()
        
        app.run(host='0.0.0.0')



