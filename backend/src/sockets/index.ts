import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { corsOptions } from '../config/cors';

export const initializeSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join-project', (projectId: string) => {
      socket.join(projectId);
      socket.to(projectId).emit('user-joined', { socketId: socket.id });
    });

    socket.on('cursor-change', ({ projectId, cursor }) => {
      socket.to(projectId).emit('remote-cursor', { socketId: socket.id, cursor });
    });

    socket.on('code-change', ({ projectId, fileId, content }) => {
      socket.to(projectId).emit('remote-code-change', { fileId, content });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

