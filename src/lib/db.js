import mysql from 'mysql2/promise'

// ✅ CHANGE THESE VALUES as per your MySQL setup
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'SaeeBagul@2002',        
  database: 'store_rating_db',
  waitForConnections: true,
  connectionLimit: 10,
}

let pool = null

export function getDb() {
  if (!pool) {
    pool = mysql.createPool(dbConfig)
  }
  return pool
}

export async function initDb() {
  // First connect without database to create it if not exists
  const tempConn = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
  })

  await tempConn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
  )
  await tempConn.end()

  const db = getDb()

  // Users table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(400),
      role ENUM('admin','user','store_owner') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CHECK (CHAR_LENGTH(name) >= 20 AND CHAR_LENGTH(name) <= 60)
    )
  `)

  // Stores table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      address VARCHAR(400),
      owner_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  // Ratings table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      store_id INT NOT NULL,
      rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_store (user_id, store_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `)

  // Create default admin if not exists
  const [rows] = await db.execute(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`)
  if (rows.length === 0) {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.default.hash('Admin@123', 10)
    await db.execute(
      `INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)`,
      ['System Administrator User', 'admin@storerating.com', hash, '123 Admin Street, System City', 'admin']
    )
    console.log('✅ Default admin created: admin@storerating.com / Admin@123')
  }
}
