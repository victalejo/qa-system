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

// Obtener perfil del usuario actual
router.get('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error });
  }
});

// Actualizar preferencias de notificación
router.patch('/preferences', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { email, whatsapp, whatsappNumber } = req.body;

    const updateData: any = {
      notificationPreferences: {
        email: email !== undefined ? email : true,
        whatsapp: whatsapp !== undefined ? whatsapp : true
      }
    };

    if (whatsappNumber !== undefined) {
      updateData.whatsappNumber = whatsappNumber;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Preferencias actualizadas', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar preferencias', error });
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
