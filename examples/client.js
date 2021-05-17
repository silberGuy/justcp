'use strict';

const net = require('net');
const { JuSocket } = require('../src/JuSocket');

const socket = net.connect('127.0.0.1', 1234);
const sock = JuSocket(socket);

(async function() {
    let msg;
    msg = await sock.sendBufferAndReceive(Buffer.from('Hello Server'));
    console.log(msg.toString());
    
    msg = await sock.sendBufferAndReceive(Buffer.from('Hello Again'));
    console.log(msg.toString());
})();
