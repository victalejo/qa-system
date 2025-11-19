import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import applicationRoutes from './routes/application.routes';
import qaUserRoutes from './routes/qaUser.routes';
import bugReportRoutes from './routes/bugReport.routes';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: isProduction ? process.env.FRONTEND_URL || true : '*',
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Conectar a MongoDB
connectDB();

// Health check endpoint (debe estar antes de las rutas)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/qa-users', qaUserRoutes);
app.use('/api/bug-reports', bugReportRoutes);
app.use('/api/upload', uploadRoutes);

// Servir archivos estáticos del frontend en producción
if (isProduction) {
  const frontendPath = path.join(__dirname, '../frontend-dist');

  // Servir archivos estáticos
  app.use(express.static(frontendPath));

  // Fallback para SPA routing - cualquier ruta que no sea /api o /health
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && req.path !== '/health') {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ message: 'Endpoint no encontrado' });
    }
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'QA Bug Tracking System API' });
  });
}

// Listen on 0.0.0.0 for Docker compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
});
