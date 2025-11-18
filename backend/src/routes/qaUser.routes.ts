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

// Eliminar un usuario QA (solo admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe y es QA
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'qa') {
      return res.status(400).json({ message: 'Solo se pueden eliminar usuarios QA' });
    }

    // Eliminar el QA de las aplicaciones asignadas
    await Application.updateMany(
      { assignedQAs: id },
      { $pull: { assignedQAs: id } }
    );

    // Eliminar el usuario
    await User.findByIdAndDelete(id);

    res.json({ message: 'Usuario QA eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario QA', error });
  }
});

export default router;
