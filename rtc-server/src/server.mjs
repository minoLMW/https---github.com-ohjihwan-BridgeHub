import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import rtcRoutes from './routes/rtcRoutes.mjs';
import { handleSocketEvents } from './signaling/index.mjs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/rtc', rtcRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  handleSocketEvents(io, socket); // 단일 핸들러 호출
});

const PORT = 7600;
httpServer.listen(PORT, () => {
  console.log(`✅ RTC 서버 실행 중: http://localhost:${PORT}`);
});
