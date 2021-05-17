'use strict';

const lengthes = {
    size: 4,
    type: 1,
};

const types = {
    start: 's',
    middle: 'm',
    end: 'e',
}

const maxPacketSize = 256 * 256 * 256 * 256 - 1;

function JusSocket(socket) {
    const proto = {
        sendBuffer,
    }
    Object.setPrototypeOf(proto, socket);

    const instance = new Object();
    Object.setPrototypeOf(instance, proto);

    return instance;
}

function sendBuffer(buffer) {
    console.log(buffer);
    const packets = bufferToPackets(buffer);
    for (const packet of packets) {
        this.write(packet);
    }
}

function bufferToPackets(buffer) {
    const packetsDescriptors = [];
    for (let index = 0; index < buffer.length; index += maxPacketSize) {
        packetsDescriptors.push({
            size: Math.min(buffer.length - index, maxPacketSize),
            type: types.middle,
            content: buffer.slice(index, index + maxPacketSize)
        });
    }

    if (!packetsDescriptors.length) {
        return [];
    }

    packetsDescriptors[0].type = types.start;
    packetsDescriptors[packetsDescriptors.length - 1].type = types.end;

    return packetsDescriptors.map(({ size, type, content }) => Buffer.concat([
        Buffer.from(type),
        numberToSizeBuffer(size),
        content,
    ]));
}

function numberToSizeBuffer(n) {
    let b = new ArrayBuffer(4);
    new DataView(b).setUint32(0, n);
    return Buffer.from(new Uint8Array(b));  
}

module.exports = {
    JusSocket,
};
