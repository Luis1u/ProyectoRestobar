// config/db.js
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'RestobarSacur',
    password: process.env.DB_PASSWORD || 'uajms',
    port: process.env.DB_PORT || 5432,
   max: 10,                    // Máximo de conexiones abiertas simultáneamente
  idleTimeoutMillis: 600000,   // Libera conexiones inactivas de 10 min
  connectionTimeoutMillis: 5000 // Cancela peticiones que esperen más de 2 segundos
});

pool.on('connect', () => {
    console.log(' Conectado exitosamente a PostgreSQL');
});

export default pool;