const WebSocket = require('ws');
const os = require('os');
const { exec } = require('child_process');
const fs = require('fs'); //for os folder read

// Directory to read
const directoryPath = 'F:/assets/scripts/myrenderfarm/sequence1-10/';

// Define the husk command
const huskCommand = `"E:/Programmi3D/Houdini 20.5.278/bin/husk.exe" --output "F:/assets/scripts/myrenderfarm/sequence1-10/$F3.exr" --verbose 1 --frame 1 --frame-count 1 --renderer Karma "F:/assets/scripts/myrenderfarm/rop1.usd"`;

// Get the hostname of the machine
const hostname = os.hostname();

let ws;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10; // Maximum number of reconnection attempts
// const RECONNECT_DELAY = 5000; // Delay between reconnection attempts (5 seconds)
const RECONNECT_DELAY = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max delay of 30 seconds

function connect() {
    // ws = new WebSocket('ws://localhost:5173');
    ws = new WebSocket('wss://sheepfarm.onrender.com');

    ws.on('open', () => {
        console.log(`${hostname} - Connected to server`);
        reconnectAttempts = 0; // Reset reconnection attempts on successful connection

        // Send the hostname to the server when connecting
        ws.send(JSON.stringify({
            type: 'register',
            hostname: hostname
        }));

        // Read the directory
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                ws.send(JSON.stringify('Error reading directory:' + err ));
                return;
            }
            // Send the list of files to the server
            // ws.send(JSON.stringify({
            //     type: 'renderedFramesList',
            //     message: hostname + files
            // }));
            ws.send(JSON.stringify({
                type: 'consoleOutput',
                message: hostname + ' files: ' + files
            }));
            console.log('Sent file list to server:', files);
        });
    });

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        try {
            // Parse the incoming message as JSON
            const data = JSON.parse(message);

            if (data.type === 'renderingState') {
                if (data.isRendering === true) {
                    // Echo "startrender!" and execute the dir command
                    exec(`cmd.exe /c echo startrender! && ${huskCommand}`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`Stderr: ${stderr}`);
                            return;
                        }

                        // console.log(`Output:\n${stdout}`);
                        // Send the stdout back to the server
                        ws.send(JSON.stringify({
                            type: 'consoleOutput',
                            message: hostname + '> ' + stdout
                        }));
                    });
                } else if (data.isRendering === false) {
                    // Echo "stoprender!" and execute the dir command
                    exec(`cmd.exe /c echo stoprender!`, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`Error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.error(`Stderr: ${stderr}`);
                            return;
                        }

                        // console.log(`Output:\n${stdout}`);
                        // Send the stdout back to the server
                        ws.send(JSON.stringify({
                            type: 'consoleOutput',
                            message: hostname + '> ' + stdout
                        }));
                    });
                }
            }
            else if (data.type === 'clientList') {
                // console.log('Client list update:', data.clients);
            } else {
                // console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`Disconnected from server. Code: ${code}, Reason: ${reason}`);

        // Attempt to reconnect
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
            setTimeout(connect, RECONNECT_DELAY);
        } else {
            console.error('Max reconnection attempts reached. Giving up.');
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

// Start the initial connection, ADN ANY RECONNECTION WITH A DELAY
setTimeout(connect, RECONNECT_DELAY);