#!/usr/bin/env node

/* eslint-disable no-console */
/* global console */

const WebSocket = require('ws');

const SerialPort = require('serialport');

const wss = new WebSocket.Server({port: 1311});

var port;

wss.on('connection', function(ws, req) {
  //console.log(req.url);
  if (port) {return;}
  if (req.url==="/_list") {
    SerialPort.list()
      .then(function(ports){
        //console.log(ports);
        var pp = ports.map(function(port){if (port.comName.indexOf("/")<0) port.comName="/null/"+port.comName; return port})
        ws.send(JSON.stringify(pp))
      })
    return;
  }
  var urlSplit = req.url.split("/");
  var comName = urlSplit[2];
  if (urlSplit[1]!=="null") comName = "/"+urlSplit[1]+"/"+urlSplit[2];
  //var param = urlSplit[3];
  var speed = parseInt(urlSplit[4]);
  console.log("Opening",comName,speed);
  port = new SerialPort(comName, {
      baudRate: speed
  });

  port.on("data", function (data) {
    var arr = Array.prototype.slice.call(data, 0)
    //console.log("SER IN", arr);
    ws.send(JSON.stringify(arr));
  })

  ws.on('message', function (message) {
    if (!port) return;
    var mesg = JSON.parse(message);
    if (mesg.key) {port.write(mesg.key);return;}
    if (mesg.code) {port.write(String.fromCharCode(mesg.code));return;}
    if (mesg.dtr!==undefined) {
      //console.log("DTR",mesg.dtr);
      port.set({dtr:mesg.dtr});
      return;}
    if (mesg.cts!==undefined) {
      //console.log("cts",mesg.cts);
      port.set({cts:mesg.cts});
      return;
    }
    console.log('received', mesg);

  });
  ws.on('close', function (message) {
    console.log('close: %s', message);
    port.close(function(){port=null;})
  });

  ws.on('error', function (message) {
    console.log('error: %s', message);
    port.close(function(){port=null;})
  });


  //ws.send('something');
});

console.log("Server started on ws://localhost:1311")
