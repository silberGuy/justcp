'use strict';

const net = require('net');

const server = net.createServer(async socket => {
    let currentPacket;

    for await (const buffer of socket) {
        if (!currentPacket) {
            currentPacket = parsePacketStart(buffer);
        } else {
            const data = buffer.slice(0, currentSize - currentPacket.length);
            const nextPacket = buffer.slice(currentSize - currentPacket.length, Infinity);

            currentPacket.data = Buffer.concat([
                currentPacket.data,
                data,
            ]);
        }

        if (currentPacket.data.length === currentPacket.size) {
            console.log(currentPacket);
            currentPacket = undefined;
        }
    }
});

function parsePacketStart(buffer) {
    const type = buffer.slice(0, 1).toString();
    const size = sizeBufferToNumber(buffer.slice(1, 5));
    const data = buffer.slice(5, 5 + size);
    return { type, size, data };
}

function sizeBufferToNumber(buffer) {
    return Array.from(buffer).reverse().reduce((res, n, i) => res + n * 256 ** i, 0);
}


server.listen('127.0.0.1', 1234);
