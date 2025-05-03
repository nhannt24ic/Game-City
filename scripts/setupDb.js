// scripts/setupDb.js
const mysql = require('mysql2/promise');

// --- Cấu hình kết nối MySQL ---
// Đọc từ .env nếu có, nếu không dùng giá trị mặc định của XAMPP
require('dotenv').config({ path: '../.env' }); // Load file .env từ thư mục gốc

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    // Database sẽ được chỉ định sau khi tạo/đảm bảo nó tồn tại
};

// Sử dụng tên DB là game_city_db
const dbName = process.env.DB_NAME || 'game_city_db';

// --- Định nghĩa SQL ---
const createDbSql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

const createUsersTableSql = `
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`email\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createGamesTableSql = `
CREATE TABLE IF NOT EXISTS \`games\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL UNIQUE,
  \`description\` TEXT NULL,
  \`cover_image_url\` VARCHAR(512) NULL,
  \`release_date\` DATE NULL,
  \`developer\` VARCHAR(255) NULL,
  \`publisher\` VARCHAR(255) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createPostsTableSql = `
CREATE TABLE IF NOT EXISTS \`posts\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NOT NULL,
  \`game_id\` INT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`content\` TEXT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`game_id\`) REFERENCES \`games\`(\`id\`) ON DELETE SET NULL,
  INDEX \`idx_post_user\` (\`user_id\`),
  INDEX \`idx_post_game\` (\`game_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createCommentsTableSql = `
CREATE TABLE IF NOT EXISTS \`comments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`user_id\` INT NOT NULL,
  \`post_id\` INT NOT NULL,
  \`content\` TEXT NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  FOREIGN KEY (\`post_id\`) REFERENCES \`posts\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_comment_user\` (\`user_id\`),
  INDEX \`idx_comment_post\` (\`post_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createGameUpdatesTableSql = `
CREATE TABLE IF NOT EXISTS \`game_updates\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`game_id\` INT NOT NULL,
  \`title\` VARCHAR(512) NOT NULL,
  \`content\` TEXT NULL,
  \`update_date\` DATE NULL,
  \`source_url\` VARCHAR(512) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`game_id\`) REFERENCES \`games\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_update_game\` (\`game_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

const createTournamentsTableSql = `
CREATE TABLE IF NOT EXISTS \`tournaments\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`game_id\` INT NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`description\` TEXT NULL,
  \`start_date\` DATETIME NULL,
  \`end_date\` DATETIME NULL,
  \`region\` VARCHAR(100) NULL,
  \`prize_pool\` VARCHAR(100) NULL,
  \`organizer\` VARCHAR(255) NULL,
  \`stream_url\` VARCHAR(512) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`game_id\`) REFERENCES \`games\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_tournament_game\` (\`game_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Hàm chính để thực thi việc setup
async function setupDatabase() {
    let initialConnection;
    let dbConnection;
    try {
        // 1. Kết nối ban đầu để tạo DB (nếu cần)
        console.log(`Connecting to MySQL server at ${dbConfig.host}...`);
        initialConnection = await mysql.createConnection(dbConfig);
        console.log('>>> Connected to MySQL server.');

        // 2. Tạo database nếu chưa tồn tại
        console.log(`Ensuring database \`${dbName}\` exists...`);
        await initialConnection.query(createDbSql);
        console.log(`>>> Database \`${dbName}\` ensured.`);
        await initialConnection.end();
        console.log('>>> Initial connection closed.');

        // 3. Kết nối vào database cụ thể
        console.log(`Connecting to database \`${dbName}\`...`);
        dbConnection = await mysql.createConnection({ ...dbConfig, database: dbName });
        console.log(`>>> Connected to database \`${dbName}\`.`);

        // 4. Tạo các bảng nếu chưa tồn tại
        console.log('Ensuring tables exist...');
        await dbConnection.query(createUsersTableSql); console.log('- Table `users` ensured.');
        await dbConnection.query(createGamesTableSql); console.log('- Table `games` ensured.');
        await dbConnection.query(createPostsTableSql); console.log('- Table `posts` ensured.');
        await dbConnection.query(createCommentsTableSql); console.log('- Table `comments` ensured.');
        await dbConnection.query(createGameUpdatesTableSql); console.log('- Table `game_updates` ensured.');
        await dbConnection.query(createTournamentsTableSql); console.log('- Table `tournaments` ensured.');

        console.log('\n*** Database and tables setup completed successfully! ***');

    } catch (error) {
        console.error('!!! Database setup failed:', error);
        process.exit(1);
    } finally {
        // Đảm bảo đóng các kết nối
        if (initialConnection && initialConnection.end) await initialConnection.end().catch(console.error);
        if (dbConnection && dbConnection.end) await dbConnection.end().catch(console.error);
        // Thêm log để chắc chắn hơn
        // console.log('>>> All potential connections closed.');
    }
}

// Chạy hàm setup
setupDatabase();