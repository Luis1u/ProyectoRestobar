// config/db.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'RestobarSacur',
    password: process.env.DB_PASSWORD || 'uajms',
    port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
    console.log(' Conectado exitosamente a PostgreSQL');
});

export default pool;