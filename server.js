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
    const uid = String(userId); // ✅ luôn là chuỗi
    socket.join(`user_${uid}`);
    onlineUsers.set(uid, socket.id); // Key nhất quán
    console.log(`✅ User ${uid} joined room user_${uid} with socket ${socket.id}`);
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
// Gắn io vào mọi request
app.use((req, res, next) => {
  req.io = io;
  next();
});
// Export để controller có thể dùng
app.set('io', io);
app.set('onlineUsers', onlineUsers);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});