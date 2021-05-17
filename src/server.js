'use strict';

const net = require('net');

const server = net.createServer(async socket => {
    let currentPacket;
    let nextPacketData;

    for await (const buffer of socket) {
        if (!currentPacket) {
            currentPacket = parsePacketStart(buffer);
        } else {
            const data = buffer.slice(0, currentPacket.size - currentPacket.data.length);
            nextPacketData = buffer.slice(currentPacket.size - currentPacket.data.length, Infinity);

            currentPacket.data = Buffer.concat([
                currentPacket.data,
                data,
            ]);
        }

        if (currentPacket.data.length === currentPacket.size) {
            handlePacketDone(currentPacket);
        }
    }

    function handlePacketDone(packet) {
        if (!packet) return;

        console.log('done:', packet.data.toString());
        currentPacket = nextPacketData ? parsePacketStart(nextPacketData) : undefined;
        nextPacketData = undefined;
        handlePacketDone(currentPacket);
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
