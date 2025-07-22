const multer = require('multer');
const storage = multer.memoryStorage(); // dùng bộ nhớ tạm, không lưu file vào disk
const upload = multer({ storage });

module.exports = upload;
