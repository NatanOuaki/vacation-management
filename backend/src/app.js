import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import requestsRouter from './routes/requests.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());

// Prefix API
app.use('/api', requestsRouter);

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true }));

// Error handler (toujours en dernier)
app.use(errorHandler);

export default app;
