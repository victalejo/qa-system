import express from 'express';
import User from '../models/User';
import Application from '../models/Application';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Obtener todos los usuarios QA (solo admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const qaUsers = await User.find({ role: 'qa' }).select('-password');
    res.json(qaUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios QA', error });
  }
});

// Obtener aplicaciones asignadas al QA actual
router.get('/my-applications', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const applications = await Application.find({
      assignedQAs: req.userId
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aplicaciones asignadas', error });
  }
});

export default router;
