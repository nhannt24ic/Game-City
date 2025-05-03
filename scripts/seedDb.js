// scripts/seedDb.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Cần bcrypt để băm mật khẩu mẫu
require('dotenv').config({ path: '../.env' }); // Load .env từ thư mục gốc

// --- Cấu hình DB (giống setupDb.js) ---
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'game_city_db', // Phải kết nối vào DB đã tạo
};

// --- Dữ liệu người dùng mẫu ---
// Quan trọng: Mật khẩu ở đây là mật khẩu gốc, script sẽ băm nó trước khi lưu
const sampleUsers = [
    { username: 'admin', email: 'admin@example.com', plainPassword: 'password123' },
    { username: 'tester', email: 'tester@example.com', plainPassword: 'password456' }
    // Thêm user mẫu khác nếu muốn
];

// Hàm chính để seed dữ liệu
async function seedDatabase() {
    let connection;
    console.log('Starting database seeding...');

    // Kiểm tra biến môi trường cơ bản
    if (!dbConfig.database) {
        console.error('!!! Error: DB_NAME is not defined in your .env file.');
        process.exit(1);
    }

    try {
        console.log(`Connecting to database \`${dbConfig.database}\`...`);
        connection = await mysql.createConnection(dbConfig);
        console.log('>>> Connected successfully!');

        const saltRounds = 10; // Giống như khi đăng ký user thật

        // Lặp qua từng user mẫu
        for (const user of sampleUsers) {
            try {
                // Băm mật khẩu
                const hashedPassword = await bcrypt.hash(user.plainPassword, saltRounds);
                console.log(`- Hashing password for ${user.username}...`);

                // Chèn user vào DB, sử dụng INSERT IGNORE để bỏ qua nếu username/email đã tồn tại
                // Hoặc có thể kiểm tra SELECT trước nếu muốn thông báo rõ hơn
                const [result] = await connection.execute(
                    'INSERT IGNORE INTO `users` (`username`, `email`, `password`) VALUES (?, ?, ?)',
                    [user.username, user.email, hashedPassword]
                );

                if (result.affectedRows > 0) {
                     console.log(`  -> User '${user.username}' seeded successfully (ID: ${result.insertId}).`);
                } else {
                     console.log(`  -> User '${user.username}' or email '${user.email}' likely already exists, skipping.`);
                }

            } catch (userError) {
                // Ghi log lỗi cho từng user nhưng vẫn tiếp tục với user khác
                console.error(`!!! Error seeding user '${user.username}':`, userError.message);
            }
        }

        // (Tùy chọn) Seed dữ liệu cho các bảng khác (games, posts,...) nếu cần

        console.log('\n*** Database seeding process completed! ***');

    } catch (error) {
        console.error('!!! Database seeding failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('>>> Database connection closed.');
        }
    }
}

// Chạy hàm seed
seedDatabase();