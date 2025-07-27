let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', socket => {
    console.log('⚡ New client connected');

    // Lắng nghe khi client join room theo userId
    socket.on('join', userId => {
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} joined room user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected');
    });
  });
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
}

module.exports = { initSocket, getIO };
