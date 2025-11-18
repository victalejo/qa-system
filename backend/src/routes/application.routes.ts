import express from 'express';
import Application from '../models/Application';
import { authMiddleware, adminOnly } from '../middleware/auth';

const router = express.Router();

// Obtener todas las aplicaciones
router.get('/', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find().populate('assignedQAs', 'name email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener aplicaciones', error });
  }
});

// Crear aplicación (solo admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, version, platform, assignedQAs } = req.body;

    const application = new Application({
      name,
      description,
      version,
      platform,
      assignedQAs: assignedQAs || []
    });

    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear aplicación', error });
  }
});

// Actualizar aplicación (solo admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, description, version, platform, assignedQAs } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { name, description, version, platform, assignedQAs },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Aplicación no encontrada' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar aplicación', error });
  }
});

// Eliminar aplicación (solo admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Aplicación no encontrada' });
    }

    res.json({ message: 'Aplicación eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar aplicación', error });
  }
});

export default router;
