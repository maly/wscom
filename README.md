# WSCOM serial proxy

[![NPM Version](http://img.shields.io/npm/v/wscom.svg?style=flat)](https://www.npmjs.org/package/wscom)
[![NPM Downloads](https://img.shields.io/npm/dm/wscom.svg?style=flat)](https://www.npmjs.org/package/wscom)
[![NPM Downloads](https://img.shields.io/npm/dt/wscom.svg?style=flat)](https://www.npmjs.org/package/wscom)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/02de4cbfc6fc4ff1a9c0fe4e16d72bde)](https://www.codacy.com/app/maly/wscom-node?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=maly/wscom-node&amp;utm_campaign=Badge_Grade)

  WSCOM serial port proxy for ASM80.com

## Installation

  The prerequisite you have to meet is a functional Node.js environment. It is not complicated, it exists for all major platforms, and you can download it here: [nodejs.org](http://nodejs.org/). During the installation, package manager called NPM is installed too.

  NPM is used for install the packages and libraries. To install WSCOM itself just run a command prompt and type:

  $ npm install wscom -g

## Usage

  `$ wscom`

## API

  `$ wscom` runs a daemon (service), which establish a WebSocket server on `localhost:1311`. It has main entry endpoint, called _list, which provides a list of available serial ports, and endpoints for each serial port.

### Get ports

  After connecting to `ws://localhost:1311/_list` caller gets a JSON object with port names. Due to differences between name conventions in Windows and macOS/Linux, the Windows port names are mangled like _/null/COM1_ etc.

```javascript
var getPorts = function(callback) {

    var connection = new WebSocket('ws://localhost:1311/_list');
        connection.onerror = function(e) {
            console.log("Cannot connect to wscom",e)
            alert("WSCOM is not running. Please install <a href=https://www.npmjs.com/package/wscom>WSCOM tool</a>, run it and reload this page!")

        }

    connection.onmessage = function (e) {
        ports = JSON.parse(e.data);
        connection.close();
        if (callback) callback(ports);

        for (var i=0;i<ports.length;i++) {
            var cn = ports[i].comName.replace("/null/",""); //Fix a common name
            $("#comports").append("<option value='"+ports[i].comName+"'>"+cn+"</option>");
        }
    };
}
```

### Connect to serial port

Once you have an available serial port name, you can connect through `ws://localhost:1311/_port_/_params_/_speed_`.

  * _port_ is the port URL from the list (_/dev/ttyusb0_ or _/null/com1_ etc.)
  * _params_ is "8-N-1" now, all other connection parameters are ignored in this alpha version
  * _speed_ is the baud speed.

So e.g. `ws://localhost:1311/dev/ttyusb0/8-N-1/19200`

When the connection is established, the port is open and all incoming data are sent through WebSocket message.

Sending data is a little bit complex. You can decide between two forms:

  * ```myConn.send(JSON.stringify({"code":10}))``` sends a binary code 10
  * ```myConn.send(JSON.stringify({"key":'A'}))``` sends a code 65 (=ASCII code for uppercase A)

You can set DTR and CTS signals too:

  * ```myConn.send(JSON.stringify({"dtr":1}))``` sets DTR signal to 1
  * ```myConn.send(JSON.stringify({"cts":1}))``` sets CTS signal to 1

These signals sometimes work as a RESET etc.

### Close port

Closing WebSocket connection closes serial port and releases it.

## Support me

  [![paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PZRPU5M94NLJA)

## More info

  See https://www.uelectronics.info/category/my-projects/ for more info

  or http://www.asm80.com for online IDE, based on this assembler

