// src/backend/server.js
// Load biến môi trường từ file .env ở thư mục gốc
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Import pool để khởi tạo kết nối sớm
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(express.json()); // Parse request body dạng JSON
app.use(express.urlencoded({ extended: true })); // Parse request body dạng form-urlencoded

// Routes cơ bản
app.get('/api', (req, res) => {
    res.json({ message: `Welcome to Game City API! DB: ${process.env.DB_NAME}` });
});

// Sử dụng Authentication Routes
app.use('/api/auth', authRoutes);

// Middleware xử lý lỗi (ví dụ)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`>>> Backend server is running on port ${PORT}`);
    // Log thêm tên DB để chắc chắn nó đang dùng đúng DB từ .env
    console.log(`>>> Connected to database: ${process.env.DB_NAME}`);
});