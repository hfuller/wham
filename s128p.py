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

    def get_zone_count(self):
        resp = self.send("LSD,1?")
        resp = resp.split(',', 2)
        print (resp[2])
        return len(resp[2])


    @property
    def connected(self):
        return "SYSOFF" in self.send("SYSOFF?")



