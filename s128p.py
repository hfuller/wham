from __future__ import print_function
from serial import Serial
import io
from threading import Lock

class Output(object):
    def __init__(self, number):
        print("init output " + str(number))
        self.id = number
        self.name = "Zone " + str(self.id)
        self.input = None
        self.volume = 35
	self.default_input = None
	self.enabled = True

class Input(object):
    def __init__(self, number):
        print("init input " + str(number))
        self.id = number
        self.name = "Source " + str(self.id)
	self.enabled = True



class S128P(object):
    def __init__(self):
	self.debug = False

        print("Init lock.")
        self.lock = Lock()

        print("init s128p")
        self.port = Serial('/dev/ttyUSB0', 19200, timeout=1.0) #0.2s timeout from protocol doc
        if self.is_connected():
            print("connected ok!")
        else:
            print("not connected.")

        print("init outputs")
        self.outputs = [Output(i) for i in range(1, self.get_output_count()+1)]
        print("Doing initial download of output data")
        self.refresh_output_data()
        print("outputs done")

        print("init inputs")
        self.inputs = [Input(i) for i in range(1, self.get_input_count()+1)]
        print("Doing initial download of input data")
        self.refresh_input_data()
        print("inputs done")

    def send(self, command):
        self.lock.acquire()
        print("got lock for", command)

        x = "&S12," + command
        result = ""
        ch = None

        while ch == '' or ch == None:
            #we have not received a character. We need to send the command.
            if self.debug: print("sending: " + x)
            self.port.write(x + '\r')
            self.port.flush()
            self.port.reset_input_buffer()
            if self.debug: print("waiting")
            ch = self.port.read()

        while ch != '\r':
            result += ch
            ch = self.port.read()
        #Now you would think we would lose the last character here, because
        #I just read it but didnt push it onto the string.
        #But I have some good news for you: the last character is always \r.

        if self.debug: print("    got: " + result)
        if self.debug: print("Releasing lock for", command)
        self.lock.release()

        result = result.split(',', 1)
        return result[1] 


    def get_local_source_detect(self):
        resp = self.send("LSD,1?")
        resp = resp.split(',', 2)
        return resp[2]
    def get_output_count(self):
        return len(self.get_local_source_detect())

    def get_input_detect(self):
        resp = self.send("ASD,1?")
        resp = resp.split(',', 2)
        return resp[2]
    def get_input_count(self):
        return len(self.get_input_detect())


    def refresh_output_data(self):
        for output in self.outputs:
            output.input = self.get_selected_input(output.id)
            output.volume = self.get_volume(output.id)
    
    def refresh_input_data(self):
        detect = list(self.get_input_detect())
        if self.debug: print(detect)
        for input in self.inputs:
            input.active = bool(int(detect[input.id-1]))

    # this fetches the input of a particular OUTPUT.
    # this does NOT get, e.g. input 3 -- it gets the
    # input connected to output 3, if any.
    def get_selected_input(self, output_id):
        result = self.send("SRC," + str(output_id).zfill(2) + "?")
        result = result.split(',')
        temp = int(result[2])
        if temp == 0:
                temp = None
        return temp

    def set_input(self, output_id, input_id):
        result = self.send("SRC," + str(output_id).zfill(2) + ',' + str(input_id if input_id != None else 0).zfill(2))
        if result[0:3] == "ACK":
            self.outputs[output_id-1].input = input_id
        else:
            print("didn't get ack. :( got:", result[0:3])

    def get_volume(self, output_id):
        result = self.send("VOL," + str(output_id).zfill(2) + "?")
        result = result.split(',')
        return int(result[2])

    def is_connected(self):
        return "SYSOFF" in self.send("SYSOFF?")



