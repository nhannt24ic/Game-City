// src/backend/models/User.js
const pool = require('../config/db.js'); // Import connection pool
const bcrypt = require('bcrypt');

const User = {
    // Tìm user bằng email
    async findByEmail(email) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM `users` WHERE `email` = ? LIMIT 1',
                [email]
            );
            return rows[0];
        } catch (error) {
            console.error("Error finding user by email:", error);
            throw error;
        }
    },

    // Tìm user bằng username
    async findByUsername(username) {
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM `users` WHERE `username` = ? LIMIT 1',
                [username]
            );
            return rows[0];
        } catch (error) {
            console.error("Error finding user by username:", error);
            throw error;
        }
    },

    // Tìm user bằng ID (không lấy password)
    async findById(id) {
         try {
            const [rows] = await pool.execute(
                'SELECT id, username, email, created_at FROM `users` WHERE `id` = ? LIMIT 1',
                [id]
            );
            return rows[0];
        } catch (error) {
            console.error("Error finding user by id:", error);
            throw error;
        }
    },

    // Tạo user mới
    async create(username, email, password) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const [result] = await pool.execute(
                'INSERT INTO `users` (`username`, `email`, `password`) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );
            return { id: result.insertId, username, email }; // Trả về user mới (no pass)
        } catch (error) {
            console.error("Error creating user:", error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Username or Email already exists.');
            }
            throw error;
        }
    },

     // So sánh mật khẩu
     async comparePassword(plainPassword, hashedPassword) {
        try {
             return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error("Error comparing password:", error);
            throw error;
        }
    }
};

module.exports = User;