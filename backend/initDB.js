import fs from 'fs';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');

    // Run the entire SQL file as a single statement (PostgreSQL handles this fine)
    await db.query(sql);

    console.log('Database initialized successfully from init.sql!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
