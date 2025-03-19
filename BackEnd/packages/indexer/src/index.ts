import { fork } from 'child_process';
import path from 'path';

console.log('Starting server and processor in parallel...');

const serverPath = path.join(__dirname, 'server.js');
const processorPath = path.join(__dirname, 'processor.js');

fork(serverPath);
fork(processorPath);
