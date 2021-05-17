'use strict';

const net = require('net');
const { promisify } = require('util');
const { JuSocket } = require('../src/JuSocket');
const sleep = promisify(setTimeout);

const server = net.createServer(async socket => {
    const sock = JuSocket(socket);
    while (1) {
        const req = await sock.waitForMessage();
        await sleep(2000);
        sock.sendBuffer(Buffer.from('supp - ' + req.toString()));
    }
});

server.listen('127.0.0.1', 1234);
