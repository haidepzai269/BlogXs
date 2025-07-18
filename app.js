const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const profileRoutes = require('./routes/profile.routes');
const userRoutes = require('./routes/users.routes');
const likeRoutes = require('./routes/likes.routes');
const userHoverRoutes = require('./routes/users.routes');




const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Phục vụ frontend (nếu cần)
app.use(express.static(path.join(__dirname, './Du-an-FE')));
// Khi vào trang gốc "/", trả về file auth.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './Du-an-FE/auth.html'));
  });
  
// Cấu hình public static folder
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes); // <- Cẩn thận trùng lặp
app.use('/api', likeRoutes);
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/users', userHoverRoutes); // hoặc route khác, nếu bạn muốn tách biệt

module.exports = app;
