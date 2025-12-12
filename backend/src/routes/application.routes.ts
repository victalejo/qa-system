import express from 'express';
import Application from '../models/Application';
import VersionHistory from '../models/VersionHistory';
import { authMiddleware, adminOnly } from '../middleware/auth';
import notificationService from '../services/notificationService';

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

// Actualizar versión de la aplicación (solo admin)
router.patch('/:id/version', authMiddleware, adminOnly, async (req: any, res) => {
  try {
    const { version, changelog } = req.body;

    if (!version || !changelog) {
      return res.status(400).json({ message: 'Versión y changelog son requeridos' });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Aplicación no encontrada' });
    }

    const previousVersion = application.version || '0.0.0';

    // Crear registro en el historial de versiones
    const versionHistory = new VersionHistory({
      application: application._id,
      version,
      previousVersion,
      changelog,
      updatedBy: req.userId
    });

    await versionHistory.save();

    // Actualizar la versión de la aplicación
    application.version = version;
    await application.save();

    // Notificar a los QAs asignados
    await notificationService.notifyQAsVersionUpdate(
      application._id.toString(),
      previousVersion,
      version,
      changelog
    );

    res.json({
      application,
      versionHistory,
      message: 'Versión actualizada y notificaciones enviadas'
    });
  } catch (error) {
    console.error('Error al actualizar versión:', error);
    res.status(500).json({
      message: 'Error al actualizar versión',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Obtener historial de versiones de una aplicación
router.get('/:id/versions', authMiddleware, async (req, res) => {
  try {
    const versions = await VersionHistory.find({ application: req.params.id })
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(versions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial de versiones', error });
  }
});

export default router;
