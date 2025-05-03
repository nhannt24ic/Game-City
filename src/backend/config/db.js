// src/backend/config/db.js
const mysql = require('mysql2/promise');
// Load biến môi trường từ file .env ở thư mục gốc dự án

// Tạo connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // Lấy tên DB từ .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối ban đầu
pool.getConnection()
    .then(connection => {
        console.log(`>>> MySQL Database '${process.env.DB_NAME}' connected successfully!`);
        connection.release();
    })
    .catch(err => {
        console.error(`!!! MySQL Database connection failed for database '${process.env.DB_NAME}':`, err);
        // Có thể không cần thoát ở đây, để server cố gắng khởi động
        // process.exit(1);
    });

module.exports = pool;