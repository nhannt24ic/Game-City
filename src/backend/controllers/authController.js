// src/backend/controllers/authController.js
const User = require('../models/User'); // Import model
const jwt = require('jsonwebtoken');
// Không cần dotenv ở đây vì JWT_SECRET đã load ở server.js và được truy cập qua process.env

exports.registerUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }
     if (password.length < 6) {
         return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    // Thêm validate email nếu cần

    try {
        // Kiểm tra tồn tại
        const existingUser = await User.findByEmail(email) || await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already exists.' });
        }

        // Tạo user
        const newUser = await User.create(username, email, password);

        // Phản hồi (không trả về token khi đăng ký)
        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser // Trả về thông tin user vừa tạo (không có pass)
        });

    } catch (error) {
        console.error("Registration Error:", error);
         if (error.message === 'Username or Email already exists.') {
            return res.status(400).json({ message: error.message });
         }
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Tìm user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Lỗi chung chung
        }

        // So sánh pass
        const isMatch = await User.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' }); // Lỗi chung chung
        }

        // Tạo JWT
        const payload = { user: { id: user.id } };
        const secret = process.env.JWT_SECRET;
        const options = { expiresIn: process.env.JWT_EXPIRES_IN || '1h' };

        if (!secret) {
             console.error("FATAL ERROR: JWT_SECRET is not defined.");
             return res.status(500).json({ message: "Server configuration error."});
        }

        jwt.sign(payload, secret, options, (err, token) => {
            if (err) throw err;
            res.json({
                message: 'Login successful!',
                token: token,
                user: { // Trả về thông tin user cơ bản
                     id: user.id,
                     username: user.username,
                     email: user.email
                }
            });
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};