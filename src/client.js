'use strict';

const net = require('net');
const { JusSocket } = require('./socket');

const socket = net.connect('127.0.0.1', 1234);
const jusSock = JusSocket(socket);

jusSock.sendBuffer(Buffer.from('Hello Server'));
jusSock.sendBuffer(Buffer.from('Hello Again'));