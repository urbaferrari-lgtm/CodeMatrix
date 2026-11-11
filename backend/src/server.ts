import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { initializeSocketIO } from './sockets';
import { EmailService } from './services/email.service';

const startServer = async () => {
  const server = http.createServer(app);

  // Initialize Socket.IO
  initializeSocketIO(server);

  const PORT = Number(env.PORT) || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 CodeMatrix Backend running at http://localhost:${PORT}`);
    console.log(`📡 Socket.IO server online on port ${PORT}`);
    console.log(`🩺 Health check ready at http://localhost:${PORT}/api/health`);
  });

  // Connect to Database asynchronously so server starts right away
  connectDatabase().catch((err) => {
    console.warn('⚠️ MongoDB connecting in background or offline in dev mode:', err.message);
  });

  if (EmailService.isConfigured) {
    EmailService.verifyConnection()
      .then(() => console.log('📧 Gmail OAuth2 email service is ready'))
      .catch((err: Error) => console.error('Gmail OAuth2 email verification failed:', err.message));
  }
};

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
