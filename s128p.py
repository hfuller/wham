from __future__ import print_function
from serial import Serial
import io

class Output(object):
    def __init__(self, number):
        print("init output " + str(number))
        self.id = number
        self.name = "Zone " + str(self.id)
        self.input = None
        self.volume = 35

class Input(object):
    def __init__(self, number):
        print("init input " + str(number))
        self.id = number
        self.name = "Source " + str(self.id)



class S128P(object):
    def __init__(self):
        print("init s128p")
        self.port = Serial('/dev/tty.usbserial-141', 19200, timeout=1) #0.2s timeout from protocol doc
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
        x = "&S12," + command
        result = ""
        ch = None

        while ch == None:
            #we have not received a character. We need to send the command.
            print("sending: " + x)
            self.port.write(x + '\r')
            self.port.flush()
            self.port.reset_input_buffer()
            print("waiting")
            ch = self.port.read()

        while ch != '\r':
            result += ch
            ch = self.port.read()
        #Now you would think we would lose the last character here, because
        #I just read it but didnt push it onto the string.
        #But I have some good news for you: the last character is always \r.

        print("    got: " + result)
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
        print(detect)
        for input in self.inputs:
            input.active = bool(int(detect[input.id-1]))

    # this fetches the input of a particular OUTPUT.
    # this does NOT get, e.g. input 3 -- it gets the
    # input connected to output 3, if any.
    def get_selected_input(self, output_id):
        result = self.send("SRC," + str(output_id).zfill(2) + "?")
        result = result.split(',')
        result = None if int(result[2]) == 0 else int(result[2])
        return result

    def get_volume(self, output_id):
        result = self.send("VOL," + str(output_id).zfill(2) + "?")
        result = result.split(',')
        return int(result[2])

    def is_connected(self):
        return "SYSOFF" in self.send("SYSOFF?")



