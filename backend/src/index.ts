import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

import healthRouter from './routes/health';
import authRouter from './routes/auth';
import matchmakingRouter from './routes/matchmaking';
import { registerSocketHandlers, setMongoAvailable } from './socket/index';

const PORT = parseInt(process.env.PORT ?? '3000', 10);
const MONGODB_URI = process.env.MONGODB_URI ?? '';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:4200';

const app = express();
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/matchmaking', matchmakingRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});

registerSocketHandlers(io);

// Connect to MongoDB (optional)
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('[mongo] connected to', MONGODB_URI);
      setMongoAvailable(true);
    })
    .catch(err => {
      console.warn('[mongo] connection failed — running without persistence:', err.message);
    });
} else {
  console.warn('[mongo] MONGODB_URI not set — running without persistence');
}

server.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

export { app, server, io };
