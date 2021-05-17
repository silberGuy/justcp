# JusTCP

A simple way to send and receive buffers over tcp sockets, using promises, and without concerning sizes.

```js
const { JuSocket } = require('../JuSocket');

// Server

const server = net.createServer(async socket => {
    const sock = JuSocket(socket);
    while (1) {
        const req = await sock.waitForMessage();
        const response = await doServerLogic();
        sock.sendBuffer(response);
    }
});
server.listen('127.0.0.1', 1234);

// Client
(async function() {
    const socket = net.connect('127.0.0.1', 1234);
    const sock = JuSocket(socket);

    const response = await sock.sendBufferAndReceive(Buffer.from('Hello Server'));
    console.log(response.toString());
})();

```