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

function JuSocket(socket) {
    const proto = {
        sendBuffer,
        waitForMessage,
        sendBufferAndReceive,
    }
    Object.setPrototypeOf(proto, socket);

    const instance = new Object();
    Object.setPrototypeOf(instance, proto);

    return instance;
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

function parsePacketStart(buffer) {
    const type = buffer.slice(0, lengthes.type).toString();
    const size = sizeBufferToNumber(buffer.slice(lengthes.type, lengthes.type + lengthes.size));
    const data = buffer.slice(lengthes.type + lengthes.size, lengthes.type + lengthes.size + size);
    return { type, size, data };
}

function sizeBufferToNumber(buffer) {
    return Array.from(buffer).reverse().reduce((res, n, i) => res + n * 256 ** i, 0);
}

function sequenceToBuffer(sequence) {
    return sequence.reduce((res, { data }) => Buffer.concat([res, data]), Buffer.from(''));
}

function sendBuffer(buffer) {
    const packets = bufferToPackets(buffer);
    for (const packet of packets) {
        this.write(packet);
    }
}

async function waitForMessage() {
    const socket = this;
    let currentSequence;
    let currentPacket;
    let nextPacketData;

    return new Promise((resolve, reject) => {
        socket.on('data', buffer => {
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
                let sequenceDone = handlePacketDone(currentPacket);
                if (sequenceDone) {
                    resolve(sequenceToBuffer(currentSequence));
                }
            }

            socket.on('error', reject);
        });
    })

    function handlePacketDone(packet) {
        if (!packet) false;

        if (currentSequence) {
            if (packet.type === types.start) throw Error('Got start packet in the middle of a sequence');
            currentSequence.push(packet);
        } else {
            if (packet.type === types.middle) throw Error('Got middle packet at the start of a sequence');
            currentSequence = [packet];
        }

        currentPacket = nextPacketData ? parsePacketStart(nextPacketData) : undefined;
        nextPacketData = undefined;

        if (packet.type === types.end) {
            return true;
        } else {
            return handlePacketDone(currentPacket);
        }
    }
}

async function sendBufferAndReceive(buffer) {
    this.sendBuffer(buffer);
    return await this.waitForMessage();
}

module.exports = {
    JuSocket,
};
