// backend/knexfile.js
import 'dotenv/config';

export default {
    development: {
        client: 'pg',
        connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME
        },
        migrations: { directory: './src/db/migrations' },
        seeds: { directory: './src/db/seeds' }
    }
};
