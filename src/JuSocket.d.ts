'use strict';

const { Socket } = require('net');

export class JuSocket extends Socket {
    sendBuffer: (buffer: Buffer) => void
    waitForMessage: () => Promise<Buffer>
    sendBufferAndReceive: (buffer: Buffer) => Promise<Buffer>
}
