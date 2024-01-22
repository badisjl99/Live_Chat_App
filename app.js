const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

  const randomNames = [
    'ShadowLion', 'SilverPhoenix', 'CrimsonDragon', 'GoldenFalcon', 'EmeraldTiger',
    'SapphireWolf', 'RubyBear', 'DiamondCheetah', 'AmberJaguar', 'ObsidianPanther',
    'IvoryLeopard', 'OnyxGrizzly', 'TopazEagle', 'PlatinumHawk', 'BronzeLynx',
    'JadePuma', 'AzureGiraffe', 'CobaltKangaroo', 'OpalOstrich', 'QuartzKoala',
    'VelvetVulture', 'SteelRaven', 'CopperFerret', 'CeruleanSparrow', 'BrassHummingbird',
  'VermilionSwan', 'IridescentPelican', 'ZephyrPenguin', 'LunarAlbatross', 'SolarCrow',
  'ThunderHawk', 'MysticOsprey', 'CosmicCondor', 'AbyssalSwift', 'NovaOwl',
  'CelestialParrot', 'RogueRoc', 'EtherealRobin', 'VividPuffin', 'GildedGull'

  ];

  const randomColors = ['#FF5733', '#33FF57', '#5733FF', '#FF5733', '#33FF57',
  '#5733FF', '#FF5733', '#33FF57', '#5733FF', '#FF5733', '#0099FF', '#FF66CC',
  '#66FF66', '#FF9900', '#9966FF', '#FF3333', '#33CC33', '#FFCC00', '#6699FF', '#FF3366'
];
const connectedUsers = new Map();

function generateUniqueColor() {
    const existingColors = new Set(Array.from(connectedUsers.values()).map(user => user.color));
    const availableColors = randomColors.filter(color => !existingColors.has(color));
    return availableColors[Math.floor(Math.random() * availableColors.length)];
}



io.on('connection', (socket) => {
  console.log('A user connected');

  const randomNameIndex = Math.floor(Math.random() * randomNames.length);
  const username = randomNames[randomNameIndex];

  const color = generateUniqueColor();

  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

  if (connectedUsers.has(clientIp)) {

      socket.emit('connectionRejected');
      socket.disconnect(true);
      return;
  }

  connectedUsers.set(clientIp, { username, color });

  io.emit('update connected users', Array.from(connectedUsers.values()));

  io.emit('user connected', { username, color });

  socket.emit('assign user info', { username, color });

  socket.on('chat message', (data) => {
      io.emit('chat message', { ...data, sender: username, color, date: new Date().toISOString() });
  });
  
  socket.on('audio message', (data) => {
    io.emit('audio message', data);
});
  
    socket.on('disconnect', () => {

      connectedUsers.delete(clientIp);
      io.emit('update connected users', Array.from(connectedUsers.values()));

      io.emit('user disconnected', { username, color });
  });
});
  

app.post('/upload', upload.single('image'), (req, res) => {
  const imageData = req.file.buffer.toString('base64');
  io.emit('image message', { imageData, sender: username, color, date: new Date().toISOString() });
  res.sendStatus(200);
});



server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});