from __future__ import print_function
from serial import Serial
import io

class Zone(object):
    def __init__(self, parent, number):
        print("init zone " + str(number))
        self.parent = parent
        self.number = number
        print("volume: " + str(self.volume))

    @property
    def volume(self):
        result = self.parent.send("VOL," + str(self.number).zfill(2) + "?")
        result = result.split(',', 2)
        return int(result[2])


class S128P(object):
    def __init__(self):
        print("init s128p")
        self.port = Serial('/dev/ttyUSB1', 19200, timeout=1) #0.2s timeout from protocol doc
        if self.connected:
            print("connected ok!")
        else:
            print("not connected.")

        print("init zones: ")
        self.zones = [Zone(self, i) for i in range(1, self.get_zone_count()+1)]
        print("init zones done")

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
