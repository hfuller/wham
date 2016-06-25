#!/usr/bin/env python

from flask import Flask, redirect
import ConfigParser, json

app = Flask(__name__)
inputs = {}
outputs = {}


@app.route('/')
def homepage():
	return redirect("/static/index.html")

@app.route('/inputs/')
def get_inputs():
	return 'x'

@app.route('/outputs/')
def get_outputs():
	return 'y'


def load_config():
        global inputs, outputs
        input_cp = ConfigParser.ConfigParser()
        output_cp = ConfigParser.ConfigParser()
        input_cp.read("input.ini")
        output_cp.read("output.ini")
        inputs = config_parser_to_json(input_cp)
        outputs = config_parser_to_json(output_cp)

def config_parser_to_json(cp):
        data = {}
        for s in cp.sections():
                s = s
                data[int(s)] = {}
                for o in cp.options(s):
                        data[int(s)][o] = cp.get(s,o)
        return data

if __name__ == '__main__':
	app.debug = True

        load_config()
        if app.debug:
                print "INPUTS: " + json.dumps(inputs)
                print "OUTPUTS: " + json.dumps(outputs)
        
	app.run(host='0.0.0.0')



