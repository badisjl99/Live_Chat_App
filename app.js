const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const randomNames = [
  'ShadowLion', 'SilverPhoenix', 'CrimsonDragon', 'GoldenFalcon', 'EmeraldTiger',
  'SapphireWolf', 'RubyBear', 'DiamondCheetah', 'AmberJaguar', 'ObsidianPanther',
  'IvoryLeopard', 'OnyxGrizzly', 'TopazEagle', 'PlatinumHawk', 'BronzeLynx',
  'JadePuma', 'AzureGiraffe', 'CobaltKangaroo', 'OpalOstrich', 'QuartzKoala'
];

const randomColors = ['#FF5733', '#33FF57', '#5733FF', '#FF5733', '#33FF57',
  '#5733FF', '#FF5733', '#33FF57', '#5733FF', '#FF5733'];

// Map to track connected users
const connectedUsers = new Map();



io.on('connection', (socket) => {
    console.log('A user connected');
  
    const randomNameIndex = Math.floor(Math.random() * randomNames.length);
    const randomColorIndex = Math.floor(Math.random() * randomColors.length);
  
    const username = randomNames[randomNameIndex];
    const color = randomColors[randomColorIndex];
  
    // Add the connected user to the map
    connectedUsers.set(socket.id, { username, color });
  
    // Emit the updated list of connected users to all clients
    io.emit('update connected users', Array.from(connectedUsers.values()));
  
    // Emit the connected event to all clients
    io.emit('user connected', { username, color });
  
    socket.emit('assign user info', { username, color });
  
    socket.on('chat message', (data) => {
      io.emit('chat message', { ...data, sender: username, color, date: new Date().toISOString() });
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
      // Remove the disconnected user from the map
      connectedUsers.delete(socket.id);
      // Emit the updated list of connected users to all clients
      io.emit('update connected users', Array.from(connectedUsers.values()));
  
      // Emit the disconnected event to all clients
      io.emit('user disconnected', { username, color });
    });
  });
  
  // ... (existing code)
  
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
