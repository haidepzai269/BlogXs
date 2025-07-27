const app = require('./app');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc chỉnh lại đúng domain
    methods: ["GET", "POST"]
  }
});

// Lưu trữ danh sách user đang online
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New client connected 🟢');
  console.log('Socket connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });
  // Lắng nghe user đăng nhập
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Export để controller có thể dùng
app.set('io', io);
app.set('onlineUsers', onlineUsers);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
