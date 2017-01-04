from __future__ import print_function
from serial import Serial
import io

class S128P(object):
    def __init__(self):
        print("s128p comms init")
        self.port = Serial('/dev/ttyUSB1', 19200, timeout=0.2) #0.2s timeout from protocol doc
        if self.connected:
            print("connected ok!")
        else:
            print("not connected.")

    def send(self, command):
        x = "&S12," + command
        print("sending: " + x)
        self.port.write(x + '\r')
        self.port.write(x + '\r')
        self.port.flush()
        self.port.reset_input_buffer()

        result = ""
        ch = "X"
        while len(ch) > 0 and ch != '\r':
            ch = self.port.read()
            result += ch
        print("    got: " + result)
        return result

    @property
    def connected(self):
        return "&S12,SYSOFF" in self.send("SYSOFF?")
