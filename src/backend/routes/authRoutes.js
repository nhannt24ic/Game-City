// src/backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController'); // Import controller

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

module.exports = router;